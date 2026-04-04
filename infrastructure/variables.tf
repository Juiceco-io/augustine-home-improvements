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

variable "cognito_from_email" {
  description = <<-EOT
    Email address Cognito uses as the From address when sending password-reset
    codes and verification emails.  Must be verified in SES for the target region.
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
    (no welcome email sent). Mark can then set/reset the password via the
    AWS Console or: aws cognito-idp admin-set-user-password ...
    Leave empty to skip automatic user creation.
  EOT
  type        = string
  default     = ""
}
