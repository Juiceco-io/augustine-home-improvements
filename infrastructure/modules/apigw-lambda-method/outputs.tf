output "trigger_hash" {
  description = "Hash to trigger API Gateway redeployment on changes to methods, integrations, or CORS config"
  value = sha256(jsonencode({
    # Stable identifiers
    rest_api_id = var.rest_api_id
    resource_id = var.resource_id
    lambda_arn  = var.lambda_arn

    # Main integration URI — captures lambda ARN changes
    integration_uri = aws_api_gateway_integration.main.uri

    # OPTIONS CORS integration response — changes force redeployment
    cors_response_parameters = aws_api_gateway_integration_response.options_200.response_parameters

    # OPTIONS mock integration template
    options_request_templates = aws_api_gateway_integration.options.request_templates
  }))
}
