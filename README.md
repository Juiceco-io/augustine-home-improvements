# Augustine Home Improvements

Public marketing website for **Augustine Home Improvements LLC** — a veteran-owned home improvement contractor serving Chester County, PA and suburban Philadelphia.

**Live site:** [www.augustinehomeimprovements.com](https://www.augustinehomeimprovements.com)  
**Phone:** [484-467-7925](tel:+14844677925)

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v4 |
| Fonts | DM Sans + Playfair Display (Google Fonts) |
| Contact Form | Custom → AWS SES |
| Admin CMS | Custom admin panel secured by Amazon Cognito |
| Deployment | Vercel (preferred) or AWS S3 + CloudFront |
| CI/CD | GitHub Actions |
| SEO | next-sitemap, JSON-LD schema, per-page metadata |

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

**Dev mode:** If `SES_FROM_EMAIL` / `CONTACT_RECIPIENT_EMAIL` are not set, the contact form will log submissions to the console instead of sending emails.

**Admin panel:** Access at `/admin/login`. Admin authentication uses Amazon Cognito Hosted UI.

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
| `/admin/login` | Admin panel login |
| `/admin/dashboard` | Admin dashboard |

---

## Environment Variables

See [`.env.example`](.env.example) for a complete list. Key variables:

| Variable | Purpose |
|----------|---------|
| `SES_FROM_EMAIL` | SES-verified sender address |
| `CONTACT_RECIPIENT_EMAIL` | Destination email for form submissions |
| `COGNITO_DOMAIN` | Cognito Hosted UI domain |
| `COGNITO_USER_POOL_ID` | Cognito User Pool ID |
| `COGNITO_APP_CLIENT_ID` | Cognito app client used by the admin panel |
| `COGNITO_SUPERUSER_EMAILS` | Optional bootstrap allowlist for initial super-user access |
| `ADMIN_SESSION_SECRET` | App session-signing secret after Cognito login |
| `ISR_REVALIDATION_SECRET` | Webhook token for cache revalidation |
| `NEXT_PUBLIC_APP_URL` | Public app URL used for Cognito callback redirects |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 ID (`G-BG798Y9ZT0`) |

---

## Admin Panel (Amazon Cognito)

Admin access uses **Amazon Cognito Hosted UI** and app-issued signed sessions.

Recommended Cognito setup:
- Create a **User Pool** in `us-east-1`
- Create a Hosted UI domain
- Create an App Client with callback URL:
  - local: `http://localhost:3000/api/admin/auth/callback`
  - prod: `https://www.augustinehomeimprovements.com/api/admin/auth/callback`
- Create a Cognito group named `super_user`
- Add the owner as the initial Cognito user and place them in `super_user`
- Optional fallback: set `COGNITO_SUPERUSER_EMAILS` to allowlist the bootstrap admin email

Future user management should happen through the admin UI backed by Cognito admin APIs.

---

## Contact Form → SES Setup

1. Verify your sending domain/email in **AWS SES (us-east-1)**
2. Request production access (move out of sandbox)
3. Set `SES_FROM_EMAIL` and `CONTACT_RECIPIENT_EMAIL`
4. The `/api/contact` route handles validation, anti-spam basics, and SES delivery

---

## Deployment

### Vercel (Recommended)
1. Connect repo to Vercel
2. Set all environment variables in Vercel project settings
3. Deploy — Vercel handles Next.js builds natively

### AWS S3 + CloudFront
1. Configure AWS resources (see arch spec)
2. Set `AWS_ROLE_ARN`, `S3_BUCKET_NAME`, `CLOUDFRONT_DISTRIBUTION_ID` secrets
3. Uncomment the AWS deploy job in `.github/workflows/deploy.yml`

---

## SEO

- Per-page metadata with `export const metadata`
- JSON-LD `LocalBusiness` schema on homepage
- JSON-LD `Service` schema on each service page
- JSON-LD `Review` + `AggregateRating` on reviews page
- `sitemap.xml` generated via `next-sitemap` at build time
- `robots.txt` blocks `/admin/` and `/api/`
- GA4 tracking preserved (`G-BG798Y9ZT0`)

---

## Brand

- **Primary color:** `#671609` (brick red)
- **Secondary:** `#8d1e0c` (dark brick)
- **Accent:** `#b79a93` (light brick)
- **Fonts:** Playfair Display (headings) + DM Sans (body)
- **Facebook:** [@augustinehomeimprovements](https://www.facebook.com/augustinehomeimprovements)

---

## Remaining Config Blockers

| # | Item | Action Required |
|---|------|----------------|
| 1 | AWS SES domain verification | Verify `augustinehomeimprovements.com` in SES + request prod access |
| 2 | Cognito setup | Create User Pool, Hosted UI domain, app client, and initial `super_user` |
| 3 | App session secret | Set `ADMIN_SESSION_SECRET` |
| 4 | Deployment target | Choose Vercel or AWS and configure secrets |
| 5 | DNS cutover | Lower TTL before launch, point domain to new host |
| 6 | Real project photos | Upload via admin panel once gallery CMS is finished |
| 7 | `NEXT_PUBLIC_APP_URL` | Set to production domain for Cognito callback |
| 8 | `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Set in deploy env if GA4 is desired |

---

*Built by Juiceco-io · Veteran-Owned Business · Chester County PA*
