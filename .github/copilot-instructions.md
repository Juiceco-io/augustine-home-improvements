# Platform Context for Augustine Home Improvements

> This file was seeded automatically at repo bootstrap. It describes the
> infrastructure that already exists so you can build and deploy without
> needing access to the `github-infra` repo.

---

## App identity

| Field | Value |
|-------|-------|
| Slug | `augustine-home-improvements` |
| Name | Augustine Home Improvements |
| Class | `unknown` |

---

## What was already provisioned

When this repo was created, the following infrastructure was bootstrapped
automatically — you do not need to create any of it:

**GitHub**
- Repository `Juiceco-io/augustine-home-improvements` with branches `main`, `dev`, `qa`
- Branch protections on all three branches (1 approving review, CODEOWNERS `@sauerm1`)
- GitHub Environments: `dev` (deploys from `dev`), `qa` (deploys from `qa`), `prod` (deploys from `main`)
- `.github/workflows/ci.yml` — runs Lint, Typecheck & Build on push/PR
- `.github/workflows/promote-guardrail.yml` — enforces `qa → main` only promotions
- `.github/CODEOWNERS` — `* @sauerm1`

**AWS (one account per environment)**
| GitHub Environment | AWS Account | Branch |
|-------------------|-------------|--------|
| `dev` | `augustine-home-improvements-dev` | `dev` |
| `qa` | `augustine-home-improvements-qa` | `qa` |
| `prod` | `augustine-home-improvements-prd` | `main` |

Each AWS account has:
- An OIDC provider configured for GitHub Actions
- An IAM role named `github-actions-deployer` (trusted only for this repo + its matching environment)
- An IAM role named `alfred-readonly` (for read-only platform tooling access)

**GitHub Environment variables (pre-populated per environment)**
| Variable | Value |
|----------|-------|
| `AWS_ACCOUNT_ID` | Set per environment |
| `AWS_DEPLOYER_ROLE_ARN` | `arn:aws:iam::<account_id>:role/github-actions-deployer` |

Reference them in workflows as `$\{{ vars.AWS_ACCOUNT_ID }}` and
`$\{{ vars.AWS_DEPLOYER_ROLE_ARN }}`. Do not hardcode account IDs or role ARNs.

---

## How to deploy

Deployments use the shared reusable workflow in `github-infra`. You write a
thin caller workflow per environment; the platform handles OIDC auth.

### Minimal caller workflow example (deploy to dev)

Create `.github/workflows/deploy-dev.yml`:

```yaml
name: Deploy — Dev

on:
  push:
    branches:
      - dev

jobs:
  deploy:
    name: Deploy to dev
    permissions:
      id-token: write
      contents: read
    uses: Juiceco-io/github-infra/.github/workflows/app-deploy.yml@main
    with:
      environment: dev
      aws_role_to_assume: $\{{ vars.AWS_DEPLOYER_ROLE_ARN }}
      aws_region: us-east-1
      working_directory: .
      deploy_command: npm run deploy:dev
    secrets: inherit
```

Repeat for `qa` (trigger on `qa` branch, `environment: qa`, `deploy_command: npm run deploy:qa`)
and `prod` (trigger on `main` branch, `environment: prod`, `deploy_command: npm run deploy:prod`).

### Reusable workflow inputs

| Input | Required | Default | Notes |
|-------|----------|---------|-------|
| `aws_role_to_assume` | yes | — | Always use `$\{{ vars.AWS_DEPLOYER_ROLE_ARN }}` |
| `deploy_command` | yes | — | Your app's deploy script, e.g. `npm run deploy:dev` |
| `environment` | no | `dev` | Must match the GitHub Environment name |
| `aws_region` | no | `us-east-1` | |
| `working_directory` | no | `.` | |
| `node_version` | no | `20` | |
| `install_command` | no | `npm ci` | |
| `build_command` | no | _(empty)_ | Optional pre-deploy build step |

---

## Git branching model

```
feature branches
      ↓  PR to dev
    dev  ──── deploys to dev AWS account ────▶ dev env
      ↓  PR to qa (Mark approves)
     qa  ──── deploys to qa AWS account  ────▶ qa env
      ↓  PR to main (Mark approves; must come from qa)
    main ──── deploys to prd AWS account ────▶ prod env
```

- `main` IS the production branch — there is no separate `prd` branch
- Only `qa` can open PRs to `main` (enforced by the promote-guardrail workflow)
- Only `@sauerm1` can approve and merge PRs

---

## Platform conventions

### AWS
- **No long-lived AWS access keys** — OIDC only. Never create `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` secrets.
- **Secrets**: use AWS Secrets Manager (not SSM Parameter Store)
- **Static sites / Next.js exports**: prefer CloudFront + S3
- **Serverless**: prefer Lambda + DynamoDB on-demand
- **Public-facing apps**: WAF required (`AWSManagedRulesCommonRuleSet` + rate limiting)
- **Apps with user accounts**: use Cognito — never roll your own JWT validation
- **Resource tagging**: always tag with `app = "augustine-home-improvements"`, `env = <env>`, `team = <team>`
- **Budget alerts**: $50/mo dev, $500/mo prd (provisioned automatically)
- **`api-service` apps**: must expose `GET /health` endpoint

### Terraform state
- **All apps share one central S3 backend** — never create a per-app state bucket.
  - Bucket: `juiceco-terraform-state` · Region: `us-east-1`
  - Lock table: `juiceco-terraform-locks` (DynamoDB) · Encrypt: `true`
- **State key convention**: `augustine-home-improvements/<environment>/terraform.tfstate`
- The `key` is injected at init time via `-backend-config="key=..."` in CI — **do not hardcode `key` or `role_arn` in the backend block**.
- The backend block in `main.tf` should look like this:
  ```hcl
  backend "s3" {
    bucket         = "juiceco-terraform-state"
    region         = "us-east-1"
    dynamodb_table = "juiceco-terraform-locks"
    encrypt        = true
    # key and role_arn are injected by CI via -backend-config
  }
  ```
- Full backend docs: [`github-infra/terraform-state-backend/docs/BACKEND.md`](https://github.com/Juiceco-io/github-infra/blob/main/terraform-state-backend/docs/BACKEND.md)

### GitHub Actions / secrets
- App-specific secrets (API keys, webhook tokens, etc.) are added via `gh secret set` after bootstrap — never committed to the repo or to `github-infra`
- The `github-infra` reusable workflows must be allowed in this repo's Actions settings (Settings → Actions → General → Allow Juiceco-io/github-infra workflows)

### Observability (required baseline for all apps)
- Emit structured JSON logs with fields: `traceId`, `appSlug`, `env`
- CloudWatch Alarm: 5xx rate > 1% over 5 minutes
- X-Ray tracing on Lambda and API Gateway
- Production additions: CloudWatch dashboard, synthetic canary, saved Log Insights queries

---

## Useful links

- [App deploy contract](https://github.com/Juiceco-io/github-infra/blob/main/docs/app-deploy-contract.md)
- [New repo bootstrap guide](https://github.com/Juiceco-io/github-infra/blob/main/docs/new-repo-bootstrap.md)
- [Deploy caller examples](https://github.com/Juiceco-io/github-infra/tree/main/docs/examples)
- [Platform guidelines](https://github.com/Juiceco-io/github-infra/blob/main/docs/new-app-platform-guidelines.md)
