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
