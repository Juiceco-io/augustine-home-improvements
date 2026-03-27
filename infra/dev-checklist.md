# Dev Deployment Checklist

This is the immediate path to get the site running in a **dev** environment on AWS.
Prod/QA are intentionally out of scope for now.

---

## Architecture (dev)

```
Browser
  └─► CloudFront (dev distribution)
        ├─► ALB → ECS Fargate (dev cluster)
        │     └─► Next.js standalone container
        └─► API Gateway POST /dev/contact
              └─► Lambda (contact-handler.js)
                    └─► SES → info@augustinehomeimprovements.com
```

---

## Prerequisites

- AWS account access (us-east-1 recommended)
- `aws` CLI configured with admin/deploy credentials
- GitHub repo admin access (to set secrets/vars and create environment)
- Docker installed locally (for image builds)

---

## Step-by-Step Checklist

### 1. Create GitHub `dev` Environment

In GitHub repo → Settings → Environments → New environment → name it `dev`.

Add the following **secrets** and **variables** to the `dev` environment:

#### Secrets (GitHub env → `dev`)

| Secret name | Value / Notes |
|---|---|
| `AWS_ROLE_ARN` | ARN of OIDC role for GitHub Actions (see step 4) |
| `COGNITO_DOMAIN` | Cognito Hosted UI domain URL |
| `COGNITO_USER_POOL_ID` | Cognito User Pool ID |
| `COGNITO_APP_CLIENT_ID` | Cognito App Client ID |
| `COGNITO_SUPERUSER_EMAILS` | Optional — comma-separated admin email allowlist |
| `ADMIN_SESSION_SECRET` | Random string ≥ 32 chars (generate with `openssl rand -hex 32`) |
| `ISR_REVALIDATION_SECRET` | Random string (generate with `openssl rand -hex 16`) |
| `ECR_REGISTRY` | AWS account ECR registry URL (e.g. `123456789.dkr.ecr.us-east-1.amazonaws.com`) |
| `ECS_CLUSTER` | ECS cluster name (e.g. `augustine-dev`) |
| `ECS_SERVICE` | ECS service name (e.g. `augustine-web-dev`) |
| `CLOUDFRONT_DISTRIBUTION_ID` | Dev CloudFront distribution ID (after step 8) |

#### Variables (GitHub env → `dev`)

| Variable name | Value |
|---|---|
| `SITE_URL` | `https://dev.augustinehomeimprovements.com` |
| `CONTACT_API_URL` | API Gateway endpoint URL (after step 3) |
| `AWS_REGION` | `us-east-1` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `G-BG798Y9ZT0` (optional) |

---

### 2. SES — Email Setup

> Skip if you only need a build/deploy smoke test without live email.

1. In AWS Console → SES → Verified identities → Verify domain `augustinehomeimprovements.com`
2. Add the DNS TXT/DKIM/MAIL-FROM records SES provides
3. If still in **SES sandbox**: either add `info@augustinehomeimprovements.com` as a verified address, or file a ticket for production access

---

### 3. Lambda + API Gateway — Contact Form

```bash
cd infra/lambda
zip contact-handler.zip contact-handler.js

# Create Lambda (replace ACCOUNT_ID)
aws lambda create-function \
  --function-name augustine-contact-form-dev \
  --runtime nodejs20.x \
  --handler contact-handler.handler \
  --zip-file fileb://contact-handler.zip \
  --role arn:aws:iam::ACCOUNT_ID:role/augustine-lambda-role

# Set Lambda environment variables
aws lambda update-function-configuration \
  --function-name augustine-contact-form-dev \
  --environment "Variables={
    SES_FROM_EMAIL=noreply@augustinehomeimprovements.com,
    CONTACT_RECIPIENT_EMAIL=info@augustinehomeimprovements.com,
    ALLOWED_ORIGIN=https://dev.augustinehomeimprovements.com,
    AWS_REGION=us-east-1
  }"
```

Create the HTTP API Gateway:
- Route: `POST /contact`
- Integration: Lambda `augustine-contact-form-dev`
- CORS allowed origin: `https://dev.augustinehomeimprovements.com`
- Stage: `dev`
- Copy the endpoint URL → set as `CONTACT_API_URL` GitHub var (step 1)

Lambda IAM role needs:
- `AWSLambdaBasicExecutionRole`
- `ses:SendEmail` on `arn:aws:ses:us-east-1:ACCOUNT_ID:identity/augustinehomeimprovements.com`

---

### 4. OIDC IAM Role for GitHub Actions

```bash
# Trust policy (save as trust.json) — replace GITHUB_ORG/REPO
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com" },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
      },
      "StringLike": {
        "token.actions.githubusercontent.com:sub": "repo:GITHUB_ORG/REPO:environment:dev"
      }
    }
  }]
}

aws iam create-role \
  --role-name augustine-deploy-role-dev \
  --assume-role-policy-document file://trust.json
```

Attach permissions:
- `AmazonEC2ContainerRegistryPowerUser` (ECR push)
- ECS `update-service`, CloudFront `create-invalidation` (inline or managed)

---

### 5. ECR Repository

```bash
aws ecr create-repository \
  --repository-name augustine-home-improvements-dev \
  --region us-east-1
```

---

### 6. Add Dockerfile

Create `Dockerfile` at the repo root (see `infra/README.md` for the reference Dockerfile).
Build from `.next/standalone/` output.

---

### 7. ECS Fargate — Cluster, Task Def, Service

1. Create ECS cluster `augustine-dev` (Fargate)
2. Create task definition using ECR image, port 3000, set all env vars:
   - `NODE_ENV=production`
   - `PORT=3000`
   - `COGNITO_*`, `ADMIN_SESSION_SECRET`, `ISR_REVALIDATION_SECRET`
   - `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_CONTACT_API_URL`
3. Create ECS service `augustine-web-dev` behind an ALB (HTTPS, port 443 → 3000)

---

### 8. CloudFront Distribution (dev)

1. Create a CloudFront distribution pointing at the dev ALB
2. Configure HTTPS (ACM certificate for `dev.augustinehomeimprovements.com`)
3. Copy distribution ID → set as `CLOUDFRONT_DISTRIBUTION_ID` GitHub secret

---

### 9. Cognito — Admin Auth

1. Create a Cognito User Pool in `us-east-1`
2. Configure Hosted UI domain
3. Create App Client with callback URLs:
   - `https://dev.augustinehomeimprovements.com/api/admin/auth/callback`
   - `http://localhost:3000/api/admin/auth/callback` (for local dev)
4. Create group `super_user`, add owner user
5. Copy domain/pool/client values → set GitHub secrets (step 1)

---

### 10. Trigger First Dev Deploy

Once all secrets/vars are set in GitHub:

```bash
git push origin dev
```

Or trigger manually via GitHub Actions → "Build & Deploy to AWS (dev)" → "Run workflow".

---

### 11. DNS

Point `dev.augustinehomeimprovements.com` → CloudFront distribution domain
(e.g. `xxxx.cloudfront.net`), or use Route 53 alias record.

---

## What Still Needs to Happen for Prod

| Item | Notes |
|---|---|
| Prod Cognito callback URL | `https://www.augustinehomeimprovements.com/api/admin/auth/callback` |
| Prod ECR / ECS / CloudFront | Separate from dev resources |
| GitHub `production` environment | Mirror of `dev` environment with prod values |
| `deploy.yml` on `main` branch | Already partially written — uncomment ECS deploy job |
| DNS cutover | Lower TTL 48h before launch |
| SES production access | File AWS support request |
| Real project photos | Upload via admin panel |

---

## Quick Local Test (no AWS)

```bash
cp .env.example .env.local
# Fill in ADMIN_SESSION_SECRET and ISR_REVALIDATION_SECRET (any random strings work locally)
npm install
npm run dev
# Visit http://localhost:3000
```

Contact form will log submissions to the console if `NEXT_PUBLIC_CONTACT_API_URL` is blank.
