# ============================================================
# cloudfront.tf — CloudFront distribution
# ============================================================
# Two origins:
#   1. ALB / ECS (Next.js standalone server) — default origin
#   2. API Gateway (contact form) — /contact path
#
# CloudFront handles HTTPS termination. The ALB and API GW
# can remain HTTP-only behind CloudFront.
# ============================================================

locals {
  alb_origin_id         = "alb-nextjs"
  api_gateway_origin_id = "apigw-contact"
}

resource "aws_cloudfront_distribution" "main" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "augustine-home-improvements-${var.environment}"
  default_root_object = ""
  price_class         = "PriceClass_100" # US, CA, EU only — cheapest

  # Custom domain aliases — set this variable to your domain when DNS is ready
  # aliases = var.cloudfront_aliases

  # ── Origin: ALB / ECS (Next.js) ──────────────────────────────────────────
  origin {
    origin_id   = local.alb_origin_id
    domain_name = aws_lb.main.dns_name

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only" # ALB is HTTP-only behind CloudFront
      origin_ssl_protocols   = ["TLSv1.2"]
    }

    custom_header {
      name  = "X-Forwarded-For"
      value = "cloudfront"
    }
  }

  # ── Origin: API Gateway (contact form Lambda) ─────────────────────────────
  origin {
    origin_id   = local.api_gateway_origin_id
    domain_name = replace(aws_apigatewayv2_api.contact.api_endpoint, "https://", "")

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # ── Default Cache Behavior: Next.js server ────────────────────────────────
  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = local.alb_origin_id
    viewer_protocol_policy = "redirect-to-https"

    # Forward cookies and headers needed by Next.js (Cognito session, ISR)
    forwarded_values {
      query_string = true
      cookies {
        forward = "all"
      }
      headers = [
        "Authorization",
        "Host",
        "CloudFront-Viewer-Country",
        "X-Forwarded-Proto",
      ]
    }

    min_ttl     = 0
    default_ttl = 0    # Next.js controls caching via Cache-Control headers
    max_ttl     = 3600

    # Compress responses
    compress = true
  }

  # ── Cache Behavior: Static assets (_next/static) ──────────────────────────
  ordered_cache_behavior {
    path_pattern           = "/_next/static/*"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = local.alb_origin_id
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }

    min_ttl     = 86400    # 1 day
    default_ttl = 2592000  # 30 days
    max_ttl     = 31536000 # 1 year
    compress    = true
  }

  # ── Cache Behavior: Public static files ───────────────────────────────────
  ordered_cache_behavior {
    path_pattern           = "/images/*"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = local.alb_origin_id
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }

    min_ttl     = 86400
    default_ttl = 604800  # 7 days
    max_ttl     = 2592000 # 30 days
    compress    = true
  }

  # ── Cache Behavior: Contact API (no caching, pass-through) ────────────────
  ordered_cache_behavior {
    path_pattern           = "/contact"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = local.api_gateway_origin_id
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
      headers = ["Origin", "Content-Type"]
    }

    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0
    compress    = false
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # Uses CloudFront default certificate (*.cloudfront.net) until custom domain
  viewer_certificate {
    cloudfront_default_certificate = true
    # Once a custom domain + ACM cert is set up, replace with:
    # acm_certificate_arn      = var.acm_certificate_arn
    # ssl_support_method       = "sni-only"
    # minimum_protocol_version = "TLSv1.2_2021"
  }

  # Security headers (custom response headers policy)
  # Note: aws_cloudfront_response_headers_policy requires provider >= 3.64
  # Uncomment once the policy is validated:
  # web_acl_id = var.waf_web_acl_arn

  tags = {
    Name = "augustine-${var.environment}"
  }
}
