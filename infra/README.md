# Infrastructure — AWS-First Architecture

> **Current immediate deploy target: `dev`.**
> For the step-by-step guide to bringing up the dev environment, see
> **[dev-checklist.md](dev-checklist.md)**.
> This file covers the full reference architecture.
>
> **Deployment model:**
> Infrastructure (including Cognito) is managed via Terraform and deployed through PRs.
> See **[docs/deployment-model.md](../docs/deployment-model.md)** for the vars/secrets reference.

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

Set these on the Lambda function (not secrets — plain config):
- `SES_FROM_EMAIL=noreply@augustinehomeimprovements.com`
- `CONTACT_RECIPIENT_EMAIL=info@augustinehomeimprovements.com`
- `AWS_REGION=us-east-1`
- `ALLOWED_ORIGIN=https://dev.augustinehomeimprovements.com`

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

Terraform outputs (`user_pool_id`, `client_id`, `domain`) are set as GitHub
environment *variables* (not secrets — they are non-sensitive identifiers).

Initial super-user seeding: set `COGNITO_SUPERUSER_EMAILS` as a GitHub secret
so the first deployment can bootstrap the admin account via CI, without manual
console access.

---

## ECS / Fargate Setup

1. Create an ECR repository
2. Create an ECS cluster (Fargate)
3. Create a task definition with the Next.js image
4. Create an ECS service behind an ALB
5. Configure CloudFront origin to point at the ALB

---

## GitHub Variables & Secrets Required

See **[docs/deployment-model.md](../docs/deployment-model.md)** for the authoritative reference.

### Variables (`vars.*`) — non-sensitive config

| Name | Description |
|------|-------------|
| `SITE_URL` | Public environment URL |
| `CONTACT_API_URL` | API Gateway contact endpoint URL |
| `COGNITO_USER_POOL_ID` | Cognito User Pool ID (Terraform output) |
| `COGNITO_APP_CLIENT_ID` | Cognito App Client ID (Terraform output) |
| `COGNITO_DOMAIN` | Cognito Hosted UI domain URL (Terraform output) |
| `AWS_REGION` | `us-east-1` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `G-BG798Y9ZT0` |

### Secrets (`secrets.*`) — sensitive values only

| Name | Description |
|------|-------------|
| `ADMIN_SESSION_SECRET` | 32+ char random string — signs session cookies |
| `COGNITO_SUPERUSER_EMAILS` | Optional bootstrap email list |
| `ISR_REVALIDATION_SECRET` | Random token for on-demand ISR |
| `AWS_ROLE_ARN` | OIDC role ARN for GitHub Actions |
| `ECR_REGISTRY` | ECR registry URL |
| `ECS_CLUSTER` | ECS cluster name |
| `ECS_SERVICE` | ECS service name |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution ID |
