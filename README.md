# Augustine Home Improvements

Public marketing website for **Augustine Home Improvements LLC** — a veteran-owned home improvement contractor serving Chester County, PA and suburban Philadelphia.

**Live site:** [www.augustinehomeimprovements.com](https://www.augustinehomeimprovements.com)  
**Phone:** [484-467-7925](tel:+14844677925)

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, standalone) |
| Styling | Tailwind CSS v4 |
| Fonts | DM Sans + Playfair Display |
| Hosting | AWS CloudFront + ECS Fargate (Next.js standalone) |
| Contact Form Backend | AWS API Gateway + Lambda + SES |
| Admin Auth | Amazon Cognito Hosted UI |
| CI/CD | GitHub Actions |
| SEO | next-sitemap, JSON-LD schema, per-page metadata |

---

## Architecture

```
Browser
  └─► CloudFront
        ├─► ALB → ECS Fargate  ← Next.js standalone container
        │     (public pages, admin panel, Cognito OAuth, ISR)
        └─► API Gateway POST /contact
              └─► Lambda (infra/lambda/contact-handler.js)
                    └─► SES
```

**Why not fully static (S3)?** The admin panel requires server-side execution
(Cognito callback, middleware, ISR). Public pages are CloudFront-cached.

---

## Local Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Dev mode — contact form:** If `NEXT_PUBLIC_CONTACT_API_URL` is not set, the form
falls back to the local Next.js `/api/contact` route.

**Admin panel:** `/admin/login` requires Cognito env vars.

---

## Deployment

### Current Target: `dev`

The immediate goal is to get **dev** live first.

- `dev` branch should be the active deployment branch
- `.github/workflows/deploy-dev.yml` is the dev-specific workflow
- `infra/dev-checklist.md` is the exact step-by-step guide

This repo is prepared for dev deployment, but the AWS resources still have to exist
before a real deploy can complete.

### Manual build

```bash
NEXT_PUBLIC_CONTACT_API_URL=https://YOUR_API_GW_URL/contact npm run build
```

---

## Contact Form Backend

See [infra/README.md](infra/README.md) and [infra/dev-checklist.md](infra/dev-checklist.md).

Summary:
1. Verify SES domain/email in us-east-1
2. Deploy `infra/lambda/contact-handler.js`
3. Create API Gateway route `POST /contact`
4. Set `CONTACT_API_URL` for the frontend build

---

## Admin Panel (Cognito)

Use Amazon Cognito Hosted UI.

Recommended setup:
- User Pool in `us-east-1`
- Hosted UI domain
- App Client with callback URLs
- `super_user` group
- initial admin user in `super_user`

---

## Remaining Blockers

### Dev (immediate)

See **[infra/dev-checklist.md](infra/dev-checklist.md)** for the full sequence.

| # | Item | Action Required |
|---|------|----------------|
| 1 | GitHub `dev` environment | Add vars/secrets |
| 2 | SES | Verify sender / sandbox-compatible setup |
| 3 | Lambda + API Gateway | Deploy contact backend |
| 4 | Cognito (dev) | User Pool, Hosted UI, App Client |
| 5 | ECR | Create dev repo |
| 6 | Dockerfile | Add if missing |
| 7 | ECS Fargate | Cluster + service behind ALB |
| 8 | CloudFront | Create dev distribution |
| 9 | OIDC IAM role | Create dev deploy role |
| 10 | Enable deploy jobs | Uncomment/activate once infra exists |

### Prod (later)

Not the focus right now.

---

*Built by Juiceco-io · Veteran-Owned Business · Chester County PA*
