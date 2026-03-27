# ============================================================
# cognito.tf — Cognito User Pool for admin authentication
# ============================================================
# Manages admin auth via Cognito Hosted UI (OAuth 2.0 flow).
# Do NOT configure Cognito resources in the AWS Console —
# all changes go through Terraform via PR.
# ============================================================

locals {
  # Hosted UI domain prefix: augustine-<env>.auth.us-east-1.amazoncognito.com
  # Must be globally unique across all AWS accounts.
  cognito_domain_prefix = "augustine-${var.environment}"
}

resource "aws_cognito_user_pool" "main" {
  name = "augustine-admins-${var.environment}"

  # Admins are created manually or via CI seeding — no self-signup
  admin_create_user_config {
    allow_admin_create_user_only = true
  }

  password_policy {
    minimum_length                   = 12
    require_lowercase                = true
    require_uppercase                = true
    require_numbers                  = true
    require_symbols                  = true
    temporary_password_validity_days = 7
  }

  # MFA optional (TOTP) — can be upgraded to REQUIRED
  mfa_configuration = "OPTIONAL"

  software_token_mfa_configuration {
    enabled = true
  }

  username_attributes = ["email"]

  auto_verified_attributes = ["email"]

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  schema {
    attribute_data_type = "String"
    name                = "email"
    required            = true
    mutable             = true

    string_attribute_constraints {
      min_length = 5
      max_length = 256
    }
  }

  tags = {
    Name = "augustine-admins-${var.environment}"
  }
}

# Hosted UI domain (subdomain of amazoncognito.com)
resource "aws_cognito_user_pool_domain" "main" {
  domain       = local.cognito_domain_prefix
  user_pool_id = aws_cognito_user_pool.main.id
}

# App Client: OAuth 2.0 for the Next.js admin panel
resource "aws_cognito_user_pool_client" "main" {
  name         = "augustine-webapp-${var.environment}"
  user_pool_id = aws_cognito_user_pool.main.id

  generate_secret = true

  # OAuth flows
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["openid", "email", "profile"]

  # Tokens
  access_token_validity  = 1   # hours
  id_token_validity      = 1   # hours
  refresh_token_validity = 30  # days

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }

  # Redirect URLs — set via variable (must include localhost for dev)
  callback_urls = var.cognito_callback_urls
  logout_urls   = var.cognito_logout_urls

  supported_identity_providers = ["COGNITO"]

  # Prevent secret from appearing in Terraform plan output
  prevent_user_existence_errors = "ENABLED"

  explicit_auth_flows = [
    "ALLOW_REFRESH_TOKEN_AUTH",
  ]
}

# Super-user group — members can access admin dashboard
resource "aws_cognito_user_group" "super_user" {
  name         = "super_user"
  user_pool_id = aws_cognito_user_pool.main.id
  description  = "Admin panel super users"
  precedence   = 1
}
