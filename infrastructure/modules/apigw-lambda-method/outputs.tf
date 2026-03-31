output "trigger_hash" {
  description = "Hash to trigger API Gateway redeployment on changes"
  value       = sha256("${var.rest_api_id}${var.resource_id}${var.lambda_arn}")
}
