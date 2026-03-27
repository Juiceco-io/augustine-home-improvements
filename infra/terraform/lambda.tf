# ============================================================
# lambda.tf — Contact form Lambda function
# ============================================================
# Packages infra/lambda/contact-handler.js and deploys it.
# The zip is rebuilt whenever the source file changes.
# ============================================================

data "archive_file" "contact_handler" {
  type        = "zip"
  source_file = "${path.module}/../lambda/contact-handler.js"
  output_path = "${path.module}/../lambda/contact-handler.zip"
}

resource "aws_lambda_function" "contact" {
  function_name    = "augustine-contact-${var.environment}"
  role             = aws_iam_role.lambda_contact.arn
  handler          = "contact-handler.handler"
  runtime          = "nodejs20.x"
  filename         = data.archive_file.contact_handler.output_path
  source_code_hash = data.archive_file.contact_handler.output_base64sha256

  timeout     = 10
  memory_size = 128

  environment {
    variables = {
      SES_FROM_EMAIL          = var.ses_from_email
      CONTACT_RECIPIENT_EMAIL = var.contact_recipient_email
      AWS_REGION_NAME         = var.aws_region
      # ALLOWED_ORIGIN is set after CloudFront is created — see cloudfront.tf
      # It will be updated on next terraform apply once CF is up.
      ALLOWED_ORIGIN = "https://${aws_cloudfront_distribution.main.domain_name}"
    }
  }

  tags = {
    Name = "augustine-contact-${var.environment}"
  }
}

# CloudWatch log group for Lambda
resource "aws_cloudwatch_log_group" "lambda_contact" {
  name              = "/aws/lambda/augustine-contact-${var.environment}"
  retention_in_days = 30
}
