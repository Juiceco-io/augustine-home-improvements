# Runbook: Bootstrap First CMS Admin User

**When to use:** After the first `terraform apply` on a new environment — or any time you need to create or reset a CMS admin user without touching the AWS Console.

---

## Recommended Approach: Env-Seeded User (Terraform Creates the Account)

The cleanest pattern: set `ADMIN_EMAIL` in the GitHub Actions environment and Terraform creates the Cognito user automatically during the next deploy. No separate bootstrap step needed.

### Step 1 — Set the GitHub Actions variable

1. Open the repo on GitHub
2. Go to **Settings → Environments → dev** (or **prod**)
3. Under **Environment variables**, add:
   - Name: `ADMIN_EMAIL`
   - Value: `mark@augustinehomeimprovements.com` (or whichever address Mark uses)
4. Save

### Step 2 — Deploy

Push to `dev` (or merge to `main` for prod). The `terraform apply` step will create the user with email-verified status and no welcome email.

The user starts in `FORCE_CHANGE_PASSWORD` state — it exists, but has no usable password yet.

### Step 3 — Set a permanent password

After the deploy workflow completes, run this once (locally or in a one-off CI step):

```bash
POOL_ID=$(cd infrastructure && terraform output -raw cms_cognito_user_pool_id)
aws cognito-idp admin-set-user-password \
  --user-pool-id "$POOL_ID" \
  --username mark@augustinehomeimprovements.com \
  --password 'YourPassword123!' \
  --permanent
```

Or from the AWS Console: **Cognito → User Pools → [pool] → Users → Reset password**.

That's the whole flow. Mark can now log in at `/admin`.

> **Idempotent:** If `ADMIN_EMAIL` is set and the user already exists, Terraform leaves them untouched (no accidental deletion). The `ignore_changes = [username]` lifecycle prevents destructive replacement if the email is later edited in vars.

> **Password resets:** Use the `admin-set-user-password` command above any time you need to reset the password. No Terraform involved.

> **Local / `TF_VAR_` equivalent:** If running Terraform locally instead of via CI, set:
> ```bash
> export TF_VAR_admin_email="mark@example.com"
> terraform apply
> ```

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
