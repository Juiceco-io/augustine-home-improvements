# terraform.tfvars — production defaults
# Override deployer_role_arn and cloudfront_aliases before first apply.

environment  = "production"
project      = "augustine-home-improvements"
aws_region   = "us-east-1"

# Set this to the IAM role that GitHub Actions will assume for deployments:
# deployer_role_arn = "arn:aws:iam::ACCOUNT_ID:role/github-actions-deployer"

# Uncomment and set when DNS is ready:
# cloudfront_aliases = ["augustinehomeimprovements.com", "www.augustinehomeimprovements.com"]

contact_email_domain = "augustinehomeimprovements.com"
contact_from_email   = "noreply@augustinehomeimprovements.com"
contact_to_email     = "info@augustinehomeimprovements.com"
contact_site_name    = "Augustine Home Improvements"
