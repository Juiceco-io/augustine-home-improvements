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

# ──────────────────────────────────────────────────────────────────────────────
# DEV BOOTSTRAP ONLY — admin_password
#
# Setting this variable causes Terraform to call admin-set-user-password via a
# null_resource + local-exec provisioner immediately after user creation so Mark
# can log in without any AWS CLI or forgot-password email step.
#
# ⚠️  THIS IS A TEMPORARY DEV CONVENIENCE — NOT FOR PRODUCTION USE:
#   - The password value flows through TF state and CI logs (masked in Actions
#     but still sensitive).
#   - For prod: use proper secrets management (Secrets Manager, SSM) or the
#     standard forgot-password email flow once SES is verified.
#   - Remove or leave blank once the bootstrap window is over.
#
# Store as a GitHub Actions secret (Settings → Secrets → ADMIN_PASSWORD).
# Never commit a real password to this file.
# ──────────────────────────────────────────────────────────────────────────────
variable "admin_password" {
  description = <<-EOT
    [DEV BOOTSTRAP ONLY] If set together with admin_email, Terraform will set
    this as a permanent password on the Cognito admin user after creation,
    allowing immediate login with no AWS CLI step required.
    Store as a GitHub Actions secret (ADMIN_PASSWORD). Leave empty to skip.
  EOT
  type        = string
  default     = ""
  sensitive   = true
}
