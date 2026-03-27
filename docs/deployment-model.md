# Deployment Model

## Principles

1. **Terraform outputs are the source of truth** — infrastructure identifiers
   (CloudFront URL, API Gateway URL, Cognito pool/client IDs, ECR/ECS names, IAM role ARN)
   are emitted as Terraform outputs and consumed directly by workflows.
   GitHub environment variables are a _fallback_ used only during the bootstrap phase
   (before Terraform has been applied) or to override the Terraform value
   (e.g. when a custom domain replaces the CloudFront URL).

2. **No hardcoded domain** — the public-facing URL is always driven by the
   `SITE_URL` / `NEXT_PUBLIC_APP_URL` environment variables.  The default source
   is the `cloudfront_url` Terraform output.  Only once a custom domain is wired
   to CloudFront and DNS is live should `vars.SITE_URL` override it.

3. **Cognito is PR-managed infrastructure** — provisioned via Terraform, not the
   AWS Console.  User Pool, App Client, Hosted UI domain, and groups are all
   declared in `infra/terraform/` and applied through CI.

4. **Secrets are truly minimal** — only four values that cannot be derived from
   infrastructure state live in GitHub env secrets:

   | Secret | Purpose |
   |---|---|
   | `ADMIN_SESSION_SECRET` | Signs `httpOnly` session cookies |
   | `ISR_REVALIDATION_SECRET` | Guards on-demand ISR revalidation |
   | `COGNITO_SUPERUSER_EMAILS` | Optional bootstrap — seeds the first admin account |
   | `AWS_ROLE_ARN` | OIDC role for the `tf-outputs` job during bootstrap only |

   > `AWS_ROLE_ARN` can be removed from GitHub secrets once the Terraform
   > `github_actions_role_arn` output is populated — at that point the workflow
   > reads it directly from Terraform state.

5. **ECR/ECS/CloudFront identifiers are not secrets** — they are Terraform outputs,
   not credentials. They no longer live in GitHub env secrets.

6. **Bootstrap super-user via CI** — the initial Cognito admin user can be seeded
   from `COGNITO_SUPERUSER_EMAILS` (GitHub secret), so there is no manual console
   step required.

7. **Local dev is first-class** — running `npm run dev` with a minimal `.env.local`
   works without live AWS resources.

---

## How it works: TF-outputs job

Both `deploy.yml` (production) and `deploy-dev.yml` (dev) start with a
`tf-outputs` job that:

1. Checks out the repo
2. Authenticates to AWS via OIDC
3. Runs `terraform init` (pointing at the remote state backend)
4. Calls `infra/scripts/export-tf-outputs.sh` to emit all outputs as
   step outputs (`steps.tf.outputs.*`)

The `build` job then uses `needs.tf-outputs.outputs.*` with `vars.*` as
fallback:

```yaml
COGNITO_USER_POOL_ID: >-
  ${{ needs.tf-outputs.outputs.cognito_user_pool_id
   || vars.COGNITO_USER_POOL_ID
   || '' }}
```

If the Terraform output is non-empty it wins.  If Terraform hasn't been
applied yet, the GitHub variable is used.  This means you can run a
successful build before any AWS infrastructure exists.

---

## Required Terraform Outputs

The following outputs **must** be declared in `infra/terraform/outputs.tf`
(stubs are already present — fill them in as each resource is provisioned):

| Terraform output | Consumed as | Status |
|---|---|---|
| `cloudfront_url` | `SITE_URL`, `NEXT_PUBLIC_APP_URL` | ⬜ not yet provisioned |
| `cloudfront_distribution_id` | CloudFront invalidation | ⬜ not yet provisioned |
| `contact_api_url` | `NEXT_PUBLIC_CONTACT_API_URL` | ⬜ not yet provisioned |
| `cognito_user_pool_id` | `COGNITO_USER_POOL_ID` | ⬜ not yet provisioned |
| `cognito_app_client_id` | `COGNITO_APP_CLIENT_ID` | ⬜ not yet provisioned |
| `cognito_domain` | `COGNITO_DOMAIN` | ⬜ not yet provisioned |
| `ecr_registry` | ECR login | ⬜ not yet provisioned |
| `ecr_repository_url` | Docker push URI | ⬜ not yet provisioned |
| `ecs_cluster_name` | `aws ecs update-service` | ⬜ not yet provisioned |
| `ecs_service_name` | `aws ecs update-service` | ⬜ not yet provisioned |
| `github_actions_role_arn` | OIDC `role-to-assume` | ⬜ not yet provisioned |

Update the Status column to ✅ as each resource is added to Terraform and
`terraform apply` has been run.

---

## Accessing the site

The site is served through CloudFront. **Until DNS is configured**, the site
is only accessible via the CloudFront distribution URL (e.g.
`https://dXXXXX.cloudfront.net`).  This URL comes from the `cloudfront_url`
Terraform output automatically — no manual step required.

Once Route 53 / your DNS provider points `augustinehomeimprovements.com` →
the CloudFront distribution and an ACM certificate is attached, set
`vars.SITE_URL` in each GitHub environment to the custom domain.  The
`vars.SITE_URL` fallback will take priority over the raw CloudFront URL.

---

## Environment Reference

### GitHub Secrets (`secrets.*`) — true secrets only

These are the **only** values that cannot be derived from Terraform and must
be set as GitHub env secrets.  Applies to both `dev` and `production`
environments.

| Secret | Description |
|---|---|
| `ADMIN_SESSION_SECRET` | Min 32-char random string — signs local session cookie after Cognito login. Generate: `openssl rand -hex 32` |
| `COGNITO_SUPERUSER_EMAILS` | Optional comma-separated email list to bootstrap the first Cognito super-user via CI |
| `ISR_REVALIDATION_SECRET` | Random token for on-demand ISR revalidation. Generate: `openssl rand -hex 16` |
| `AWS_ROLE_ARN` | OIDC IAM role ARN — **bootstrap only**: used by `tf-outputs` job before Terraform emits `github_actions_role_arn`. Remove once TF output is live. |

---

### GitHub Variables (`vars.*`) — overrides / bootstrap fallbacks

These are used only when the corresponding Terraform output is empty
(infrastructure not yet provisioned) or when you want to override the TF
value (e.g. custom domain over CloudFront URL).

| Variable | When to set |
|---|---|
| `SITE_URL` | Custom domain override once DNS is live (e.g. `https://www.augustinehomeimprovements.com`). Not needed once TF `cloudfront_url` is populated. |
| `COGNITO_USER_POOL_ID` | Bootstrap fallback before Cognito Terraform is applied |
| `COGNITO_APP_CLIENT_ID` | Bootstrap fallback before Cognito Terraform is applied |
| `COGNITO_DOMAIN` | Bootstrap fallback before Cognito Terraform is applied |
| `CONTACT_API_URL` | Bootstrap fallback before API Gateway Terraform is applied |
| `AWS_REGION` | `us-east-1` (unlikely to change) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `G-BG798Y9ZT0` (optional analytics tag) |

---

### Local development (`.env.local`)

Minimum to run the site locally without AWS:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_SESSION_SECRET=any-32-char-string-for-local-use
ISR_REVALIDATION_SECRET=any-string
```

To enable the local contact form fallback:
```bash
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
SES_FROM_EMAIL=noreply@augustinehomeimprovements.com
CONTACT_RECIPIENT_EMAIL=info@augustinehomeimprovements.com
```

To enable local admin panel (requires real Cognito):
```bash
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_APP_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
COGNITO_DOMAIN=https://augustine-admin-dev.auth.us-east-1.amazoncognito.com
```

---

## Cognito via Terraform (not Console)

Cognito infrastructure is declared in Terraform. The expected flow is:

1. A PR adds or updates `infra/terraform/cognito.tf`
2. CI runs `terraform plan` on the PR for review
3. On merge, `terraform apply` creates/updates the User Pool, App Client, and groups
4. Terraform outputs (`cognito_user_pool_id`, `cognito_app_client_id`, `cognito_domain`)
   are automatically read by the next deploy — no manual GitHub variable update needed
5. First deploy after provisioning can seed the super-user from
   `COGNITO_SUPERUSER_EMAILS` if set

> **No manual AWS Console steps are required or expected.**
> If you find yourself clicking through the Cognito console to set things up,
> that configuration should be moved to Terraform instead.

---

## What is and isn't a secret

| Config value | Type | Rationale |
|---|---|---|
| `COGNITO_USER_POOL_ID` | **TF output** (not secret) | Not sensitive — identifies a pool, not a credential |
| `COGNITO_APP_CLIENT_ID` | **TF output** (not secret) | Not sensitive — public identifier used in OAuth flows |
| `COGNITO_DOMAIN` | **TF output** (not secret) | Not sensitive — public Hosted UI URL |
| `CLOUDFRONT_DISTRIBUTION_ID` | **TF output** (not secret) | Not a credential — moved from GitHub secrets to TF output |
| `ECR_REGISTRY` | **TF output** (not secret) | Registry URL, not a credential |
| `ECS_CLUSTER` / `ECS_SERVICE` | **TF outputs** (not secret) | Resource names, not credentials |
| `CONTACT_API_URL` | **TF output** (not secret) | Public URL |
| `SITE_URL` | **TF output** → `vars.*` override | Public URL |
| `ADMIN_SESSION_SECRET` | **secret** | Signs session cookies — must be kept private |
| `COGNITO_SUPERUSER_EMAILS` | **secret** | Admin email list — limit blast radius |
| `ISR_REVALIDATION_SECRET` | **secret** | Controls cache revalidation — should be private |
| `AWS_ROLE_ARN` | **secret** (bootstrap) | IAM role — remove once TF `github_actions_role_arn` is live |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | **variable** | Analytics tag — public by nature |
| `AWS_REGION` | **variable** | `us-east-1` — not sensitive |
