# Infrastructure — AWS-First Architecture

> **Current deploy target: `dev`.**
> For the step-by-step guide to deploying the dev environment, see
> **[dev-checklist.md](dev-checklist.md)**.
> This file covers the full reference architecture (dev and prod).

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

The public marketing pages (homepage, service pages, etc.) are cached by CloudFront
at the edge, so end users get static-like performance without sacrificing server features.

The contact form backend is fully decoupled from the Next.js server — it's a separate
Lambda function behind API Gateway.

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

### Files
- `lambda/contact-handler.js` — self-contained Lambda handler (Node.js 20.x runtime)

### Required Lambda environment variables

| Variable | Value |
|---|---|
| `SES_FROM_EMAIL` | `noreply@augustinehomeimprovements.com` |
| `CONTACT_RECIPIENT_EMAIL` | `info@augustinehomeimprovements.com` |
| `AWS_REGION` | `us-east-1` |
| `ALLOWED_ORIGIN` | `https://www.augustinehomeimprovements.com` |

### Deploy Steps

1. **Package and create Lambda function:**
   ```bash
   cd infra/lambda
   zip contact-handler.zip contact-handler.js
   aws lambda create-function \
     --function-name augustine-contact-form \
     --runtime nodejs20.x \
     --handler contact-handler.handler \
     --zip-file fileb://contact-handler.zip \
     --role arn:aws:iam::ACCOUNT_ID:role/augustine-lambda-role
   ```

2. **Set environment variables:**
   ```bash
   aws lambda update-function-configuration \
     --function-name augustine-contact-form \
     --environment "Variables={
       SES_FROM_EMAIL=noreply@augustinehomeimprovements.com,
       CONTACT_RECIPIENT_EMAIL=info@augustinehomeimprovements.com,
       ALLOWED_ORIGIN=https://www.augustinehomeimprovements.com
     }"
   ```

3. **IAM role for Lambda** (`augustine-lambda-role`) needs:
   - `AWSLambdaBasicExecutionRole` (managed policy) for CloudWatch logs
   - Custom inline policy:
     ```json
     {
       "Effect": "Allow",
       "Action": ["ses:SendEmail", "ses:SendRawEmail"],
       "Resource": "arn:aws:ses:us-east-1:ACCOUNT_ID:identity/augustinehomeimprovements.com"
     }
     ```

4. **Create API Gateway (HTTP API):**
   - Create HTTP API in API Gateway console
   - Integration: Lambda function `augustine-contact-form` (payload format 2.0)
   - Route: `POST /contact`
   - Enable CORS: allowed origin = `https://www.augustinehomeimprovements.com`
   - Deploy to stage `prod`
   - Endpoint URL: `https://XXXX.execute-api.us-east-1.amazonaws.com/prod/contact`

5. **Wire endpoint to frontend build:**
   - Set GitHub Actions variable `CONTACT_API_URL` to the API Gateway URL
   - This is baked into the frontend as `NEXT_PUBLIC_CONTACT_API_URL` at build time

---

## Admin Panel (Cognito)

The admin panel at `/admin/*` uses Amazon Cognito Hosted UI for authentication.
It requires the Next.js server to be running (not static).

### Cognito Setup
1. Create a **User Pool** in `us-east-1`
2. Create a Hosted UI domain: e.g. `https://augustine-admin.auth.us-east-1.amazoncognito.com`
3. Create an App Client with callback URLs:
   - Local: `http://localhost:3000/api/admin/auth/callback`
   - Prod: `https://www.augustinehomeimprovements.com/api/admin/auth/callback`
4. Create Cognito group: `super_user`
5. Add owner as initial user, place in `super_user` group

---

## SES Setup

1. Verify the domain `augustinehomeimprovements.com` in SES (us-east-1)
2. Add DNS TXT/DKIM records as instructed by SES console
3. Request **production access** (move out of sandbox) via AWS Support
4. Set `SES_FROM_EMAIL` on the Lambda function environment

---

## ECS / Fargate Setup

1. Create an ECR repository: `augustine-home-improvements`
2. Create an ECS cluster (Fargate)
3. Create a task definition with the Next.js container image
4. Create an ECS service behind an ALB
5. Configure CloudFront origin to point at ALB (HTTPS)
6. Set all required env vars as ECS task environment variables or SSM Parameter Store references

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
| `ECR_REGISTRY` | Secret | ECR registry URL (for ECS deploy) |
| `ECS_CLUSTER` | Secret | ECS cluster name |
| `ECS_SERVICE` | Secret | ECS service name |
| `CONTACT_API_URL` | Variable | API Gateway contact endpoint URL |
| `SITE_URL` | Variable | `https://www.augustinehomeimprovements.com` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Variable | `G-BG798Y9ZT0` |
| `AWS_REGION` | Variable | `us-east-1` |
