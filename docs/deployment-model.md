# Deployment Model

## Principles

1. **Cognito is PR-managed infrastructure** — provisioned via Terraform, not the AWS Console.
   User Pool, App Client, Hosted UI domain, and groups are all declared in code and applied through CI.
   Manual console setup is not the expected path.

2. **Non-sensitive config → GitHub environment variables (`vars.*`)** — Cognito pool IDs, client IDs,
   domain, region, site URLs, contact API URL, and analytics IDs are not secrets. They live in
   GitHub environment variables, visible in PR diffs.

3. **Secrets are minimized** — only values that are genuinely secret live in `secrets.*`:
   session signing keys, COGNITO_SUPERUSER_EMAILS (optional bootstrap), OIDC role ARNs,
   ECR/ECS identifiers, and CloudFront distribution IDs.

4. **Bootstrap super-user via CI** — the initial Cognito admin user can be seeded from
   `COGNITO_SUPERUSER_EMAILS` (GitHub secret), so there is no manual console step required.

5. **Local dev is first-class** — running `npm run dev` with a minimal `.env.local` should work
   without live AWS resources. Contact form falls back to the local `/api/contact` route.
   Admin panel requires real Cognito values if you want OAuth to work locally.

---

## Environment Reference

### `dev` environment

#### GitHub Variables (`vars.*`) — non-sensitive config

| Variable | Default / Description |
|---|---|
| `SITE_URL` | `https://dev.augustinehomeimprovements.com` |
| `CONTACT_API_URL` | API Gateway endpoint URL (set after Terraform apply) |
| `COGNITO_USER_POOL_ID` | Cognito User Pool ID (output from Terraform) |
| `COGNITO_APP_CLIENT_ID` | Cognito App Client ID (output from Terraform) |
| `COGNITO_DOMAIN` | Cognito Hosted UI domain URL (output from Terraform) |
| `AWS_REGION` | `us-east-1` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `G-BG798Y9ZT0` (optional) |

#### GitHub Secrets (`secrets.*`) — sensitive values only

| Secret | Description |
|---|---|
| `ADMIN_SESSION_SECRET` | Min 32-char random string — signs local session cookie after Cognito login. Generate: `openssl rand -hex 32` |
| `COGNITO_SUPERUSER_EMAILS` | Optional comma-separated email list to bootstrap Cognito super-user via CI |
| `ISR_REVALIDATION_SECRET` | Random token for on-demand ISR revalidation. Generate: `openssl rand -hex 16` |
| `AWS_ROLE_ARN` | OIDC IAM role ARN for GitHub Actions (used only in deploy jobs) |
| `ECR_REGISTRY` | ECR registry URL (used only in deploy jobs) |
| `ECS_CLUSTER` | ECS cluster name (used only in deploy jobs) |
| `ECS_SERVICE` | ECS service name (used only in deploy jobs) |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution ID (used only in deploy jobs) |

---

### `production` environment

Same structure as `dev`. Values differ (prod URLs, prod Cognito pool, etc.).

| Variable | Default / Description |
|---|---|
| `SITE_URL` | `https://www.augustinehomeimprovements.com` |
| `COGNITO_USER_POOL_ID` | Prod Cognito User Pool ID |
| `COGNITO_APP_CLIENT_ID` | Prod Cognito App Client ID |
| `COGNITO_DOMAIN` | Prod Cognito Hosted UI domain |
| `CONTACT_API_URL` | Prod API Gateway endpoint |
| `AWS_REGION` | `us-east-1` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `G-BG798Y9ZT0` |

Secrets mirror the `dev` list above with production values.

---

### Local development (`.env.local`)

Minimum to run the site locally without AWS:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_SESSION_SECRET=any-32-char-string-for-local-use
ISR_REVALIDATION_SECRET=any-string
```

To enable the local contact form fallback:
```bash
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
SES_FROM_EMAIL=noreply@augustinehomeimprovements.com
CONTACT_RECIPIENT_EMAIL=info@augustinehomeimprovements.com
```

To enable local admin panel (requires real Cognito):
```bash
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_APP_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
COGNITO_DOMAIN=https://augustine-admin-dev.auth.us-east-1.amazoncognito.com
```

---

## Cognito via Terraform (not Console)

Cognito infrastructure is declared in Terraform. The expected flow is:

1. A PR adds or updates `infra/terraform/cognito.tf`
2. CI runs `terraform plan` on the PR for review
3. On merge, `terraform apply` creates/updates the User Pool, App Client, and groups
4. Terraform outputs (`user_pool_id`, `client_id`, `domain`) are captured and set as GitHub variables
5. First deploy after provisioning can seed the super-user from `COGNITO_SUPERUSER_EMAILS` if set

> **No manual AWS Console steps are required or expected.**
> If you find yourself clicking through the Cognito console to set things up,
> that configuration should be moved to Terraform instead.

---

## What is and isn't a secret

| Config value | Type | Rationale |
|---|---|---|
| `COGNITO_USER_POOL_ID` | **variable** | Not sensitive — identifies a pool, not a credential |
| `COGNITO_APP_CLIENT_ID` | **variable** | Not sensitive — public identifier used in OAuth flows |
| `COGNITO_DOMAIN` | **variable** | Not sensitive — public Hosted UI URL |
| `ADMIN_SESSION_SECRET` | **secret** | Signs session cookies — must be kept private |
| `COGNITO_SUPERUSER_EMAILS` | **secret** | Admin email list — limit blast radius |
| `ISR_REVALIDATION_SECRET` | **secret** | Controls cache revalidation — should be private |
| `AWS_ROLE_ARN` | **secret** | IAM role — treat as sensitive |
| `ECR_REGISTRY`, `ECS_CLUSTER`, `ECS_SERVICE` | **secret** | AWS resource identifiers — limit exposure |
| `CLOUDFRONT_DISTRIBUTION_ID` | **secret** | Used to issue invalidations — treat as sensitive |
| `SITE_URL`, `CONTACT_API_URL` | **variable** | Public URLs — not sensitive |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | **variable** | Analytics tag — public by nature |
| `AWS_REGION` | **variable** | `us-east-1` — not sensitive |
