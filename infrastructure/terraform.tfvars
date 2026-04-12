environment = "dev"
project     = "augustine-home-improvements"
aws_region  = "us-east-1"

# SES domain identity — Terraform will create the SES domain identity and output
# the DNS TXT + DKIM CNAME records to add to your registrar.  Run:
#   terraform output ses_domain_verification_record
#   terraform output ses_dkim_cname_records
# Add those records, wait for DNS propagation (~5-30 min), then re-run the pipeline.
# Once the domain is verified, request SES production access from the AWS Console.
ses_domain         = "augustinehomeimprovements.com"
cognito_from_email = "noreply@augustinehomeimprovements.com"
# ses_email_enabled is NOT set here — it comes from the SES_EMAIL_ENABLED GitHub
# Actions environment variable (Settings → Environments → Variables), mapped to
# TF_VAR_ses_email_enabled in deploy.yml. Default is false (see variables.tf).
# For local Terraform runs: export TF_VAR_ses_email_enabled=true

# contact_to_email is NOT set here — it comes from the CONTACT_TO_EMAIL GitHub
# Actions environment variable (Settings → Environments → Variables).
# For local Terraform runs: export TF_VAR_contact_to_email="your@email.com"
