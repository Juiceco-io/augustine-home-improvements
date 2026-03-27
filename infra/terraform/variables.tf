# ============================================================
# variables.tf — Input variables for all Terraform modules
# ============================================================

variable "environment" {
  description = "Deployment environment: dev or production"
  type        = string
  validation {
    condition     = contains(["dev", "production"], var.environment)
    error_message = "environment must be 'dev' or 'production'."
  }
}

variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "github_org" {
  description = "GitHub organization or user name (for OIDC trust policy)"
  type        = string
  default     = "Juiceco-io"
}

variable "github_repo" {
  description = "GitHub repository name (for OIDC trust policy)"
  type        = string
  default     = "augustine-home-improvements"
}

variable "cognito_callback_urls" {
  description = "List of allowed Cognito callback URLs (Hosted UI → app)"
  type        = list(string)
  default     = []
  # Set per environment, e.g.:
  #   dev:        ["https://dXXXXX.cloudfront.net/api/admin/auth/callback",
  #                "http://localhost:3000/api/admin/auth/callback"]
  #   production: ["https://www.augustinehomeimprovements.com/api/admin/auth/callback"]
}

variable "cognito_logout_urls" {
  description = "List of allowed Cognito sign-out redirect URLs"
  type        = list(string)
  default     = []
}

variable "ses_from_email" {
  description = "Verified SES sender address for contact form"
  type        = string
  default     = "noreply@augustinehomeimprovements.com"
}

variable "contact_recipient_email" {
  description = "Email address that receives contact form submissions"
  type        = string
  default     = "info@augustinehomeimprovements.com"
}
