#!/usr/bin/env bash
# =============================================================================
# bootstrap-admin.sh — Create the first CMS admin user in Cognito
# =============================================================================
#
# USAGE
#   ./scripts/bootstrap-admin.sh [OPTIONS]
#
# OPTIONS
#   -u, --username EMAIL        Admin email (required)
#   -p, --password PASSWORD     Permanent password (prompted if omitted)
#   -i, --user-pool-id POOL_ID  Cognito User Pool ID (auto-detected from
#                               Terraform outputs if omitted)
#   -e, --environment ENV       "dev" or "prod" (default: dev)
#                               Only used for Terraform output detection.
#   -r, --region REGION         AWS region (default: us-east-1)
#   -h, --help                  Show this help
#
# PREREQUISITES
#   - AWS CLI installed and configured with credentials that have:
#       cognito-idp:AdminCreateUser
#       cognito-idp:AdminSetUserPassword
#       cognito-idp:AdminGetUser
#   - Terraform applied at least once (to create the User Pool)
#     OR pass --user-pool-id explicitly.
#
# EXAMPLES
#   # Auto-detect user pool from Terraform, prompt for password:
#   ./scripts/bootstrap-admin.sh --username admin@example.com
#
#   # Fully explicit (no Terraform needed):
#   ./scripts/bootstrap-admin.sh \
#     --user-pool-id us-east-1_XXXXXXXXX \
#     --username admin@example.com \
#     --password 'S3cur3Pass!word1'
#
#   # Using an AWS profile:
#   AWS_PROFILE=myprofile ./scripts/bootstrap-admin.sh --username admin@example.com
#
# IDEMPOTENCY
#   Safe to re-run. If the user already exists, creation is skipped and only
#   the password update is applied (idempotent password reset).
#
# GENERALIZING TO OTHER COGNITO-BACKED APPS
#   This script reads the user pool ID from `terraform output` by default,
#   which works for any app that follows the pattern:
#     - Terraform output named `cms_cognito_user_pool_id`
#     - infrastructure/ directory at repo root
#   For apps with a different output name, pass --user-pool-id explicitly.
# =============================================================================

set -euo pipefail

# ── Defaults ──────────────────────────────────────────────────────────────────

USERNAME=""
PASSWORD=""
USER_POOL_ID=""
ENVIRONMENT="dev"
AWS_REGION="${AWS_REGION:-us-east-1}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# ── Colors ────────────────────────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info()    { echo -e "${BLUE}[INFO]${NC}  $*"; }
log_success() { echo -e "${GREEN}[OK]${NC}    $*"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC}  $*" >&2; }
log_error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; }

# ── Help ──────────────────────────────────────────────────────────────────────

usage() {
  grep '^#' "$0" | grep -v '^#!/' | sed 's/^# \{0,2\}//'
  exit 0
}

# ── Argument parsing ──────────────────────────────────────────────────────────

while [[ $# -gt 0 ]]; do
  case "$1" in
    -u|--username)      USERNAME="$2";      shift 2 ;;
    -p|--password)      PASSWORD="$2";      shift 2 ;;
    -i|--user-pool-id)  USER_POOL_ID="$2";  shift 2 ;;
    -e|--environment)   ENVIRONMENT="$2";   shift 2 ;;
    -r|--region)        AWS_REGION="$2";    shift 2 ;;
    -h|--help)          usage ;;
    *) log_error "Unknown argument: $1"; echo "Run with --help for usage."; exit 1 ;;
  esac
done

# ── Validate required args ────────────────────────────────────────────────────

if [[ -z "$USERNAME" ]]; then
  log_error "--username is required."
  echo "  Example: $0 --username admin@example.com"
  exit 1
fi

# ── Prompt for password if not provided ───────────────────────────────────────

if [[ -z "$PASSWORD" ]]; then
  echo -n "Enter permanent password for ${USERNAME}: "
  read -rs PASSWORD
  echo
  if [[ -z "$PASSWORD" ]]; then
    log_error "Password cannot be empty."
    exit 1
  fi
  echo -n "Confirm password: "
  read -rs PASSWORD_CONFIRM
  echo
  if [[ "$PASSWORD" != "$PASSWORD_CONFIRM" ]]; then
    log_error "Passwords do not match."
    exit 1
  fi
fi

# ── Validate password strength (mirrors Cognito policy in cms.tf) ─────────────

validate_password() {
  local pw="$1"
  local errors=()
  [[ ${#pw} -lt 12 ]]              && errors+=("at least 12 characters")
  [[ ! "$pw" =~ [A-Z] ]]           && errors+=("an uppercase letter")
  [[ ! "$pw" =~ [a-z] ]]           && errors+=("a lowercase letter")
  [[ ! "$pw" =~ [0-9] ]]           && errors+=("a number")
  [[ ! "$pw" =~ [^a-zA-Z0-9] ]]   && errors+=("a special character")
  if [[ ${#errors[@]} -gt 0 ]]; then
    log_error "Password does not meet Cognito policy. It requires:"
    for e in "${errors[@]}"; do
      echo "  • $e"
    done
    return 1
  fi
  return 0
}

validate_password "$PASSWORD"

# ── Auto-detect User Pool ID from Terraform outputs ───────────────────────────

if [[ -z "$USER_POOL_ID" ]]; then
  TF_DIR="$REPO_ROOT/infrastructure"
  if [[ ! -d "$TF_DIR" ]]; then
    log_error "Could not find infrastructure/ directory at $TF_DIR"
    echo "  Pass --user-pool-id explicitly, or run from the repo root."
    exit 1
  fi

  log_info "Auto-detecting Cognito User Pool ID from Terraform outputs..."
  log_info "  Directory: $TF_DIR"
  log_info "  Environment: $ENVIRONMENT"

  pushd "$TF_DIR" > /dev/null
  # terraform output requires the state to be initialized
  if ! terraform output -raw cms_cognito_user_pool_id 2>/dev/null; then
    log_warn "terraform output failed — trying with init first..."
    terraform init -reconfigure \
      -backend-config="key=augustine-home-improvements/${ENVIRONMENT}/terraform.tfstate" \
      -input=false > /dev/null
    if ! USER_POOL_ID=$(terraform output -raw cms_cognito_user_pool_id 2>/dev/null); then
      log_error "Could not read cms_cognito_user_pool_id from Terraform state."
      echo "  Make sure Terraform has been applied at least once, or pass --user-pool-id."
      popd > /dev/null
      exit 1
    fi
  else
    USER_POOL_ID=$(terraform output -raw cms_cognito_user_pool_id)
  fi
  popd > /dev/null

  log_success "User Pool ID: $USER_POOL_ID"
fi

# ── Sanity-check User Pool ID format ─────────────────────────────────────────

if [[ ! "$USER_POOL_ID" =~ ^[a-z0-9-]+_[A-Za-z0-9]+$ ]]; then
  log_warn "User Pool ID '$USER_POOL_ID' doesn't look like a valid Cognito pool ID."
  log_warn "Expected format: us-east-1_XXXXXXXXX"
  echo -n "Continue anyway? [y/N] "
  read -r confirm
  [[ "$confirm" =~ ^[Yy]$ ]] || exit 1
fi

# ── Check AWS credentials ─────────────────────────────────────────────────────

log_info "Checking AWS credentials..."
if ! CALLER=$(aws sts get-caller-identity --region "$AWS_REGION" --output text --query 'Arn' 2>&1); then
  log_error "AWS credentials not configured or invalid."
  echo "  Details: $CALLER"
  echo "  Set AWS_PROFILE, AWS_ACCESS_KEY_ID/SECRET, or use an IAM instance profile."
  exit 1
fi
log_success "Authenticated as: $CALLER"

# ── Check if user already exists ─────────────────────────────────────────────

log_info "Checking if user '$USERNAME' already exists..."
USER_STATUS=""
if aws cognito-idp admin-get-user \
    --user-pool-id "$USER_POOL_ID" \
    --username "$USERNAME" \
    --region "$AWS_REGION" \
    --output text \
    --query 'UserStatus' > /tmp/cognito_user_status 2>&1; then
  USER_STATUS=$(cat /tmp/cognito_user_status)
  log_warn "User '$USERNAME' already exists (status: $USER_STATUS)."
  log_warn "Skipping user creation — will only update password."
  USER_CREATED=false
else
  USER_CREATED=true
fi

# ── Create user (if not exists) ───────────────────────────────────────────────

if [[ "$USER_CREATED" == "true" ]]; then
  log_info "Creating user '$USERNAME' in pool '$USER_POOL_ID'..."
  aws cognito-idp admin-create-user \
    --user-pool-id "$USER_POOL_ID" \
    --username "$USERNAME" \
    --message-action SUPPRESS \
    --region "$AWS_REGION" \
    --output text \
    --query 'User.UserStatus' > /dev/null
  log_success "User created."
fi

# ── Set permanent password ────────────────────────────────────────────────────

log_info "Setting permanent password..."
aws cognito-idp admin-set-user-password \
  --user-pool-id "$USER_POOL_ID" \
  --username "$USERNAME" \
  --password "$PASSWORD" \
  --permanent \
  --region "$AWS_REGION"

log_success "Password set permanently."

# ── Confirm final status ──────────────────────────────────────────────────────

FINAL_STATUS=$(aws cognito-idp admin-get-user \
  --user-pool-id "$USER_POOL_ID" \
  --username "$USERNAME" \
  --region "$AWS_REGION" \
  --output text \
  --query 'UserStatus')

echo ""
echo -e "${GREEN}✅ Bootstrap complete!${NC}"
echo "   User:       $USERNAME"
echo "   Pool ID:    $USER_POOL_ID"
echo "   Status:     $FINAL_STATUS"
echo "   Region:     $AWS_REGION"
echo ""
echo "Next steps:"
echo "  1. Log in at /admin with the credentials above."
echo "  2. If this is the first deploy, also upload the initial site-config.json:"
echo "     aws s3 cp cms/config/site-config.json \\"
echo "       s3://<cms_config_bucket>/config/site-config.json"
echo "     (Get bucket name: cd infrastructure && terraform output -raw cms_config_bucket)"
