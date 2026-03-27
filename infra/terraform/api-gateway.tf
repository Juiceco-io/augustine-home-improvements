# ============================================================
# api-gateway.tf — HTTP API Gateway for POST /contact
# ============================================================
# Uses API Gateway v2 (HTTP API) — lower cost and latency than REST API.
# Single route: POST /contact → Lambda contact-handler
# ============================================================

resource "aws_apigatewayv2_api" "contact" {
  name          = "augustine-contact-${var.environment}"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["https://${aws_cloudfront_distribution.main.domain_name}"]
    allow_methods = ["POST", "OPTIONS"]
    allow_headers = ["Content-Type"]
    max_age       = 300
  }
}

resource "aws_apigatewayv2_stage" "contact" {
  api_id      = aws_apigatewayv2_api.contact.id
  name        = "$default"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn
    format = jsonencode({
      requestId               = "$context.requestId"
      sourceIp                = "$context.identity.sourceIp"
      requestTime             = "$context.requestTime"
      protocol                = "$context.protocol"
      httpMethod              = "$context.httpMethod"
      resourcePath            = "$context.resourcePath"
      routeKey                = "$context.routeKey"
      status                  = "$context.status"
      responseLength          = "$context.responseLength"
      integrationErrorMessage = "$context.integrationErrorMessage"
    })
  }
}

resource "aws_apigatewayv2_integration" "contact" {
  api_id             = aws_apigatewayv2_api.contact.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.contact.invoke_arn
  integration_method = "POST"

  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "contact_post" {
  api_id    = aws_apigatewayv2_api.contact.id
  route_key = "POST /contact"
  target    = "integrations/${aws_apigatewayv2_integration.contact.id}"
}

# Allow API Gateway to invoke the Lambda
resource "aws_lambda_permission" "api_gateway_contact" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.contact.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.contact.execution_arn}/*/*/contact"
}

resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/aws/apigateway/augustine-contact-${var.environment}"
  retention_in_days = 30
}
