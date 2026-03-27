# Infrastructure — AWS-First Architecture

> **Current immediate deploy target: `dev`.**
> For the step-by-step guide to bringing up the dev environment, see
> **[dev-checklist.md](dev-checklist.md)**.
> This file covers the full reference architecture.

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

Set these on the Lambda function:
- `SES_FROM_EMAIL`
- `CONTACT_RECIPIENT_EMAIL`
- `AWS_REGION=us-east-1`
- `ALLOWED_ORIGIN`

---

## Admin Panel (Cognito)

The admin panel at `/admin/*` uses Amazon Cognito Hosted UI and requires the
Next.js server to be running.

Recommended setup:
1. Create a **User Pool** in `us-east-1`
2. Create a Hosted UI domain
3. Create an App Client with callback URLs for local/dev/prod
4. Create Cognito group: `super_user`
5. Add owner as initial user and place in `super_user`

---

## ECS / Fargate Setup

1. Create an ECR repository
2. Create an ECS cluster (Fargate)
3. Create a task definition with the Next.js image
4. Create an ECS service behind an ALB
5. Configure CloudFront origin to point at the ALB

---

## GitHub Secrets / Variables Required

| Name | Type | Value |
|------|------|-------|
| `AWS_ROLE_ARN` | Secret | OIDC role ARN for GitHub Actions |
| `CLOUDFRONT_DISTRIBUTION_ID` | Secret | CloudFront distribution ID |
| `COGNITO_DOMAIN` | Secret | Cognito Hosted UI domain |
| `COGNITO_USER_POOL_ID` | Secret | Cognito User Pool ID |
| `COGNITO_APP_CLIENT_ID` | Secret | Cognito app client ID |
| `COGNITO_SUPERUSER_EMAILS` | Secret | Bootstrap allowlist (optional) |
| `ADMIN_SESSION_SECRET` | Secret | Random 32+ char string |
| `ISR_REVALIDATION_SECRET` | Secret | Random string |
| `ECR_REGISTRY` | Secret | ECR registry URL |
| `ECS_CLUSTER` | Secret | ECS cluster name |
| `ECS_SERVICE` | Secret | ECS service name |
| `CONTACT_API_URL` | Variable | API Gateway contact endpoint URL |
| `SITE_URL` | Variable | public environment URL |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Variable | `G-BG798Y9ZT0` |
| `AWS_REGION` | Variable | `us-east-1` |
