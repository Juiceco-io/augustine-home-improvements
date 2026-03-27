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
| Fonts | DM Sans + Playfair Display (Google Fonts) |
| Hosting | AWS CloudFront + ECS Fargate (Next.js standalone) |
| Contact Form Backend | AWS API Gateway + Lambda + SES |
| Admin Auth | Amazon Cognito Hosted UI |
| CI/CD | GitHub Actions → ECR + ECS |
| SEO | next-sitemap, JSON-LD schema, per-page metadata |

---

## Architecture

```
Browser
  └─► CloudFront (CDN + HTTPS + security headers)
        ├─► ALB → ECS Fargate  ← Next.js standalone container
        │     (public pages cached at edge, admin panel, Cognito OAuth, ISR)
        └─► API Gateway POST /contact
              └─► Lambda (infra/lambda/contact-handler.js)
                    └─► SES → info@augustinehomeimprovements.com
```

**Why not fully static (S3)?** The admin panel requires server-side execution
(Cognito OAuth callback sets httpOnly cookies, middleware, ISR revalidation).
Public pages are CloudFront-cached for static-like performance.
Contact form is fully decoupled from the Next.js server via API Gateway + Lambda.

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy env example and fill in values
cp .env.example .env.local

# 3. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Dev mode — contact form:** If `NEXT_PUBLIC_CONTACT_API_URL` is not set, the form
falls back to the local Next.js `/api/contact` route. That route uses `SES_FROM_EMAIL`
and `CONTACT_RECIPIENT_EMAIL`; if those are also missing it logs submissions to the
console without sending email.

**Admin panel:** Access at `/admin/login`. Requires `COGNITO_DOMAIN`, `COGNITO_APP_CLIENT_ID`,
and related env vars to be set.

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage — hero, services, about, reviews, contact |
| `/deck-installation/` | Deck installation service page |
| `/kitchen-renovations/` | Kitchen renovations service page |
| `/bathroom-remodeling/` | Bathroom remodeling service page |
| `/basement-renovation/` | Basement renovation service page |
| `/home-additions/` | Home additions service page |
| `/home-renovations/` | Whole-home renovations service page |
| `/gallery/` | Project photo gallery |
| `/reviews/` | Customer testimonials |
| `/about-us/` | About Brandon Augustine |
| `/contact-us/` | Full contact form + info |
| `/admin/login` | Admin panel login (requires server runtime) |
| `/admin/dashboard` | Admin dashboard (requires server runtime) |

---

## Environment Variables

See [`.env.example`](.env.example) for a complete list.

| Variable | Where set | Purpose |
|----------|-----------|---------|
| `OUTPUT_MODE` | Build env | Set to `export` to produce static `out/` for S3+CloudFront |
| `NEXT_PUBLIC_CONTACT_API_URL` | Build env / var | API Gateway contact endpoint URL |
| `NEXT_PUBLIC_APP_URL` | Build env / var | Public app URL for Cognito callback redirects |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Build var | GA4 ID |
| `SES_FROM_EMAIL` | Lambda env | SES-verified sender *(set on Lambda, not frontend build)* |
| `CONTACT_RECIPIENT_EMAIL` | Lambda env | Destination email *(set on Lambda)* |
| `COGNITO_DOMAIN` | Build secret | Cognito Hosted UI domain |
| `COGNITO_USER_POOL_ID` | Build secret | Cognito User Pool ID |
| `COGNITO_APP_CLIENT_ID` | Build secret | Cognito app client ID |
| `COGNITO_SUPERUSER_EMAILS` | Build secret | Optional bootstrap allowlist |
| `ADMIN_SESSION_SECRET` | Build secret | Session-signing secret |
| `ISR_REVALIDATION_SECRET` | Build secret | Cache revalidation token |

---

## Deployment

### AWS ECS + CloudFront (production)

The `main` branch auto-deploys via GitHub Actions (`.github/workflows/deploy.yml`):

1. `npm run build` → produces `.next/standalone/` (Next.js standalone server)
2. Docker image built from standalone output → pushed to ECR
3. ECS service updated → CloudFront cache invalidated

**Required GitHub secrets / vars** — see [infra/README.md](infra/README.md) for the full list.

### Manual build

```bash
NEXT_PUBLIC_CONTACT_API_URL=https://YOUR_API_GW_URL/contact \
npm run build
# → .next/standalone/ is a self-contained Node.js server
```

---

## Contact Form Backend (Lambda + SES)

See [infra/README.md](infra/README.md) for full deploy instructions.

Quick summary:
1. Verify `augustinehomeimprovements.com` in SES + request production access
2. Deploy `infra/lambda/contact-handler.js` as a Lambda function (Node.js 20.x)
3. Create an API Gateway HTTP API with route `POST /contact` → Lambda
4. Set `CONTACT_API_URL` GitHub Actions variable to the API Gateway URL

---

## Admin Panel (Amazon Cognito)

Admin access uses **Amazon Cognito Hosted UI** and app-issued signed sessions.

> ⚠️ The admin panel (`/admin/*`) requires server-side execution (middleware + API routes).
> It is **not available in static export mode**. For production, deploy the admin panel
> separately in server mode or as a standalone Next.js container.

Recommended Cognito setup:
- Create a **User Pool** in `us-east-1`
- Create a Hosted UI domain
- Create an App Client with callback URLs:
  - Local: `http://localhost:3000/api/admin/auth/callback`
  - Prod: `https://www.augustinehomeimprovements.com/api/admin/auth/callback`
- Create a Cognito group named `super_user`
- Add the owner as the initial Cognito user and place in `super_user`
- Optional: set `COGNITO_SUPERUSER_EMAILS` as bootstrap allowlist

---

## SEO

- Per-page metadata with `export const metadata`
- JSON-LD `LocalBusiness` schema on homepage
- JSON-LD `Service` schema on each service page
- JSON-LD `Review` + `AggregateRating` on reviews page
- `sitemap.xml` generated via `next-sitemap` at build time
- `robots.txt` blocks `/admin/` and `/api/`
- GA4 tracking via `NEXT_PUBLIC_GA_MEASUREMENT_ID`

---

## Brand

- **Primary color:** `#671609` (brick red)
- **Secondary:** `#8d1e0c` (dark brick)
- **Accent:** `#b79a93` (light brick)
- **Fonts:** Playfair Display (headings) + DM Sans (body)
- **Facebook:** [@augustinehomeimprovements](https://www.facebook.com/augustinehomeimprovements)

---

## Remaining Blockers Before Launch

| # | Item | Action Required |
|---|------|----------------|
| 1 | SES domain verification | Verify `augustinehomeimprovements.com` in SES + request prod access |
| 2 | Lambda deploy | Package & deploy `infra/lambda/contact-handler.js` (see infra/README.md) |
| 3 | API Gateway | Create HTTP API, route POST /contact → Lambda, get endpoint URL |
| 4 | `CONTACT_API_URL` GitHub var | Set to API Gateway URL so build wires `NEXT_PUBLIC_CONTACT_API_URL` |
| 5 | Cognito setup | Create User Pool, Hosted UI, App Client, `super_user` group, initial user |
| 6 | ECR + ECS Fargate | Create ECR repo, ECS cluster/service/task-def; add Dockerfile |
| 7 | CloudFront distribution | Point to ALB origin (ECS); configure caching behaviors |
| 8 | OIDC role for CI | Create IAM role with ECR push + ECS deploy + CloudFront invalidation; link GitHub OIDC |
| 9 | GitHub secrets | Set all secrets/vars listed in infra/README.md |
| 10 | DNS cutover | Lower TTL before launch, point domain to CloudFront |
| 11 | Real project photos | Upload via admin panel once gallery CMS is finished |

---

*Built by Juiceco-io · Veteran-Owned Business · Chester County PA*
