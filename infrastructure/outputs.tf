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
  description = "CMS API Gateway invoke URL (set as NEXT_PUBLIC_CMS_API_URL in Next.js build)"
  value       = aws_api_gateway_stage.cms.invoke_url
}

output "contact_api_url" {
  description = "Contact form API invoke URL (set as NEXT_PUBLIC_CONTACT_API_URL in Next.js build)"
  value       = "${aws_api_gateway_stage.contact.invoke_url}/contact"
}

output "cms_cdn_domain" {
  description = "CloudFront domain for CMS media CDN."
  value       = "https://${aws_cloudfront_distribution.cms_cdn.domain_name}"
}

output "cms_cognito_user_pool_id" {
  description = "Cognito User Pool ID (set as NEXT_PUBLIC_COGNITO_USER_POOL_ID in Next.js build)"
  value       = aws_cognito_user_pool.cms.id
}

output "cms_cognito_client_id" {
  description = "Cognito App Client ID (set as NEXT_PUBLIC_COGNITO_CLIENT_ID in Next.js build)"
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

output "cms_admin_user_created" {
  description = "Whether an admin Cognito user was seeded by Terraform (true when ADMIN_EMAIL / TF_VAR_admin_email was set)"
  value       = var.admin_email != ""
}

output "cms_admin_email" {
  description = "Email address of the seeded admin user (empty if not seeded)"
  value       = var.admin_email
  sensitive   = true
}

output "cms_ses_from_email" {
  description = "SES identity used as the Cognito From address for transactional email"
  value       = var.cognito_from_email
}

# ─────────────────────────────────────────────
# SES DNS verification records (domain identity)
# Add these to your DNS registrar to verify the SES domain.
# ─────────────────────────────────────────────

output "ses_domain" {
  description = "The SES domain being verified (for use in CI checks)"
  value       = aws_ses_domain_identity.cognito_from.domain
}

output "ses_domain_verification_record" {
  description = <<-EOT
    TXT record to add to your DNS registrar to verify the SES domain identity.
    Name: _amazonses.<domain>
    Type: TXT
    Value: <token below>
  EOT
  value = {
    name  = "_amazonses.${aws_ses_domain_identity.cognito_from.domain}"
    type  = "TXT"
    value = aws_ses_domain_identity.cognito_from.verification_token
  }
}

output "ses_dkim_cname_records" {
  description = <<-EOT
    3 CNAME records to add to your DNS registrar to enable DKIM signing for SES.
    Add all three; names end in ._domainkey.<domain>.
  EOT
  value = [
    for token in aws_ses_domain_dkim.cognito_from.dkim_tokens : {
      name  = "${token}._domainkey.${aws_ses_domain_identity.cognito_from.domain}"
      type  = "CNAME"
      value = "${token}.dkim.amazonses.com"
    }
  ]
}

output "cms_cognito_ses_role_arn" {
  description = "IAM role ARN that Cognito assumes to call SES (for reference/debugging)"
  value       = aws_iam_role.cognito_ses_sender.arn
}

# ─────────────────────────────────────────────
# Analytics Outputs
# ─────────────────────────────────────────────

output "analytics_api_ingest_url" {
  description = "Analytics event ingest URL — set as NEXT_PUBLIC_ANALYTICS_API_URL in Next.js build"
  value       = "${aws_api_gateway_stage.cms.invoke_url}/analytics"
}

output "analytics_table_name" {
  description = "DynamoDB table name for analytics events"
  value       = aws_dynamodb_table.analytics.name
}

output "access_logs_bucket" {
  description = "S3 bucket name for CloudFront access logs"
  value       = aws_s3_bucket.access_logs.bucket
}
