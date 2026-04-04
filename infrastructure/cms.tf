######################################################################
# Augustine CMS — AWS infrastructure (v1)
#
# Creates:
#   - S3 bucket: augustine-config-{env} (stores site-config.json)
#   - S3 bucket: augustine-media-{env}  (stores uploaded images)
#   - CloudFront distribution: cdn.augustinehomeimprovements.com
#       /config/* → config bucket, TTL 60s
#       /uploads/* → media bucket, TTL 24h
#   - Cognito User Pool + App Client (auth for admin SPA)
#   - 3 Lambda functions (config read/write, presign, media list)
#   - API Gateway REST API with Cognito authorizer
#   - IAM roles for each Lambda (least privilege)
#   - ACM cert for cdn. subdomain (prod only)
######################################################################

locals {
  cms_config_bucket_name = "augustine-config-${var.environment}-${random_id.bucket_suffix.hex}"
  cms_media_bucket_name  = "augustine-media-${var.environment}-${random_id.bucket_suffix.hex}"
  cdn_domain             = "cdn.augustinehomeimprovements.com"
  admin_domain           = "admin.augustinehomeimprovements.com"
  use_cdn_domain         = var.environment == "prod"
}

# ─────────────────────────────────────────────
# S3 — Config bucket (stores site-config.json)
# ─────────────────────────────────────────────

resource "aws_s3_bucket" "cms_config" {
  bucket = local.cms_config_bucket_name
}

resource "aws_s3_bucket_public_access_block" "cms_config" {
  bucket = aws_s3_bucket.cms_config.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "cms_config" {
  bucket = aws_s3_bucket.cms_config.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_versioning" "cms_config" {
  bucket = aws_s3_bucket.cms_config.id
  versioning_configuration { status = "Enabled" }
}

# Allow CloudFront CDN distribution to read from this bucket
resource "aws_s3_bucket_policy" "cms_config" {
  bucket     = aws_s3_bucket.cms_config.id
  policy     = data.aws_iam_policy_document.cms_config_bucket.json
  depends_on = [aws_s3_bucket_public_access_block.cms_config]
}

data "aws_iam_policy_document" "cms_config_bucket" {
  statement {
    sid    = "AllowCDNCloudFront"
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.cms_config.arn}/*"]
    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.cms_cdn.arn]
    }
  }
}

# ─────────────────────────────────────────────
# S3 — Media bucket (stores uploaded images)
# ─────────────────────────────────────────────

resource "aws_s3_bucket" "cms_media" {
  bucket = local.cms_media_bucket_name
}

resource "aws_s3_bucket_public_access_block" "cms_media" {
  bucket = aws_s3_bucket.cms_media.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "cms_media" {
  bucket = aws_s3_bucket.cms_media.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_versioning" "cms_media" {
  bucket = aws_s3_bucket.cms_media.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_lifecycle_configuration" "cms_media" {
  bucket     = aws_s3_bucket.cms_media.id
  depends_on = [aws_s3_bucket_versioning.cms_media]

  rule {
    id     = "expire-noncurrent-versions"
    status = "Enabled"
    filter {}
    noncurrent_version_expiration {
      noncurrent_days           = 90
      newer_noncurrent_versions = 3
    }
  }
}

# Allow CloudFront CDN distribution to read from the media bucket
resource "aws_s3_bucket_policy" "cms_media" {
  bucket     = aws_s3_bucket.cms_media.id
  policy     = data.aws_iam_policy_document.cms_media_bucket.json
  depends_on = [aws_s3_bucket_public_access_block.cms_media]
}

data "aws_iam_policy_document" "cms_media_bucket" {
  statement {
    sid    = "AllowCDNCloudFront"
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.cms_media.arn}/*"]
    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.cms_cdn.arn]
    }
  }
}

# CORS on media bucket — needed for direct presigned PUT from admin SPA
resource "aws_s3_bucket_cors_configuration" "cms_media" {
  bucket = aws_s3_bucket.cms_media.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT"]
    allowed_origins = [
      "https://${local.admin_domain}",
      # Allow localhost for local admin development
      "http://localhost:5173",
      "http://localhost:3000",
    ]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# ─────────────────────────────────────────────
# CloudFront OAC — for CDN to access both buckets
# ─────────────────────────────────────────────

resource "aws_cloudfront_origin_access_control" "cms_cdn" {
  name                              = "${var.project}-${var.environment}-cms-cdn-oac"
  description                       = "OAC for CMS CDN (config + media)"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# ─────────────────────────────────────────────
# ACM cert for cdn. subdomain (prod only)
# ─────────────────────────────────────────────

resource "aws_acm_certificate" "cms_cdn" {
  count             = local.use_cdn_domain ? 1 : 0
  domain_name       = local.cdn_domain
  validation_method = "DNS"
  lifecycle { create_before_destroy = true }
}

locals {
  cdn_cert_issued = local.use_cdn_domain ? try(aws_acm_certificate.cms_cdn[0].status, "") == "ISSUED" : false
  cdn_aliases     = local.cdn_cert_issued ? [local.cdn_domain] : []
  cdn_cert_arn    = local.cdn_cert_issued ? aws_acm_certificate.cms_cdn[0].arn : null
}

# ─────────────────────────────────────────────
# CloudFront — CDN distribution (config + media)
# ─────────────────────────────────────────────

resource "aws_cloudfront_distribution" "cms_cdn" {
  enabled         = true
  is_ipv6_enabled = true
  comment         = "${var.project}-${var.environment}-cms-cdn"
  aliases         = local.cdn_aliases
  price_class     = "PriceClass_100"

  # Origin 1: config bucket
  origin {
    domain_name              = aws_s3_bucket.cms_config.bucket_regional_domain_name
    origin_id                = "cms-config-s3"
    origin_access_control_id = aws_cloudfront_origin_access_control.cms_cdn.id
  }

  # Origin 2: media bucket
  origin {
    domain_name              = aws_s3_bucket.cms_media.bucket_regional_domain_name
    origin_id                = "cms-media-s3"
    origin_access_control_id = aws_cloudfront_origin_access_control.cms_cdn.id
  }

  # Default behavior → config bucket (serves /config/site-config.json)
  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "cms-config-s3"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    # Short TTL for config — changes appear within 60 seconds
    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }
    min_ttl     = 0
    default_ttl = 60
    max_ttl     = 60
  }

  # /uploads/* → media bucket, long-lived cache (images are immutable by URL)
  ordered_cache_behavior {
    path_pattern           = "/uploads/*"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "cms-media-s3"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }
    min_ttl     = 0
    default_ttl = 86400
    max_ttl     = 31536000
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    acm_certificate_arn            = local.cdn_cert_arn
    cloudfront_default_certificate = local.cdn_cert_issued ? false : true
    ssl_support_method             = local.cdn_cert_issued ? "sni-only" : null
    minimum_protocol_version       = local.cdn_cert_issued ? "TLSv1.2_2021" : null
  }
}

# ─────────────────────────────────────────────
# SES — verified identity for Cognito transactional email
#
# Cognito's built-in shared mailer is limited to 50 emails/day and
# frequently lands in spam.  Wiring Cognito to SES fixes delivery for
# password-reset codes (forgotPassword flow) and email verification.
#
# After first apply you must verify the domain / address in SES:
#   - Domain verification: add the DNS TXT/DKIM records SES supplies.
#   - Email-only (simpler for dev): SES sends a verification link to the address.
# While the SES account is in sandbox, you can only send TO verified addresses;
# request production access once the domain is verified.
# ─────────────────────────────────────────────

resource "aws_ses_email_identity" "cognito_from" {
  email = var.cognito_from_email
}

# IAM role that allows Cognito to call SES SendEmail on our behalf
resource "aws_iam_role" "cognito_ses_sender" {
  name = "${var.project}-${var.environment}-cognito-ses-sender"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "cognito-idp.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "cognito_ses_sender" {
  name = "cognito-ses-send"
  role = aws_iam_role.cognito_ses_sender.id

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
# Cognito User Pool + App Client
# ─────────────────────────────────────────────

resource "aws_cognito_user_pool" "cms" {
  name = "${var.project}-${var.environment}-cms"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length                   = 12
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = true
    require_uppercase                = true
    temporary_password_validity_days = 7
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  # Route transactional email (password-reset codes, verification) through SES
  # instead of Cognito's shared mailer (50/day cap, high spam rate).
  email_configuration {
    email_sending_account  = "DEVELOPER"
    from_email_address     = var.cognito_from_email
    source_arn             = aws_ses_email_identity.cognito_from.arn
    reply_to_email_address = var.cognito_from_email
  }

  # Email verification + password-reset templates
  # Both must live inside verification_message_template when using SES (DEVELOPER sending);
  # the legacy top-level email_verification_subject / email_verification_message attributes
  # conflict with the block-level counterparts and are not permitted together.
  verification_message_template {
    default_email_option  = "CONFIRM_WITH_CODE"
    email_subject         = "Augustine CMS — verify your email"
    email_message         = "Your verification code is {####}"
    email_subject_by_link = "Augustine CMS — reset your password"
    email_message_by_link = "Your Augustine CMS password-reset code is {####}. It expires in 1 hour."
  }

  # Don't allow self-signup — admin-only user pool
  schema {
    name                = "email"
    attribute_data_type = "String"
    required            = true
    mutable             = true
    string_attribute_constraints {
      min_length = 5
      max_length = 254
    }
  }

  depends_on = [aws_iam_role_policy.cognito_ses_sender]
}

# ─────────────────────────────────────────────
# Cognito Admin User (optional — env-seeded)
#
# Set ADMIN_EMAIL in the GitHub Actions environment (or TF_VAR_admin_email
# locally) and Terraform will create this user automatically on apply.
# No welcome email is sent (SUPPRESS). Set the password afterward:
#
#   aws cognito-idp admin-set-user-password \
#     --user-pool-id <POOL_ID> \
#     --username <EMAIL> \
#     --password '<PASSWORD>' \
#     --permanent
# ─────────────────────────────────────────────

resource "aws_cognito_user" "admin" {
  count = var.admin_email != "" ? 1 : 0

  user_pool_id = aws_cognito_user_pool.cms.id
  username     = var.admin_email

  attributes = {
    email          = var.admin_email
    email_verified = "true"
  }

  # Suppress the Cognito welcome / temp-password email.
  # The user exists in FORCE_CHANGE_PASSWORD state until Mark sets a
  # permanent password via Console or CLI.
  message_action = "SUPPRESS"

  lifecycle {
    # Don't recreate the user if the email address is changed in TF vars —
    # that would delete the existing account. Safer to leave it in place.
    ignore_changes = [username]
  }
}

resource "aws_cognito_user_pool_client" "cms_admin" {
  name         = "cms-admin-spa"
  user_pool_id = aws_cognito_user_pool.cms.id

  # SPA client — no client secret
  generate_secret = false

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH",
  ]

  # Token validity
  access_token_validity  = 1   # hour
  id_token_validity      = 1   # hour
  refresh_token_validity = 30  # days

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }

  prevent_user_existence_errors = "ENABLED"
}

# ─────────────────────────────────────────────
# IAM — Lambda execution roles (least privilege)
# ─────────────────────────────────────────────

data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

# --- cms-config Lambda role ---

resource "aws_iam_role" "lambda_cms_config" {
  name               = "${var.project}-${var.environment}-lambda-cms-config"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

resource "aws_iam_role_policy_attachment" "lambda_cms_config_logs" {
  role       = aws_iam_role.lambda_cms_config.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "lambda_cms_config_s3" {
  name = "cms-config-s3"
  role = aws_iam_role.lambda_cms_config.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["s3:GetObject", "s3:PutObject"]
      Resource = "${aws_s3_bucket.cms_config.arn}/config/site-config.json"
    }]
  })
}

# --- cms-upload Lambda role ---

resource "aws_iam_role" "lambda_cms_upload" {
  name               = "${var.project}-${var.environment}-lambda-cms-upload"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

resource "aws_iam_role_policy_attachment" "lambda_cms_upload_logs" {
  role       = aws_iam_role.lambda_cms_upload.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "lambda_cms_upload_s3" {
  name = "cms-upload-s3"
  role = aws_iam_role.lambda_cms_upload.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["s3:PutObject"]
      Resource = "${aws_s3_bucket.cms_media.arn}/uploads/*"
    }]
  })
}

# --- cms-media Lambda role ---

resource "aws_iam_role" "lambda_cms_media" {
  name               = "${var.project}-${var.environment}-lambda-cms-media"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

resource "aws_iam_role_policy_attachment" "lambda_cms_media_logs" {
  role       = aws_iam_role.lambda_cms_media.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "lambda_cms_media_s3" {
  name = "cms-media-s3"
  role = aws_iam_role.lambda_cms_media.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["s3:ListBucket"]
      Resource = aws_s3_bucket.cms_media.arn
      Condition = {
        StringLike = {
          "s3:prefix" = ["uploads/*"]
        }
      }
    }]
  })
}

# ─────────────────────────────────────────────
# Lambda functions (zip-deployed, Node.js 22)
# ─────────────────────────────────────────────

data "archive_file" "cms_config_zip" {
  type        = "zip"
  source_dir  = "${path.root}/../cms/lambda/cms-config"
  output_path = "${path.module}/lambda-zips/cms-config.zip"
}

data "archive_file" "cms_upload_zip" {
  type        = "zip"
  source_dir  = "${path.root}/../cms/lambda/cms-upload"
  output_path = "${path.module}/lambda-zips/cms-upload.zip"
}

data "archive_file" "cms_media_zip" {
  type        = "zip"
  source_dir  = "${path.root}/../cms/lambda/cms-media"
  output_path = "${path.module}/lambda-zips/cms-media.zip"
}

locals {
  cms_env = {
    CONFIG_BUCKET  = aws_s3_bucket.cms_config.bucket
    MEDIA_BUCKET   = aws_s3_bucket.cms_media.bucket
    CONFIG_KEY     = "config/site-config.json"
    UPLOADS_PREFIX = "uploads/"
    ALLOWED_ORIGIN = "https://${local.admin_domain}"
    CDN_BASE_URL   = local.use_cdn_domain ? "https://${local.cdn_domain}" : "https://${aws_cloudfront_distribution.cms_cdn.domain_name}"
  }
}

resource "aws_lambda_function" "cms_config" {
  function_name    = "${var.project}-${var.environment}-cms-config"
  role             = aws_iam_role.lambda_cms_config.arn
  runtime          = "nodejs22.x"
  handler          = "index.handler"
  filename         = data.archive_file.cms_config_zip.output_path
  source_code_hash = data.archive_file.cms_config_zip.output_base64sha256
  timeout          = 10

  environment {
    variables = local.cms_env
  }
}

resource "aws_lambda_function" "cms_upload" {
  function_name    = "${var.project}-${var.environment}-cms-upload"
  role             = aws_iam_role.lambda_cms_upload.arn
  runtime          = "nodejs22.x"
  handler          = "index.handler"
  filename         = data.archive_file.cms_upload_zip.output_path
  source_code_hash = data.archive_file.cms_upload_zip.output_base64sha256
  timeout          = 10

  environment {
    variables = local.cms_env
  }
}

resource "aws_lambda_function" "cms_media" {
  function_name    = "${var.project}-${var.environment}-cms-media"
  role             = aws_iam_role.lambda_cms_media.arn
  runtime          = "nodejs22.x"
  handler          = "index.handler"
  filename         = data.archive_file.cms_media_zip.output_path
  source_code_hash = data.archive_file.cms_media_zip.output_base64sha256
  timeout          = 10

  environment {
    variables = local.cms_env
  }
}

# ─────────────────────────────────────────────
# API Gateway (REST) + Cognito Authorizer
# ─────────────────────────────────────────────

resource "aws_api_gateway_rest_api" "cms" {
  name        = "${var.project}-${var.environment}-cms-api"
  description = "Augustine CMS API"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_authorizer" "cognito" {
  name          = "cognito-authorizer"
  rest_api_id   = aws_api_gateway_rest_api.cms.id
  type          = "COGNITO_USER_POOLS"
  provider_arns = [aws_cognito_user_pool.cms.arn]

  identity_source = "method.request.header.Authorization"
}

# ── /config resource ──

resource "aws_api_gateway_resource" "config" {
  rest_api_id = aws_api_gateway_rest_api.cms.id
  parent_id   = aws_api_gateway_rest_api.cms.root_resource_id
  path_part   = "config"
}

module "cms_config_method" {
  source      = "./modules/apigw-lambda-method"
  rest_api_id = aws_api_gateway_rest_api.cms.id
  resource_id = aws_api_gateway_resource.config.id
  http_method = "ANY"
  lambda_arn  = aws_lambda_function.cms_config.arn
  lambda_name = aws_lambda_function.cms_config.function_name
  authorizer_id   = aws_api_gateway_authorizer.cognito.id
  account_id  = data.aws_caller_identity.current.account_id
  region      = var.aws_region
}

# ── /upload resource ──

resource "aws_api_gateway_resource" "upload" {
  rest_api_id = aws_api_gateway_rest_api.cms.id
  parent_id   = aws_api_gateway_rest_api.cms.root_resource_id
  path_part   = "upload"
}

module "cms_upload_method" {
  source      = "./modules/apigw-lambda-method"
  rest_api_id = aws_api_gateway_rest_api.cms.id
  resource_id = aws_api_gateway_resource.upload.id
  http_method = "ANY"
  lambda_arn  = aws_lambda_function.cms_upload.arn
  lambda_name = aws_lambda_function.cms_upload.function_name
  authorizer_id   = aws_api_gateway_authorizer.cognito.id
  account_id  = data.aws_caller_identity.current.account_id
  region      = var.aws_region
}

# ── /media resource ──

resource "aws_api_gateway_resource" "media" {
  rest_api_id = aws_api_gateway_rest_api.cms.id
  parent_id   = aws_api_gateway_rest_api.cms.root_resource_id
  path_part   = "media"
}

module "cms_media_method" {
  source      = "./modules/apigw-lambda-method"
  rest_api_id = aws_api_gateway_rest_api.cms.id
  resource_id = aws_api_gateway_resource.media.id
  http_method = "ANY"
  lambda_arn  = aws_lambda_function.cms_media.arn
  lambda_name = aws_lambda_function.cms_media.function_name
  authorizer_id   = aws_api_gateway_authorizer.cognito.id
  account_id  = data.aws_caller_identity.current.account_id
  region      = var.aws_region
}

# ── Deployment + Stage ──

resource "aws_api_gateway_deployment" "cms" {
  rest_api_id = aws_api_gateway_rest_api.cms.id

  triggers = {
    # Redeploy when any method/integration changes
    config_hash = module.cms_config_method.trigger_hash
    upload_hash = module.cms_upload_method.trigger_hash
    media_hash  = module.cms_media_method.trigger_hash
  }

  lifecycle { create_before_destroy = true }

  depends_on = [
    module.cms_config_method,
    module.cms_upload_method,
    module.cms_media_method,
  ]
}

# ─────────────────────────────────────────────
# API Gateway account-level CloudWatch Logs role
# Required before access_log_settings will work.
# ─────────────────────────────────────────────

resource "aws_iam_role" "apigw_cloudwatch" {
  name = "${var.project}-${var.environment}-apigw-cloudwatch"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "apigateway.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "apigw_cloudwatch_logs" {
  role       = aws_iam_role.apigw_cloudwatch.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
}

resource "aws_api_gateway_account" "main" {
  cloudwatch_role_arn = aws_iam_role.apigw_cloudwatch.arn

  depends_on = [aws_iam_role_policy_attachment.apigw_cloudwatch_logs]
}

resource "aws_api_gateway_stage" "cms" {
  deployment_id = aws_api_gateway_deployment.cms.id
  rest_api_id   = aws_api_gateway_rest_api.cms.id
  stage_name    = var.environment

  depends_on = [aws_api_gateway_account.main]

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.cms_api.arn
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

resource "aws_cloudwatch_log_group" "cms_api" {
  name              = "/aws/apigateway/${var.project}-${var.environment}-cms"
  retention_in_days = 30
}

# ─────────────────────────────────────────────
# CloudWatch alarms
# ─────────────────────────────────────────────

resource "aws_cloudwatch_metric_alarm" "cms_lambda_errors" {
  alarm_name          = "${var.project}-${var.environment}-cms-lambda-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 5
  alarm_description   = "CMS Lambda errors exceeded threshold"

  dimensions = {
    FunctionName = aws_lambda_function.cms_config.function_name
  }
}
