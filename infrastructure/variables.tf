variable "environment" {
  type        = string
  default     = "dev"
  description = "Deployment environment (dev, qa, prod)"
}

variable "project" {
  type        = string
  default     = "augustine-home-improvements"
  description = "Project name"
}

variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "AWS region"
}

variable "deployer_role_arn" {
  description = "IAM role ARN to assume for deploying resources"
  type        = string
  default     = "arn:aws:iam::518692945749:role/github-actions-deployer"
}

variable "cloudfront_aliases" {
  description = "Custom domain aliases for CloudFront (empty for dev; set for prod)"
  type        = list(string)
  default     = []
}

variable "ses_domain" {
  description = <<-EOT
    Domain to register as an SES verified identity for Cognito transactional email.
    After first apply, add the TXT + DKIM CNAME records output by Terraform to your
    DNS registrar, then wait for verification before re-running the pipeline.
    Example: "augustinehomeimprovements.com"
  EOT
  type        = string
  default     = "augustinehomeimprovements.com"
}

variable "cognito_from_email" {
  description = <<-EOT
    Email address Cognito uses as the From address when sending password-reset
    codes and verification emails.  Must be within the verified SES domain.
    Example: "Augustine CMS <noreply@augustinehomeimprovements.com>"
    Defaults to a basic address; override per-environment in tfvars or CI vars.
  EOT
  type        = string
  default     = "noreply@augustinehomeimprovements.com"
}

variable "admin_email" {
  description = <<-EOT
    Email address for the initial CMS admin user.
    When set, Terraform creates the Cognito user automatically during apply
    (no welcome email sent). Leave empty to skip automatic user creation.
  EOT
  type        = string
  default     = ""
}

variable "contact_to_email" {
  description = <<-EOT
    Email address that receives contact form submissions.
    Set as CONTACT_TO_EMAIL in GitHub Actions environment variables
    (Settings → Environments → Variables).
    While SES is in sandbox mode this address must be individually verified in SES.
    Example: "mark@augustinehomeimprovements.com"
  EOT
  type    = string
  default = ""

  validation {
    condition     = var.contact_to_email != ""
    error_message = "contact_to_email must be set. Add CONTACT_TO_EMAIL as a GitHub Actions environment variable."
  }
}


