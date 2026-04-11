######################################################################
# Contact Form — AWS infrastructure
#
# Creates:
#   - IAM role for the contact Lambda (SES SendEmail only)
#   - Lambda function (Node.js 22, zip-deployed)
#   - API Gateway REST API (public — no auth required)
#       POST /contact  → contact Lambda
#       OPTIONS /contact → CORS preflight (MOCK, no auth)
#   - CloudWatch Log Group for API access logs
#
# The API URL is exported as `contact_api_url` and injected into the
# Next.js build as NEXT_PUBLIC_CONTACT_API_URL by the deploy workflow.
######################################################################

# ─────────────────────────────────────────────
# IAM — Lambda execution role (least privilege)
# ─────────────────────────────────────────────

resource "aws_iam_role" "lambda_contact" {
  name               = "${var.project}-${var.environment}-lambda-contact"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

resource "aws_iam_role_policy_attachment" "lambda_contact_logs" {
  role       = aws_iam_role.lambda_contact.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "lambda_contact_ses" {
  name = "contact-ses-send"
  role = aws_iam_role.lambda_contact.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["ses:SendEmail", "ses:SendRawEmail"]
      Resource = "*"
    }]
  })
}

# ─────────────────────────────────────────────
# Lambda function
# ─────────────────────────────────────────────

data "archive_file" "contact_zip" {
  type        = "zip"
  source_dir  = "${path.root}/../cms/lambda/contact"
  output_path = "${path.module}/lambda-zips/contact.zip"
}

resource "aws_lambda_function" "contact" {
  function_name    = "${var.project}-${var.environment}-contact"
  role             = aws_iam_role.lambda_contact.arn
  runtime          = "nodejs22.x"
  handler          = "index.handler"
  filename         = data.archive_file.contact_zip.output_path
  source_code_hash = data.archive_file.contact_zip.output_base64sha256
  timeout          = 10

  environment {
    variables = {
      # From address must be within the SES-verified domain.
      FROM_EMAIL      = "noreply@${var.ses_domain}"
      TO_EMAIL        = var.contact_to_email
      # Allow submissions from the live site and (in dev) the CloudFront default domain.
      ALLOWED_ORIGINS = join(",", compact([
        "https://www.augustinehomeimprovements.com",
        "https://augustinehomeimprovements.com",
        "https://${aws_cloudfront_distribution.site.domain_name}",
      ]))
    }
  }
}

resource "aws_cloudwatch_log_group" "contact_lambda" {
  name              = "/aws/lambda/${aws_lambda_function.contact.function_name}"
  retention_in_days = 30
}

# ─────────────────────────────────────────────
# API Gateway — public REST API for contact form
# ─────────────────────────────────────────────

resource "aws_api_gateway_rest_api" "contact" {
  name        = "${var.project}-${var.environment}-contact-api"
  description = "Augustine contact form API (public)"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

# /contact resource

resource "aws_api_gateway_resource" "contact" {
  rest_api_id = aws_api_gateway_rest_api.contact.id
  parent_id   = aws_api_gateway_rest_api.contact.root_resource_id
  path_part   = "contact"
}

# POST /contact — Lambda proxy integration, no auth

resource "aws_api_gateway_method" "contact_post" {
  rest_api_id   = aws_api_gateway_rest_api.contact.id
  resource_id   = aws_api_gateway_resource.contact.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "contact_post" {
  rest_api_id             = aws_api_gateway_rest_api.contact.id
  resource_id             = aws_api_gateway_resource.contact.id
  http_method             = aws_api_gateway_method.contact_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${var.aws_region}:lambda:path/2015-03-31/functions/${aws_lambda_function.contact.arn}/invocations"
}

# OPTIONS /contact — CORS preflight (MOCK, no auth)

resource "aws_api_gateway_method" "contact_options" {
  rest_api_id   = aws_api_gateway_rest_api.contact.id
  resource_id   = aws_api_gateway_resource.contact.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "contact_options" {
  rest_api_id = aws_api_gateway_rest_api.contact.id
  resource_id = aws_api_gateway_resource.contact.id
  http_method = aws_api_gateway_method.contact_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "contact_options_200" {
  rest_api_id = aws_api_gateway_rest_api.contact.id
  resource_id = aws_api_gateway_resource.contact.id
  http_method = aws_api_gateway_method.contact_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "contact_options_200" {
  rest_api_id = aws_api_gateway_rest_api.contact.id
  resource_id = aws_api_gateway_resource.contact.id
  http_method = aws_api_gateway_method.contact_options.http_method
  status_code = aws_api_gateway_method_response.contact_options_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  depends_on = [aws_api_gateway_integration.contact_options]
}

# Allow API Gateway to invoke the Lambda

resource "aws_lambda_permission" "contact_api_gw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.contact.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${var.aws_region}:${data.aws_caller_identity.current.account_id}:${aws_api_gateway_rest_api.contact.id}/*/*"
}

# Deployment

resource "aws_api_gateway_deployment" "contact" {
  rest_api_id = aws_api_gateway_rest_api.contact.id

  triggers = {
    redeploy_hash = sha1(jsonencode([
      aws_api_gateway_method.contact_post,
      aws_api_gateway_integration.contact_post,
      aws_api_gateway_method.contact_options,
      aws_api_gateway_integration.contact_options,
      aws_api_gateway_integration_response.contact_options_200,
    ]))
  }

  lifecycle { create_before_destroy = true }

  depends_on = [
    aws_api_gateway_method.contact_post,
    aws_api_gateway_integration.contact_post,
    aws_api_gateway_method.contact_options,
    aws_api_gateway_integration.contact_options,
    aws_api_gateway_integration_response.contact_options_200,
  ]
}

resource "aws_cloudwatch_log_group" "contact_api" {
  name              = "/aws/apigateway/${var.project}-${var.environment}-contact"
  retention_in_days = 30
}

resource "aws_api_gateway_stage" "contact" {
  deployment_id = aws_api_gateway_deployment.contact.id
  rest_api_id   = aws_api_gateway_rest_api.contact.id
  stage_name    = var.environment

  # Re-use the account-level CloudWatch role provisioned in cms.tf
  depends_on = [aws_api_gateway_account.main]

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.contact_api.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      resourcePath   = "$context.resourcePath"
      status         = "$context.status"
      responseLength = "$context.responseLength"
      ip             = "$context.identity.sourceIp"
      errorMessage   = "$context.error.message"
    })
  }
}
