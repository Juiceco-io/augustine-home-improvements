######################################################################
# Analytics — AWS infrastructure
#
# Creates:
#   - S3 bucket: augustine-logs-{env} (CloudFront access logs, 365-day TTL)
#   - DynamoDB table: augustine-{project}-{env}-analytics (PAY_PER_REQUEST, TTL 1yr)
#   - Lambda: analytics-ingest  — public POST /analytics  (no auth)
#   - Lambda: analytics-query   — Cognito GET /analytics  (admin only)
#   - API Gateway routes on the existing CMS REST API
#       POST    /analytics → analytics-ingest
#       GET     /analytics → analytics-query (Cognito authorizer)
#       OPTIONS /analytics → CORS preflight (MOCK, no auth)
######################################################################

# ─────────────────────────────────────────────
# S3 — Access log bucket (CloudFront standard logs)
# ─────────────────────────────────────────────

locals {
  access_logs_bucket_name = "augustine-logs-${var.environment}-${random_id.bucket_suffix.hex}"
}

resource "aws_s3_bucket" "access_logs" {
  bucket = local.access_logs_bucket_name
}

# CloudFront log delivery requires ACLs to be enabled — set ObjectWriter
# so the awslogdelivery canonical user can write log objects.
resource "aws_s3_bucket_ownership_controls" "access_logs" {
  bucket = aws_s3_bucket.access_logs.id
  rule {
    object_ownership = "ObjectWriter"
  }
}

# Allow ACLs on the bucket (required for CF log delivery canonical user grant)
resource "aws_s3_bucket_public_access_block" "access_logs" {
  depends_on = [aws_s3_bucket_ownership_controls.access_logs]
  bucket     = aws_s3_bucket.access_logs.id

  block_public_acls       = false # Required: CF log delivery uses a canonical-user ACL grant
  block_public_policy     = true  # No public bucket policy allowed
  ignore_public_acls      = false # Must be false to honour the log delivery grant
  restrict_public_buckets = false # Must be false or CF log delivery is blocked
}

# Grant the CloudFront log delivery service FULL_CONTROL on the bucket.
# Canonical user ID is obtained via the built-in data source.
data "aws_cloudfront_log_delivery_canonical_user_id" "cf" {}
data "aws_canonical_user_id" "current" {}

resource "aws_s3_bucket_acl" "access_logs" {
  depends_on = [
    aws_s3_bucket_ownership_controls.access_logs,
    aws_s3_bucket_public_access_block.access_logs,
  ]
  bucket = aws_s3_bucket.access_logs.id

  access_control_policy {
    grant {
      grantee {
        id   = data.aws_cloudfront_log_delivery_canonical_user_id.cf.id
        type = "CanonicalUser"
      }
      permission = "FULL_CONTROL"
    }
    owner {
      id = data.aws_canonical_user_id.current.id
    }
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "access_logs" {
  bucket = aws_s3_bucket.access_logs.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Lifecycle: move to IA after 30 days, expire after 365 days
resource "aws_s3_bucket_lifecycle_configuration" "access_logs" {
  bucket = aws_s3_bucket.access_logs.id

  rule {
    id     = "expire-logs"
    status = "Enabled"

    # Empty filter = apply to all objects in the bucket
    filter {}

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    expiration {
      days = 365
    }
  }
}

# ─────────────────────────────────────────────
# DynamoDB — Analytics event table
# ─────────────────────────────────────────────

resource "aws_dynamodb_table" "analytics" {
  name         = "${var.project}-${var.environment}-analytics"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "pk"   # YYYY-MM-DD date string
  range_key    = "sk"   # {eventType}#{timestamp_ms}#{random_hex}

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }

  attribute {
    name = "eventType"
    type = "S"
  }

  # GSI for querying all events of a given type across dates
  global_secondary_index {
    name            = "eventType-pk-index"
    hash_key        = "eventType"
    range_key       = "pk"
    projection_type = "ALL"
  }

  # Auto-delete items after 1 year via TTL
  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

# ─────────────────────────────────────────────
# IAM — analytics-ingest Lambda role (PutItem only)
# ─────────────────────────────────────────────

resource "aws_iam_role" "lambda_analytics_ingest" {
  name               = "${var.project}-${var.environment}-lambda-analytics-ingest"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

resource "aws_iam_role_policy_attachment" "lambda_analytics_ingest_logs" {
  role       = aws_iam_role.lambda_analytics_ingest.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "lambda_analytics_ingest_dynamo" {
  name = "analytics-ingest-dynamodb"
  role = aws_iam_role.lambda_analytics_ingest.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["dynamodb:PutItem"]
      Resource = aws_dynamodb_table.analytics.arn
    }]
  })
}

# ─────────────────────────────────────────────
# IAM — analytics-query Lambda role (Query + Scan only)
# ─────────────────────────────────────────────

resource "aws_iam_role" "lambda_analytics_query" {
  name               = "${var.project}-${var.environment}-lambda-analytics-query"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

resource "aws_iam_role_policy_attachment" "lambda_analytics_query_logs" {
  role       = aws_iam_role.lambda_analytics_query.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "lambda_analytics_query_dynamo" {
  name = "analytics-query-dynamodb"
  role = aws_iam_role.lambda_analytics_query.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["dynamodb:Query", "dynamodb:Scan"]
      Resource = [
        aws_dynamodb_table.analytics.arn,
        "${aws_dynamodb_table.analytics.arn}/index/*",
      ]
    }]
  })
}

# ─────────────────────────────────────────────
# Lambda functions (zip-deployed, Node.js 22, ES modules)
# ─────────────────────────────────────────────

locals {
  analytics_allowed_origins = join(",", compact([
    "https://www.augustinehomeimprovements.com",
    "https://augustinehomeimprovements.com",
    "https://${aws_cloudfront_distribution.site.domain_name}",
  ]))
}

data "archive_file" "analytics_ingest_zip" {
  type        = "zip"
  source_dir  = "${path.root}/../cms/lambda/analytics-ingest"
  output_path = "${path.module}/lambda-zips/analytics-ingest.zip"
}

data "archive_file" "analytics_query_zip" {
  type        = "zip"
  source_dir  = "${path.root}/../cms/lambda/analytics-query"
  output_path = "${path.module}/lambda-zips/analytics-query.zip"
}

resource "aws_lambda_function" "analytics_ingest" {
  function_name    = "${var.project}-${var.environment}-analytics-ingest"
  role             = aws_iam_role.lambda_analytics_ingest.arn
  runtime          = "nodejs22.x"
  handler          = "index.handler"
  filename         = data.archive_file.analytics_ingest_zip.output_path
  source_code_hash = data.archive_file.analytics_ingest_zip.output_base64sha256
  timeout          = 5

  environment {
    variables = {
      ANALYTICS_TABLE = aws_dynamodb_table.analytics.name
      ALLOWED_ORIGINS = local.analytics_allowed_origins
    }
  }
}

resource "aws_lambda_function" "analytics_query" {
  function_name    = "${var.project}-${var.environment}-analytics-query"
  role             = aws_iam_role.lambda_analytics_query.arn
  runtime          = "nodejs22.x"
  handler          = "index.handler"
  filename         = data.archive_file.analytics_query_zip.output_path
  source_code_hash = data.archive_file.analytics_query_zip.output_base64sha256
  timeout          = 15

  environment {
    variables = {
      ANALYTICS_TABLE = aws_dynamodb_table.analytics.name
      ALLOWED_ORIGINS = local.cms_allowed_origins
    }
  }
}

resource "aws_cloudwatch_log_group" "analytics_ingest" {
  name              = "/aws/lambda/${aws_lambda_function.analytics_ingest.function_name}"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "analytics_query" {
  name              = "/aws/lambda/${aws_lambda_function.analytics_query.function_name}"
  retention_in_days = 30
}

# ─────────────────────────────────────────────
# API Gateway — /analytics resource on existing CMS API
# ─────────────────────────────────────────────

resource "aws_api_gateway_resource" "analytics" {
  rest_api_id = aws_api_gateway_rest_api.cms.id
  parent_id   = aws_api_gateway_rest_api.cms.root_resource_id
  path_part   = "analytics"
}

# ── POST /analytics — public, no auth → analytics-ingest Lambda ──

resource "aws_api_gateway_method" "analytics_post" {
  rest_api_id   = aws_api_gateway_rest_api.cms.id
  resource_id   = aws_api_gateway_resource.analytics.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "analytics_post" {
  rest_api_id             = aws_api_gateway_rest_api.cms.id
  resource_id             = aws_api_gateway_resource.analytics.id
  http_method             = aws_api_gateway_method.analytics_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${var.aws_region}:lambda:path/2015-03-31/functions/${aws_lambda_function.analytics_ingest.arn}/invocations"
}

resource "aws_lambda_permission" "analytics_ingest_api_gw" {
  statement_id  = "AllowAPIGatewayInvoke-analytics-ingest"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.analytics_ingest.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${var.aws_region}:${data.aws_caller_identity.current.account_id}:${aws_api_gateway_rest_api.cms.id}/*/*"
}

# ── GET /analytics — Cognito-protected → analytics-query Lambda ──

resource "aws_api_gateway_method" "analytics_get" {
  rest_api_id   = aws_api_gateway_rest_api.cms.id
  resource_id   = aws_api_gateway_resource.analytics.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "analytics_get" {
  rest_api_id             = aws_api_gateway_rest_api.cms.id
  resource_id             = aws_api_gateway_resource.analytics.id
  http_method             = aws_api_gateway_method.analytics_get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${var.aws_region}:lambda:path/2015-03-31/functions/${aws_lambda_function.analytics_query.arn}/invocations"
}

resource "aws_lambda_permission" "analytics_query_api_gw" {
  statement_id  = "AllowAPIGatewayInvoke-analytics-query"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.analytics_query.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${var.aws_region}:${data.aws_caller_identity.current.account_id}:${aws_api_gateway_rest_api.cms.id}/*/*"
}

# ── OPTIONS /analytics — CORS preflight (MOCK, no auth) ──

resource "aws_api_gateway_method" "analytics_options" {
  rest_api_id   = aws_api_gateway_rest_api.cms.id
  resource_id   = aws_api_gateway_resource.analytics.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "analytics_options" {
  rest_api_id = aws_api_gateway_rest_api.cms.id
  resource_id = aws_api_gateway_resource.analytics.id
  http_method = aws_api_gateway_method.analytics_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "analytics_options_200" {
  rest_api_id = aws_api_gateway_rest_api.cms.id
  resource_id = aws_api_gateway_resource.analytics.id
  http_method = aws_api_gateway_method.analytics_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "analytics_options_200" {
  rest_api_id = aws_api_gateway_rest_api.cms.id
  resource_id = aws_api_gateway_resource.analytics.id
  http_method = aws_api_gateway_method.analytics_options.http_method
  status_code = aws_api_gateway_method_response.analytics_options_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Authorization,Content-Type'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  depends_on = [aws_api_gateway_integration.analytics_options]
}
