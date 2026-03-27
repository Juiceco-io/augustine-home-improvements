# Infrastructure — AWS-First Architecture

> **Current immediate deploy target: `dev`.**
> For the step-by-step guide to bringing up the dev environment, see
> **[dev-checklist.md](dev-checklist.md)**.
> This file covers the full reference architecture.
>
> **Deployment model:**
> Infrastructure (including Cognito) is managed via Terraform and deployed through PRs.
> Terraform outputs are the single source of truth for all infrastructure identifiers.
> See **[docs/deployment-model.md](../docs/deployment-model.md)** for full details.

This directory contains reference infrastructure files for the AWS deployment of
Augustine Home Improvements.

---

## Architecture Overview

```
Browser
  └─► CloudFront (CDN + HTTPS + Security Headers)
        ├─► ALB / ECS Fargate  ← Next.js standalone server
        │     (public pages, admin panel, Cognito OAuth, ISR)
        └─► API Gateway (POST /contact)
              └─► Lambda (contact-handler.js → SES)
```

### Why not fully static (S3 only)?

The app has server-side requirements that cannot run in a static S3 bucket:
- **Admin panel** (`/admin/*`) — Cognito OAuth callback sets `httpOnly` session cookies
- **Middleware** — protects `/admin/*` routes
- **ISR revalidation** endpoint — `revalidatePath()` requires a running Next.js server

The public marketing pages are cached by CloudFront at the edge, so users still get
static-like performance.

---

## Terraform Layout

```
infra/terraform/
  providers.tf    — AWS provider, backend config
  variables.tf    — Input variables (environment, region, etc.)
  outputs.tf      — All infrastructure identifiers exported as outputs
  cognito.tf      — TODO: Cognito User Pool, App Client, Hosted UI domain
  api-gateway.tf  — TODO: HTTP API Gateway + Lambda integration
  cloudfront.tf   — TODO: CloudFront distribution + origins
  ecr.tf          — TODO: ECR repository
  ecs.tf          — TODO: ECS cluster, task definition, service, ALB
  iam.tf          — TODO: OIDC role for GitHub Actions
```

`outputs.tf` is the contract between Terraform and the deployment workflows.
See that file (and the table in `docs/deployment-model.md`) for the full list
of required outputs and their current provisioning status.

### Applying Terraform

```bash
cd infra/terraform

# First time
terraform init

# Dev environment
terraform plan -var="environment=dev"
terraform apply -var="environment=dev"

# Production
terraform plan -var="environment=production"
terraform apply -var="environment=production"
```

After `apply`, the deploy workflows automatically read the outputs — no manual
GitHub variable updates required.

---

## Next.js Standalone Build

`output: 'standalone'` in `next.config.ts` produces a minimal self-contained Node.js
server in `.next/standalone/`. Ideal for Docker / ECS Fargate.

### Local Docker test

```bash
npm run build
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static
node .next/standalone/server.js
```

### Dockerfile (reference)

```dockerfile
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

---

## Contact Form Lambda

- File: `lambda/contact-handler.js`
- Runtime: Node.js 20.x
- Behind API Gateway route: `POST /contact`
- Sends email via SES

Set these on the Lambda function (non-sensitive config — not secrets):
- `SES_FROM_EMAIL=noreply@augustinehomeimprovements.com`
- `CONTACT_RECIPIENT_EMAIL=info@augustinehomeimprovements.com`
- `AWS_REGION=us-east-1`
- `ALLOWED_ORIGIN=https://dXXXXX.cloudfront.net`  ← Terraform output `cloudfront_url`

---

## Admin Panel (Cognito)

**Cognito is managed via Terraform — not the AWS Console.**

The User Pool, Hosted UI domain, App Client, and groups are declared in Terraform
and applied through PRs. Do not configure Cognito manually.

Expected Terraform resources:
- `aws_cognito_user_pool`
- `aws_cognito_user_pool_domain`
- `aws_cognito_user_pool_client` (with callback URLs for local/dev/prod)
- `aws_cognito_user_group` (`super_user`)

After `terraform apply`, the `cognito_user_pool_id`, `cognito_app_client_id`, and
`cognito_domain` outputs are automatically consumed by the deploy workflows.
No manual GitHub variable update is needed.

Initial super-user seeding: set `COGNITO_SUPERUSER_EMAILS` as a GitHub secret so
the first deployment can bootstrap the admin account via CI, without manual
console access.

---

## GitHub Variables & Secrets Required

See **[docs/deployment-model.md](../docs/deployment-model.md)** for the authoritative reference.

### Secrets (`secrets.*`) — true secrets only (4 total)

| Name | Description |
|------|-------------|
| `ADMIN_SESSION_SECRET` | 32+ char random string — signs session cookies |
| `COGNITO_SUPERUSER_EMAILS` | Optional bootstrap email list |
| `ISR_REVALIDATION_SECRET` | Random token for on-demand ISR |
| `AWS_ROLE_ARN` | OIDC role ARN — bootstrap only; remove once TF `github_actions_role_arn` output is live |

### Variables (`vars.*`) — fallbacks / overrides only

These are used only before Terraform outputs are populated, or to override TF
values (e.g. custom domain over CloudFront URL).

| Name | Description |
|------|-------------|
| `SITE_URL` | Override with custom domain once DNS is live |
| `CONTACT_API_URL` | Bootstrap fallback before API GW Terraform is applied |
| `COGNITO_USER_POOL_ID` | Bootstrap fallback before Cognito Terraform is applied |
| `COGNITO_APP_CLIENT_ID` | Bootstrap fallback before Cognito Terraform is applied |
| `COGNITO_DOMAIN` | Bootstrap fallback before Cognito Terraform is applied |
| `AWS_REGION` | `us-east-1` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `G-BG798Y9ZT0` |

> **The goal:** as Terraform resources are provisioned one by one, GitHub variables
> can be removed from the environment settings. Eventually only `SITE_URL` (custom
> domain override) and the 4 secrets above should remain.
