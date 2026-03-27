# Dev Deployment Checklist

This is the immediate path to get the site running in a **dev** environment on AWS.
Prod/QA are intentionally out of scope for now.

**Deployment model:** Infrastructure (including Cognito) is managed via Terraform through PRs.
Manual AWS Console setup is not the expected path. See [docs/deployment-model.md](../docs/deployment-model.md)
for the full vars/secrets reference.

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
- `terraform` CLI installed
- GitHub repo admin access (to set secrets/vars and create environment)
- Docker installed locally (for image builds)

---

## Step-by-Step Checklist

### 1. Create GitHub `dev` Environment

In GitHub repo → Settings → Environments → New environment → name it `dev`.

See [docs/deployment-model.md](../docs/deployment-model.md) for the full
vars/secrets reference. Summary:

#### Variables (non-sensitive config — set as GitHub env *variables*)

| Variable | Value |
|---|---|
| `SITE_URL` | `https://dev.augustinehomeimprovements.com` |
| `COGNITO_USER_POOL_ID` | Set after Terraform apply (step 4) |
| `COGNITO_APP_CLIENT_ID` | Set after Terraform apply (step 4) |
| `COGNITO_DOMAIN` | Set after Terraform apply (step 4) |
| `CONTACT_API_URL` | Set after API Gateway is created (step 3) |
| `AWS_REGION` | `us-east-1` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `G-BG798Y9ZT0` (optional) |

#### Secrets (sensitive values only — set as GitHub env *secrets*)

| Secret | Value |
|---|---|
| `ADMIN_SESSION_SECRET` | Random string ≥ 32 chars — `openssl rand -hex 32` |
| `ISR_REVALIDATION_SECRET` | Random string — `openssl rand -hex 16` |
| `AWS_ROLE_ARN` | ARN of OIDC role for GitHub Actions (step 5) |
| `COGNITO_SUPERUSER_EMAILS` | Optional — comma-separated admin email(s) for bootstrap |
| `ECR_REGISTRY` | AWS ECR registry URL (step 6) |
| `ECS_CLUSTER` | ECS cluster name (step 8) |
| `ECS_SERVICE` | ECS service name (step 8) |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution ID (step 9) |

---

### 2. SES — Email Setup

> Skip if you only need a build/deploy smoke test without live email.

```bash
# Verify the domain via CLI (then add the DNS records SES provides)
aws ses verify-domain-identity --domain augustinehomeimprovements.com --region us-east-1

# If still in SES sandbox, verify the recipient email:
aws ses verify-email-identity --email-address info@augustinehomeimprovements.com --region us-east-1
```

For production traffic, file an AWS support request to exit SES sandbox.

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

# Set Lambda environment variables (non-sensitive config — not secrets)
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
- Copy the endpoint URL → set as `CONTACT_API_URL` GitHub variable (step 1)

Lambda IAM role needs:
- `AWSLambdaBasicExecutionRole`
- `ses:SendEmail` on `arn:aws:ses:us-east-1:ACCOUNT_ID:identity/augustinehomeimprovements.com`

---

### 4. Cognito — Admin Auth (via Terraform)

Cognito is provisioned via Terraform, not the AWS Console.

```bash
# From infra/terraform/ (create this directory with cognito.tf if not present)
terraform init
terraform plan -var="environment=dev"
terraform apply -var="environment=dev"
```

Terraform will create:
- Cognito User Pool
- Hosted UI domain (`augustine-admin-dev.auth.us-east-1.amazoncognito.com`)
- App Client with callback URLs:
  - `https://dev.augustinehomeimprovements.com/api/admin/auth/callback`
  - `http://localhost:3000/api/admin/auth/callback`
- Group: `super_user`

After apply, capture outputs and set as GitHub env **variables** (not secrets):
```bash
terraform output -raw user_pool_id      # → COGNITO_USER_POOL_ID
terraform output -raw client_id         # → COGNITO_APP_CLIENT_ID
terraform output -raw hosted_ui_domain  # → COGNITO_DOMAIN
```

**Super-user bootstrap:** Set `COGNITO_SUPERUSER_EMAILS` as a GitHub secret before
the first deploy. The app will seed the initial admin account from that list on
first boot, so no manual console access is needed.

---

### 5. OIDC IAM Role for GitHub Actions

```bash
# Save as trust.json — replace ACCOUNT_ID and GITHUB_ORG/REPO
cat > trust.json << 'EOF'
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
EOF

aws iam create-role \
  --role-name augustine-deploy-role-dev \
  --assume-role-policy-document file://trust.json
```

Attach permissions:
- `AmazonEC2ContainerRegistryPowerUser` (ECR push)
- ECS `update-service`, CloudFront `create-invalidation` (inline or managed)

Copy the role ARN → set as `AWS_ROLE_ARN` GitHub secret.

---

### 6. ECR Repository

```bash
aws ecr create-repository \
  --repository-name augustine-home-improvements-dev \
  --region us-east-1
```

Copy the registry URL → set as `ECR_REGISTRY` GitHub secret.

---

### 7. Add Dockerfile

Create `Dockerfile` at the repo root (see `infra/README.md` for the reference Dockerfile).
Build from `.next/standalone/` output.

---

### 8. ECS Fargate — Cluster, Task Def, Service

1. Create ECS cluster `augustine-dev` (Fargate)
2. Create task definition using ECR image, port 3000, set env vars on the task:
   - `NODE_ENV=production`
   - `PORT=3000`
   - `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_CONTACT_API_URL`
   - Cognito vars (from Terraform outputs): `COGNITO_USER_POOL_ID`, `COGNITO_APP_CLIENT_ID`, `COGNITO_DOMAIN`
   - Secrets (from AWS Secrets Manager or SSM): `ADMIN_SESSION_SECRET`, `ISR_REVALIDATION_SECRET`
3. Create ECS service `augustine-web-dev` behind an ALB (HTTPS, port 443 → 3000)

Copy cluster and service names → set `ECS_CLUSTER` and `ECS_SERVICE` GitHub secrets.

---

### 9. CloudFront Distribution (dev)

1. Create a CloudFront distribution pointing at the dev ALB
2. Configure HTTPS (ACM certificate for `dev.augustinehomeimprovements.com`)
3. Copy distribution ID → set as `CLOUDFRONT_DISTRIBUTION_ID` GitHub secret

---

### 10. Trigger First Dev Deploy

Once all vars/secrets are set in GitHub:

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
| Terraform for prod Cognito | Separate User Pool / App Client with prod callback URL |
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
Admin panel requires Cognito vars if you want OAuth to work locally.
