output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (used by CI/CD for cache invalidation)"
  value       = aws_cloudfront_distribution.site.id
}

output "cloudfront_domain_name" {
  description = "CloudFront domain name (dev site URL)"
  value       = "https://${aws_cloudfront_distribution.site.domain_name}"
}

output "s3_bucket_name" {
  description = "S3 bucket name"
  value       = aws_s3_bucket.site.bucket
}

output "s3_bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.site.arn
}

output "acm_certificate_arn" {
  description = "ACM certificate ARN for CloudFront custom domain (empty for dev)"
  value       = local.use_custom_domain ? aws_acm_certificate.site[0].arn : ""
}

output "acm_validation_records" {
  description = "DNS validation records required for ACM certificate issuance"
  value = local.use_custom_domain ? [for dvo in aws_acm_certificate.site[0].domain_validation_options : {
    domain_name  = dvo.domain_name
    record_name  = dvo.resource_record_name
    record_type  = dvo.resource_record_type
    record_value = dvo.resource_record_value
  }] : []
}

# ─────────────────────────────────────────────
# CMS Outputs
# ─────────────────────────────────────────────

output "cms_api_url" {
  description = "CMS API Gateway invoke URL (set as VITE_API_URL in admin SPA)"
  value       = aws_api_gateway_stage.cms.invoke_url
}

output "cms_cdn_domain" {
  description = "CloudFront domain for CMS CDN (config + media). Use as NEXT_PUBLIC_CMS_CONFIG_URL base."
  value       = "https://${aws_cloudfront_distribution.cms_cdn.domain_name}"
}

output "cms_config_url" {
  description = "Full URL to site-config.json on the CDN (set as NEXT_PUBLIC_CMS_CONFIG_URL)"
  value       = "https://${aws_cloudfront_distribution.cms_cdn.domain_name}/config/site-config.json"
}

output "cms_cognito_user_pool_id" {
  description = "Cognito User Pool ID (set as VITE_COGNITO_USER_POOL_ID in admin SPA)"
  value       = aws_cognito_user_pool.cms.id
}

output "cms_cognito_client_id" {
  description = "Cognito App Client ID (set as VITE_COGNITO_CLIENT_ID in admin SPA)"
  value       = aws_cognito_user_pool_client.cms_admin.id
}

output "cms_config_bucket" {
  description = "S3 bucket name for site-config.json"
  value       = aws_s3_bucket.cms_config.bucket
}

output "cms_media_bucket" {
  description = "S3 bucket name for uploaded media"
  value       = aws_s3_bucket.cms_media.bucket
}
