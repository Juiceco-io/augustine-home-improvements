# Dev Deployment Checklist

This is the immediate path to get the site running in a **dev** environment on AWS.

**Deployment model:**
- Terraform is the single source of truth for infrastructure identifiers.
- Workflows read from Terraform outputs first; GitHub env variables are fallbacks only.
- See [docs/deployment-model.md](../docs/deployment-model.md) for full reference.

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
- `terraform` CLI ≥ 1.6 installed
- GitHub repo admin access (to set secrets and create environments)
- Docker installed locally (for image builds)

---

## Step-by-Step Checklist

### 1. Create GitHub `dev` Environment

In GitHub repo → Settings → Environments → New environment → name it `dev`.

#### Secrets (4 total — these are the only secrets needed)

| Secret | Value |
|---|---|
| `ADMIN_SESSION_SECRET` | Random string ≥ 32 chars — `openssl rand -hex 32` |
| `ISR_REVALIDATION_SECRET` | Random string — `openssl rand -hex 16` |
| `AWS_ROLE_ARN` | ARN of OIDC role for GitHub Actions (step 5). Bootstrap only — can be removed once TF `github_actions_role_arn` output is live. |
| `COGNITO_SUPERUSER_EMAILS` | Optional — comma-separated admin email(s) for bootstrap |

#### Variables (bootstrap fallbacks — remove as Terraform outputs become available)

| Variable | Value | Remove after |
|---|---|---|
| `SITE_URL` | CloudFront distribution URL (e.g. `https://dXXXXX.cloudfront.net`) | DNS + custom domain is live (set domain as override then) |
| `COGNITO_USER_POOL_ID` | Set after Terraform apply (step 4) | Terraform `cognito_user_pool_id` output is populated |
| `COGNITO_APP_CLIENT_ID` | Set after Terraform apply (step 4) | Terraform `cognito_app_client_id` output is populated |
| `COGNITO_DOMAIN` | Set after Terraform apply (step 4) | Terraform `cognito_domain` output is populated |
| `CONTACT_API_URL` | Set after API Gateway is created (step 3) | Terraform `contact_api_url` output is populated |
| `AWS_REGION` | `us-east-1` | Never (unlikely to change) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `G-BG798Y9ZT0` (optional) | Never (analytics tag, not TF-managed) |

> **Note on bootstrap:** Variables are only needed until the corresponding Terraform
> resource is provisioned and its output is available. Once Terraform outputs are
> populated the workflows ignore the GitHub variables automatically.

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

> **Preferred path:** Declare these in `infra/terraform/api-gateway.tf` so the
> `contact_api_url` output is populated automatically.  The manual CLI path below
> is a bootstrap shortcut until Terraform covers it.

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
    ALLOWED_ORIGIN=https://dXXXXX.cloudfront.net,
    AWS_REGION=us-east-1
  }"
```

Create the HTTP API Gateway:
- Route: `POST /contact`
- Integration: Lambda `augustine-contact-form-dev`
- CORS allowed origin: CloudFront distribution URL
- Stage: `dev`
- Copy the endpoint URL → set as `CONTACT_API_URL` GitHub variable (temporary, until TF output exists)

Lambda IAM role needs:
- `AWSLambdaBasicExecutionRole`
- `ses:SendEmail` on `arn:aws:ses:us-east-1:ACCOUNT_ID:identity/augustinehomeimprovements.com`

---

### 4. Cognito — Admin Auth (via Terraform)

Cognito is provisioned via Terraform, not the AWS Console.

```bash
cd infra/terraform
terraform init
terraform plan -var="environment=dev"
terraform apply -var="environment=dev"
```

Terraform will create:
- Cognito User Pool
- Hosted UI domain (`augustine-admin-dev.auth.us-east-1.amazoncognito.com`)
- App Client with callback URLs:
  - `https://dXXXXX.cloudfront.net/api/admin/auth/callback`
  - `http://localhost:3000/api/admin/auth/callback`
- Group: `super_user`

After apply, the `cognito_user_pool_id`, `cognito_app_client_id`, and `cognito_domain`
outputs are automatically read by the next deploy via the `tf-outputs` workflow job.
You can also set them as GitHub variables now as a fallback:

```bash
terraform output -raw cognito_user_pool_id   # → COGNITO_USER_POOL_ID (GitHub variable)
terraform output -raw cognito_app_client_id  # → COGNITO_APP_CLIENT_ID (GitHub variable)
terraform output -raw cognito_domain         # → COGNITO_DOMAIN (GitHub variable)
```

Once the `tf-outputs` job is reading these reliably, remove the GitHub variables.

**Super-user bootstrap:** Set `COGNITO_SUPERUSER_EMAILS` as a GitHub secret before
the first deploy. The app will seed the initial admin account from that list on
first boot.

---

### 5. OIDC IAM Role for GitHub Actions

> **Preferred path:** Declare this in `infra/terraform/iam.tf` so the
> `github_actions_role_arn` output eliminates the need for `AWS_ROLE_ARN` as a secret.

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
        "token.actions.githubusercontent.com:sub": "repo:Juiceco-io/augustine-home-improvements:environment:dev"
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
- S3 read access to Terraform state bucket

Copy the role ARN → set as `AWS_ROLE_ARN` GitHub secret.

---

### 6. ECR Repository

> **Preferred path:** Declare in `infra/terraform/ecr.tf` so `ecr_repository_url`
> output is available to workflows.  Manual CLI path below for bootstrap:

```bash
aws ecr create-repository \
  --repository-name augustine-home-improvements-dev \
  --region us-east-1
```

The ECR registry URL is derived from `ecr_registry` / `ecr_repository_url` Terraform
outputs — no GitHub secret or variable needed.

---

### 7. Add Dockerfile

Create `Dockerfile` at the repo root (see `infra/README.md` for the reference Dockerfile).
Build from `.next/standalone/` output.

---

### 8. ECS Fargate — Cluster, Task Def, Service

> **Preferred path:** Declare in `infra/terraform/ecs.tf` so `ecs_cluster_name` and
> `ecs_service_name` outputs are available.

1. Create ECS cluster `augustine-dev` (Fargate)
2. Create task definition using ECR image, port 3000, set env vars on the task:
   - `NODE_ENV=production`
   - `PORT=3000`
   - `NEXT_PUBLIC_APP_URL` ← from Terraform `cloudfront_url` output
   - `NEXT_PUBLIC_CONTACT_API_URL` ← from Terraform `contact_api_url` output
   - `COGNITO_USER_POOL_ID`, `COGNITO_APP_CLIENT_ID`, `COGNITO_DOMAIN` ← TF outputs
   - `ADMIN_SESSION_SECRET`, `ISR_REVALIDATION_SECRET` ← from AWS Secrets Manager
3. Create ECS service `augustine-web-dev` behind an ALB (HTTPS, port 443 → 3000)

---

### 9. CloudFront Distribution (dev)

> **Preferred path:** Declare in `infra/terraform/cloudfront.tf` so `cloudfront_url`
> and `cloudfront_distribution_id` outputs are available.

1. Create a CloudFront distribution pointing at the dev ALB
2. Configure HTTPS (ACM certificate for `dev.augustinehomeimprovements.com`)
3. The distribution URL becomes the `cloudfront_url` Terraform output — no GitHub
   variable needed to pass it to the build.

---

### 10. Terraform Backend (S3 state)

Enable remote state so the `tf-outputs` workflow job can read outputs from CI:

```bash
aws s3 create-bucket \
  --bucket augustine-tfstate \
  --region us-east-1

aws s3api put-bucket-versioning \
  --bucket augustine-tfstate \
  --versioning-configuration Status=Enabled
```

Then uncomment the `backend "s3"` block in `infra/terraform/providers.tf` and run:

```bash
terraform init -migrate-state
```

---

### 11. Trigger First Dev Deploy

Once secrets and bootstrap variables are set in GitHub:

```bash
git push origin dev
```

Or trigger manually via GitHub Actions → "Build & Deploy to AWS (dev)" → "Run workflow".

---

### 12. DNS

Point `dev.augustinehomeimprovements.com` → CloudFront distribution domain
(e.g. `xxxx.cloudfront.net`), or use Route 53 alias record.

---

## Tracking Terraform Coverage

As each resource moves from manual CLI → Terraform, mark it here:

| Resource | Terraform file | Status |
|---|---|---|
| Cognito User Pool + Client | `cognito.tf` | ⬜ TODO |
| Lambda + API Gateway | `api-gateway.tf` | ⬜ TODO |
| CloudFront distribution | `cloudfront.tf` | ⬜ TODO |
| ECR repository | `ecr.tf` | ⬜ TODO |
| ECS cluster + service | `ecs.tf` | ⬜ TODO |
| OIDC IAM role | `iam.tf` | ⬜ TODO |
| S3 Terraform backend | `providers.tf` | ⬜ TODO |

---

## What Still Needs to Happen for Prod

| Item | Notes |
|---|---|
| Terraform for prod Cognito | Separate User Pool / App Client with prod callback URL |
| Prod ECR / ECS / CloudFront | Separate from dev resources |
| GitHub `production` environment | Mirror of `dev` environment — secrets only |
| `deploy.yml` on `main` branch | Already written — uncomment ECS deploy job |
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
