environment = "dev"
project     = "augustine-home-improvements"
aws_region  = "us-east-1"

# Cognito sends password-reset codes and verification emails from this address.
# Must be verified in SES (us-east-1).  For dev, verify the address in the
# SES console after first apply: SES → Verified identities → Create identity.
# For prod, verify the full domain and request SES production access.
cognito_from_email = "noreply@augustinehomeimprovements.com"
