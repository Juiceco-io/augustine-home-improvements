# Runbook: Bootstrap First CMS Admin User

**When to use:** After the first `terraform apply` on a new environment — or any time you need to create or reset a CMS admin user without touching the AWS Console.

---

## Prerequisites

1. **AWS CLI** installed (`aws --version`)
2. **AWS credentials** configured for the target account with these permissions:
   ```
   cognito-idp:AdminCreateUser
   cognito-idp:AdminSetUserPassword
   cognito-idp:AdminGetUser
   sts:GetCallerIdentity
   ```
   Use `AWS_PROFILE`, `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`, or an IAM instance role.
3. **Terraform applied** at least once in `infrastructure/` (the script reads the User Pool ID from Terraform outputs automatically). Alternatively, pass `--user-pool-id` explicitly.

---

## Quick Start

```bash
# From repo root:
./scripts/bootstrap-admin.sh --username admin@example.com
# You'll be prompted for a password.
```

That's it. The script will:
- Auto-detect the Cognito User Pool ID from `terraform output`
- Create the user (skipped if already exists — safe to re-run)
- Set a permanent password (no forced reset on first login)
- Print the final user status

---

## All Options

```
./scripts/bootstrap-admin.sh [OPTIONS]

  -u, --username EMAIL        Admin email  (required)
  -p, --password PASSWORD     Permanent password (prompted securely if omitted)
  -i, --user-pool-id POOL_ID  Cognito User Pool ID (auto-detected if omitted)
  -e, --environment ENV       dev | prod  (default: dev, affects TF state key)
  -r, --region REGION         AWS region  (default: us-east-1)
  -h, --help                  Full help text
```

---

## Examples

### Local dev (auto-detect pool from Terraform)
```bash
cd /path/to/augustine-home-improvements
./scripts/bootstrap-admin.sh --username you@example.com
```

### Prod deployment (explicit pool ID)
```bash
./scripts/bootstrap-admin.sh \
  --environment prod \
  --user-pool-id us-east-1_XXXXXXXXX \
  --username admin@augustinehomeimprovements.com
```

### Using a named AWS profile
```bash
AWS_PROFILE=augustine-dev ./scripts/bootstrap-admin.sh \
  --username admin@augustinehomeimprovements.com
```

### CI/CD (non-interactive, full args)
```bash
./scripts/bootstrap-admin.sh \
  --user-pool-id "${{ steps.tf-output.outputs.cms_cognito_user_pool_id }}" \
  --username "$ADMIN_EMAIL" \
  --password "$ADMIN_PASSWORD"
```
> In CI/CD, store the admin credentials in GitHub Actions secrets or AWS Secrets Manager. The script accepts `--password` as a flag for non-interactive use.

---

## After Bootstrap

The script will print a next-steps reminder, but for the very first deploy you also need to seed the initial site config:

```bash
# From repo root:
BUCKET=$(cd infrastructure && terraform output -raw cms_config_bucket)

aws s3 cp cms/config/site-config.json \
  s3://$BUCKET/config/site-config.json
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `NoCredentialProviders` | Check `AWS_PROFILE` or env vars |
| `ResourceNotFoundException` (User Pool not found) | Wrong `--user-pool-id` or wrong region |
| `InvalidPasswordException` | Password doesn't meet policy — see below |
| Terraform output fails | Run `terraform init` in `infrastructure/` first |
| User already exists, login still fails | Script is idempotent — re-run to reset password |

### Password policy (from `infrastructure/cms.tf`)
- Minimum 12 characters
- At least one uppercase letter
- At least one lowercase letter  
- At least one number
- At least one special character

---

## How This Works

Under the hood, the script runs two AWS CLI commands:

```bash
# 1. Create user (no welcome email, SUPPRESS)
aws cognito-idp admin-create-user \
  --user-pool-id <POOL_ID> \
  --username <EMAIL> \
  --message-action SUPPRESS

# 2. Set permanent password immediately (no forced reset)
aws cognito-idp admin-set-user-password \
  --user-pool-id <POOL_ID> \
  --username <EMAIL> \
  --password <PASSWORD> \
  --permanent
```

The `--permanent` flag is the key difference from the default Cognito flow. Without it, the user must change their password on first login, which complicates the admin SPA flow (Cognito returns `NEW_PASSWORD_REQUIRED` challenge instead of tokens).

---

## Generalizing to Other Cognito-Backed Apps

This script is intentionally generic. To reuse it in a new app:

1. Copy `scripts/bootstrap-admin.sh` into the new repo.
2. Update the Terraform output name in the auto-detection block (line ~90) from `cms_cognito_user_pool_id` to whatever the new app uses — or just always pass `--user-pool-id` explicitly.
3. The password policy validation matches Cognito's defaults; update if your pool uses a different policy.

No app-specific logic lives in this script beyond the Terraform output name. Everything else (credentials, region, idempotency, safety checks) is portable.
