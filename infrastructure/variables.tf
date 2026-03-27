variable "environment" {
  type        = string
  default     = "production"
  description = "Deployment environment"
}

variable "project" {
  type        = string
  default     = "augustine-home-improvements"
  description = "Project name (used in resource naming)"
}

variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "AWS region"
}

variable "deployer_role_arn" {
  description = "IAM role ARN to assume for deploying resources"
  type        = string
}

variable "cloudfront_aliases" {
  description = "Custom domain aliases for CloudFront (e.g. [\"augustinehomeimprovements.com\", \"www.augustinehomeimprovements.com\"])"
  type        = list(string)
  default     = []
}

variable "contact_email_domain" {
  description = "SES-verified domain used to send contact form email"
  type        = string
  default     = "augustinehomeimprovements.com"
}

variable "contact_from_email" {
  description = "From address used by the contact form Lambda"
  type        = string
  default     = "noreply@augustinehomeimprovements.com"
}

variable "contact_to_email" {
  description = "Destination address for contact form submissions"
  type        = string
  default     = "info@augustinehomeimprovements.com"
}

variable "contact_site_name" {
  description = "Human-friendly site name used in contact form emails"
  type        = string
  default     = "Augustine Home Improvements"
}

variable "contact_allowed_origins" {
  description = "Additional allowed CORS origins for the contact form API"
  type        = list(string)
  default     = []
}
