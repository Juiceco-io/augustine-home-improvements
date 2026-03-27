# Deployment Model

## Principles

1. **Terraform outputs are the source of truth** for infrastructure identifiers.
2. **No hardcoded domain** — site URL comes from Terraform output first.
3. **Cognito is PR-managed infrastructure** — not AWS-console-managed.
4. **Secrets are minimal** — only values that cannot be derived from infra state stay in GitHub secrets.
5. **GitHub variables are bootstrap fallbacks only** until Terraform outputs exist.

## Terraform Outputs Expected

These outputs should eventually be produced by Terraform and consumed by workflows:
- `cloudfront_url`
- `cloudfront_distribution_id`
- `contact_api_url`
- `cognito_user_pool_id`
- `cognito_app_client_id`
- `cognito_domain`
- `ecr_repository_url`
- `ecs_cluster_name`
- `ecs_service_name`
- `github_actions_role_arn`

## Secrets

Keep only true secrets in GitHub environment secrets:
- `ADMIN_SESSION_SECRET`
- `ISR_REVALIDATION_SECRET`
- `COGNITO_SUPERUSER_EMAILS`
- `AWS_ROLE_ARN` (bootstrap only, removable once Terraform outputs it)

## Variables

Use GitHub environment variables only as temporary bootstrap fallbacks or overrides:
- `SITE_URL`
- `CONTACT_API_URL`
- `COGNITO_USER_POOL_ID`
- `COGNITO_APP_CLIENT_ID`
- `COGNITO_DOMAIN`
- `AWS_REGION`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`

## Accessing the site

Until DNS is configured, the site should be accessed via the CloudFront URL.
That URL should come from Terraform output (`cloudfront_url`) and flow into the build automatically.
