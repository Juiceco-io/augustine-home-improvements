resource "aws_cloudfront_function" "rewrite_index" {
  name    = "${var.project}-${var.environment}-rewrite-index"
  runtime = "cloudfront-js-2.0"
  comment = "Rewrite directory URIs to index.html for static Next.js export"
  publish = true
  code    = file("${path.module}/cloudfront-function.js")
}

resource "aws_cloudfront_origin_access_control" "site" {
  name                              = "${var.project}-${var.environment}-oac"
  description                       = "OAC for ${var.project} ${var.environment}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_origin_access_control" "cms_config_for_site" {
  name                              = "${var.project}-${var.environment}-cms-config-oac"
  description                       = "OAC for same-origin CMS site config"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_response_headers_policy" "security_headers" {
  name = "${var.project}-${var.environment}-security-headers"

  security_headers_config {
    strict_transport_security {
      access_control_max_age_sec = 63072000
      include_subdomains         = true
      preload                    = true
      override                   = true
    }

    content_type_options {
      override = true
    }

    frame_options {
      frame_option = "DENY"
      override     = true
    }

    xss_protection {
      mode_block = true
      protection = true
      override   = true
    }

    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override        = true
    }

    content_security_policy {
      # img-src breakdown:
      #   'self'                                         - same-origin site assets
      #   data:                                          - inline/admin previews
      #   https://cdn.augustinehomeimprovements.com      - prod CMS CDN alias
      #   https://${aws_cloudfront_distribution.cms_cdn.domain_name} - dev/default CMS CDN hostname
      # connect-src breakdown:
      #   'self'                                         - same-origin XHR / fetch
      #   https://cognito-idp.us-east-1.amazonaws.com   - Cognito auth (SRP, token refresh)
      #   https://*.execute-api.us-east-1.amazonaws.com - CMS API Gateway (config / upload / media)
      #   https://*.s3.amazonaws.com                    - S3 presigned PUT for image uploads
      #   https://*.s3.us-east-1.amazonaws.com          - regional S3 variant used by presigned URLs
      content_security_policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://cdn.augustinehomeimprovements.com https://${aws_cloudfront_distribution.cms_cdn.domain_name}; connect-src 'self' https://cognito-idp.us-east-1.amazonaws.com https://*.execute-api.us-east-1.amazonaws.com https://*.s3.amazonaws.com https://*.s3.us-east-1.amazonaws.com; frame-ancestors 'none'"
      override                = true
    }
  }

  custom_headers_config {
    items {
      header   = "Permissions-Policy"
      value    = "camera=(), microphone=(), geolocation=(), payment=()"
      override = true
    }

    items {
      header   = "Cross-Origin-Opener-Policy"
      value    = "same-origin"
      override = true
    }

    items {
      header   = "Cross-Origin-Resource-Policy"
      value    = "same-origin"
      override = true
    }
  }
}

locals {
  use_custom_domain  = length(var.cloudfront_aliases) > 0
  certificate_issued = local.use_custom_domain ? try(aws_acm_certificate.site[0].status, "") == "ISSUED" : false
  effective_aliases  = local.certificate_issued ? var.cloudfront_aliases : []
  effective_cert_arn = local.certificate_issued ? aws_acm_certificate.site[0].arn : null
}

resource "aws_acm_certificate" "site" {
  count                     = local.use_custom_domain ? 1 : 0
  domain_name               = var.cloudfront_aliases[0]
  subject_alternative_names = slice(var.cloudfront_aliases, 1, length(var.cloudfront_aliases))
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100"
  comment             = "${var.project}-${var.environment}"
  aliases             = local.effective_aliases

  logging_config {
    bucket          = aws_s3_bucket.access_logs.bucket_domain_name
    prefix          = "cloudfront/"
    include_cookies = false
  }

  origin {
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_id                = "S3-${local.bucket_name}"
    origin_access_control_id = aws_cloudfront_origin_access_control.site.id
  }

  origin {
    domain_name              = aws_s3_bucket.cms_config.bucket_regional_domain_name
    origin_id                = "S3-cms-config"
    origin_path              = "/config"
    origin_access_control_id = aws_cloudfront_origin_access_control.cms_config_for_site.id
  }

  ordered_cache_behavior {
    path_pattern               = "/site-config.json"
    allowed_methods            = ["GET", "HEAD"]
    cached_methods             = ["GET", "HEAD"]
    target_origin_id           = "S3-cms-config"
    viewer_protocol_policy     = "redirect-to-https"
    compress                   = true
    cache_policy_id            = "658327ea-f89d-4fab-a63d-7e88639e58f6"
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security_headers.id

    min_ttl     = 0
    default_ttl = 60
    max_ttl     = 60
  }

  default_cache_behavior {
    allowed_methods            = ["GET", "HEAD"]
    cached_methods             = ["GET", "HEAD"]
    target_origin_id           = "S3-${local.bucket_name}"
    viewer_protocol_policy     = "redirect-to-https"
    compress                   = true
    cache_policy_id            = "658327ea-f89d-4fab-a63d-7e88639e58f6"
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security_headers.id

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.rewrite_index.arn
    }
  }

  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/404/index.html"
    error_caching_min_ttl = 10
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/404/index.html"
    error_caching_min_ttl = 10
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn            = local.effective_cert_arn
    cloudfront_default_certificate = local.certificate_issued ? false : true
    ssl_support_method             = local.certificate_issued ? "sni-only" : null
    minimum_protocol_version       = local.certificate_issued ? "TLSv1.2_2021" : null
  }
}
