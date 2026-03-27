# Dev Deployment Checklist

This is the immediate path to get the site running in a **dev** environment on AWS.

**Deployment model:**
- Terraform is the single source of truth for infrastructure identifiers.
- Workflows read Terraform outputs first; GitHub variables are bootstrap fallbacks only.
- See [docs/deployment-model.md](../docs/deployment-model.md) for the reference model.

## Prerequisites
- AWS account access
- `aws` CLI configured
- `terraform` CLI >= 1.6
- GitHub repo admin access
- Docker installed locally

## GitHub `dev` Environment

### Secrets
- `ADMIN_SESSION_SECRET`
- `ISR_REVALIDATION_SECRET`
- `COGNITO_SUPERUSER_EMAILS`
- `AWS_ROLE_ARN` (bootstrap only)

### Variables (bootstrap fallbacks only)
- `SITE_URL`
- `CONTACT_API_URL`
- `COGNITO_USER_POOL_ID`
- `COGNITO_APP_CLIENT_ID`
- `COGNITO_DOMAIN`
- `AWS_REGION=us-east-1`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`

## Preferred flow
1. Add Terraform resources for dev infra
2. `terraform apply`
3. workflows read outputs automatically
4. remove bootstrap GitHub variables once outputs exist

## Dev resources needed
- SES sender verification
- Lambda + API Gateway for contact
- Cognito user pool + client + domain
- ECR repo
- ECS cluster/service
- CloudFront distribution
- OIDC IAM role

## First deploy
- push to `dev`
- workflow reads TF outputs
- build runs
- deploy jobs can be uncommented once resources exist
