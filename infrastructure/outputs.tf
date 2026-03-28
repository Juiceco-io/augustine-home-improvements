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
