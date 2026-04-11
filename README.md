# Augustine Home Improvements

Static Next.js website for [Augustine Home Improvements](https://www.augustinehomeimprovements.com/) — a veteran-owned home improvement contractor serving Chester County PA.

## Stack

- **Next.js 15** with `output: "export"` (static site)
- **Tailwind CSS** for styling
- **AWS S3 + CloudFront** for hosting (app-owned Terraform)
- **GitHub Actions** for CI/CD (branch → environment deploy)

## Branch → Environment Model

| Branch | Environment | AWS Account |
|--------|-------------|-------------|
| `dev`  | dev         | 518692945749 |
| `main` | prod        | TBD |

## Local Development

```bash
cp .env.example .env.local
npm install
npm run dev
```

## Build

```bash
npm run build
# Static output written to ./out/
```

## CI/CD

- **CI** (`ci.yml`): lint, typecheck, build — runs on push to `dev` and PRs
- **Deploy** (`deploy.yml`): Terraform apply → S3 sync → CloudFront invalidation — runs on push to `dev` and `main`

## Infrastructure

Terraform lives in `infrastructure/`. Uses the same S3/CloudFront pattern as company-homepage:

- S3 bucket (private, OAC-only access)
- CloudFront distribution with security headers
- ACM certificate (only for prod with custom domain aliases)

### Prerequisites Before First Deploy

1. **Terraform state backend** — S3 bucket `augustine-terraform-state` + DynamoDB table `augustine-terraform-locks` must exist in dev account (518692945749). Create once, manually or via bootstrap.
2. **IAM roles** — `github-actions-deployer` and `github-actions-terraform-state` roles in the dev account with OIDC trust for this repo.
3. **GitHub environment** — Create `dev` environment in GitHub repo settings (no extra protection rules needed for dev).

### Contact Form

The contact form sends submissions via a Lambda + API Gateway endpoint backed by SES.
`NEXT_PUBLIC_CONTACT_API_URL` is automatically set from the `contact_api_url` Terraform output
during the CI/CD pipeline — no manual configuration needed.

- **From address:** `noreply@<ses_domain>` (must be within the SES-verified domain)
- **To address:** controlled by the `contact_to_email` Terraform variable (default: `contact@augustinehomeimprovements.com`)
- Override `contact_to_email` in `infrastructure/terraform.tfvars` or as a CI environment variable.

## CMS

A minimal AWS-first CMS lives at `/admin` (Next.js route: `app/admin/`). It is:
- **Client-only** — authentication and API calls happen in-browser (Cognito + API Gateway)
- **Deployed as part of the same static Next.js export** — no separate build or hosting

### Architecture

| Component | AWS Service |
|-----------|-------------|
| Auth | Cognito User Pool + App Client (SPA, no client secret) |
| Config storage | S3 (`cms-config` bucket) |
| Media storage | S3 (`cms-media` bucket) |
| API | API Gateway + Lambda (3 endpoints: `/config`, `/upload`, `/media`) |
| CDN | CloudFront (serves same-origin `/site-config.json` plus CMS media to the public site) |

All infrastructure is managed by the same Terraform in `infrastructure/`.

### Environment Variables

**All CMS config values are public (not secrets).** They are injected at build time from Terraform outputs automatically in CI/CD — no manual GitHub environment variables required.

| Variable | Terraform Output | Description |
|----------|-----------------|-------------|
| `NEXT_PUBLIC_COGNITO_USER_POOL_ID` | `cms_cognito_user_pool_id` | Cognito User Pool ID |
| `NEXT_PUBLIC_COGNITO_CLIENT_ID` | `cms_cognito_client_id` | Cognito App Client ID (no secret) |
| `NEXT_PUBLIC_CMS_API_URL` | `cms_api_url` | API Gateway base URL |

### Required Secrets / One-time Setup

The CMS has **no runtime secrets**. The only required setup beyond the standard infrastructure prerequisites:

1. **First admin user** — Terraform creates the Cognito user automatically when the `ADMIN_EMAIL` GitHub Actions variable is set:

   **Recommended (env-seeded, zero extra steps):**
   - Go to **GitHub → Settings → Environments → dev (or prod)**
   - Add a variable: `ADMIN_EMAIL = mark@example.com`
   - Push to `dev` / merge to `main` — Terraform creates the user on next apply
   - Then set the password once:
     ```bash
     POOL_ID=$(cd infrastructure && terraform output -raw cms_cognito_user_pool_id)
     aws cognito-idp admin-set-user-password \
       --user-pool-id "$POOL_ID" \
       --username mark@example.com \
       --password 'YourPassword123!' \
       --permanent
     ```

   **Alternative (manual bootstrap script):**
   ```bash
   ./scripts/bootstrap-admin.sh --username mark@example.com
   # Auto-detects the Cognito User Pool from Terraform outputs.
   # Prompts for password interactively (or pass --password for non-interactive use).
   ```
   See [`docs/runbook-bootstrap-admin.md`](docs/runbook-bootstrap-admin.md) for full usage, options, and troubleshooting.

2. **Initial site-config.json** — upload `cms/config/site-config.json` to the `cms-config` S3 bucket at `config/site-config.json`:
   ```bash
   BUCKET=$(cd infrastructure && terraform output -raw cms_config_bucket)
   aws s3 cp cms/config/site-config.json s3://$BUCKET/config/site-config.json
   ```

### Local Dev (CMS Admin)

```bash
cp .env.example .env.local
# Fill in values from: terraform output -json (run from infrastructure/)
npm run dev
# Visit http://localhost:3000/admin
```

The public site now always reads its live CMS config from the same-origin path
`/site-config.json`. In AWS, the main site CloudFront distribution serves that
path from the CMS config bucket with a 60-second TTL. For local dev, the repo
includes `public/site-config.json` as the default same-origin stub.
