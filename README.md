# Augustine Home Improvements

Static Next.js website for [Augustine Home Improvements](https://www.augustinehomeimprovements.com/) — a veteran-owned home improvement contractor serving Chester County PA.

## Stack

- **Next.js 15** with `output: "export"` (static site)
- **Tailwind CSS** for styling
- **AWS S3 + CloudFront** for hosting (app-owned Terraform)
- **GitHub Actions** for CI/CD (branch → environment deploy)

## Branch → Environment Model

| Branch | Environment | AWS Account |
|--------|-------------|-------------|
| `dev`  | dev         | 518692945749 |
| `main` | prod        | TBD |

## Local Development

```bash
cp .env.example .env.local
npm install
npm run dev
```

## Build

```bash
npm run build
# Static output written to ./out/
```

## CI/CD

- **CI** (`ci.yml`): lint, typecheck, build — runs on push to `dev` and PRs
- **Deploy** (`deploy.yml`): Terraform apply → S3 sync → CloudFront invalidation — runs on push to `dev` and `main`

## Infrastructure

Terraform lives in `infrastructure/`. Uses the same S3/CloudFront pattern as company-homepage:

- S3 bucket (private, OAC-only access)
- CloudFront distribution with security headers
- ACM certificate (only for prod with custom domain aliases)

### Prerequisites Before First Deploy

1. **Terraform state backend** — S3 bucket `augustine-terraform-state` + DynamoDB table `augustine-terraform-locks` must exist in dev account (518692945749). Create once, manually or via bootstrap.
2. **IAM roles** — `github-actions-deployer` and `github-actions-terraform-state` roles in the dev account with OIDC trust for this repo.
3. **GitHub environment** — Create `dev` environment in GitHub repo settings (no extra protection rules needed for dev).

### Contact Form

The contact form uses a fake-success UX until `NEXT_PUBLIC_CONTACT_API_URL` is set. To wire it for real:
- Add an API Gateway + Lambda in `infrastructure/` (see company-homepage's `contact_form.tf` for the pattern)
- Set `NEXT_PUBLIC_CONTACT_API_URL` as a GitHub Actions environment variable
