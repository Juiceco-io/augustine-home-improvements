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
