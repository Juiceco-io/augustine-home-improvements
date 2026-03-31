/**
 * Module: apigw-lambda-method
 *
 * Wires a Lambda function to an API Gateway resource with:
 *   - ANY method (proxy integration)
 *   - Cognito authorizer
 *   - OPTIONS (CORS preflight) without auth
 *   - Lambda invoke permission for API Gateway
 */

resource "aws_api_gateway_method" "main" {
  rest_api_id   = var.rest_api_id
  resource_id   = var.resource_id
  http_method   = var.http_method
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = var.authorizer_id
}

resource "aws_api_gateway_integration" "main" {
  rest_api_id             = var.rest_api_id
  resource_id             = var.resource_id
  http_method             = aws_api_gateway_method.main.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${var.region}:lambda:path/2015-03-31/functions/${var.lambda_arn}/invocations"
}

# OPTIONS preflight — no auth required
resource "aws_api_gateway_method" "options" {
  rest_api_id   = var.rest_api_id
  resource_id   = var.resource_id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options" {
  rest_api_id = var.rest_api_id
  resource_id = var.resource_id
  http_method = aws_api_gateway_method.options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "options_200" {
  rest_api_id = var.rest_api_id
  resource_id = var.resource_id
  http_method = aws_api_gateway_method.options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "options_200" {
  rest_api_id = var.rest_api_id
  resource_id = var.resource_id
  http_method = aws_api_gateway_method.options.http_method
  status_code = aws_api_gateway_method_response.options_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Authorization,Content-Type'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,PUT,POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'https://admin.augustinehomeimprovements.com'"
  }

  depends_on = [aws_api_gateway_integration.options]
}

# Allow API Gateway to invoke the Lambda
resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowAPIGatewayInvoke-${var.lambda_name}"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${var.region}:${var.account_id}:${var.rest_api_id}/*/*"
}
