# ============================================================
# outputs.tf — Terraform outputs consumed by GitHub Actions
# ============================================================
# These outputs become the single source of truth for all
# infrastructure identifiers.  Workflow jobs read them via:
#
#   terraform -chdir=infra/terraform output -raw <output_name>
#
# Values are non-sensitive unless marked sensitive = true.
# ============================================================

# ── CloudFront ───────────────────────────────────────────────────────────────

output "cloudfront_url" {
  description = "Public HTTPS URL of the CloudFront distribution (used as SITE_URL until custom domain)"
  value       = aws_cloudfront_distribution.main.domain_name != "" ? "https://${aws_cloudfront_distribution.main.domain_name}" : ""
  # NOTE: resource not yet declared — see cloudfront.tf (TODO)
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (needed for cache invalidation)"
  value       = aws_cloudfront_distribution.main.id
  # NOTE: resource not yet declared — see cloudfront.tf (TODO)
}

# ── API Gateway ──────────────────────────────────────────────────────────────

output "contact_api_url" {
  description = "HTTP API Gateway invoke URL for POST /contact (used as NEXT_PUBLIC_CONTACT_API_URL)"
  value       = "${aws_apigatewayv2_api.contact.api_endpoint}/contact"
  # NOTE: resource not yet declared — see api-gateway.tf (TODO)
}

# ── Cognito ──────────────────────────────────────────────────────────────────

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID (non-sensitive — used as COGNITO_USER_POOL_ID)"
  value       = aws_cognito_user_pool.main.id
  # NOTE: resource not yet declared — see cognito.tf (TODO)
}

output "cognito_app_client_id" {
  description = "Cognito App Client ID (non-sensitive — used as COGNITO_APP_CLIENT_ID)"
  value       = aws_cognito_user_pool_client.main.id
  # NOTE: resource not yet declared — see cognito.tf (TODO)
}

output "cognito_domain" {
  description = "Cognito Hosted UI domain URL (non-sensitive — used as COGNITO_DOMAIN)"
  value       = "https://${aws_cognito_user_pool_domain.main.domain}.auth.${var.aws_region}.amazoncognito.com"
  # NOTE: resource not yet declared — see cognito.tf (TODO)
}

# ── ECR ──────────────────────────────────────────────────────────────────────

output "ecr_registry" {
  description = "ECR registry URL (e.g. 123456789.dkr.ecr.us-east-1.amazonaws.com)"
  value       = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com"
}

output "ecr_repository_url" {
  description = "Full ECR repository URL including repo name"
  value       = aws_ecr_repository.main.repository_url
  # NOTE: resource not yet declared — see ecr.tf (TODO)
}

# ── ECS ──────────────────────────────────────────────────────────────────────

output "ecs_cluster_name" {
  description = "ECS cluster name (used for aws ecs update-service)"
  value       = aws_ecs_cluster.main.name
  # NOTE: resource not yet declared — see ecs.tf (TODO)
}

output "ecs_service_name" {
  description = "ECS service name (used for aws ecs update-service)"
  value       = aws_ecs_service.web.name
  # NOTE: resource not yet declared — see ecs.tf (TODO)
}

# ── OIDC / IAM ───────────────────────────────────────────────────────────────

output "github_actions_role_arn" {
  description = "IAM role ARN for GitHub Actions OIDC (used as AWS_ROLE_ARN)"
  value       = aws_iam_role.github_actions.arn
  # NOTE: resource not yet declared — see iam.tf (TODO)
}
