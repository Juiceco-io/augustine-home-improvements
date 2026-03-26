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
| Admin CMS | Custom lightweight admin panel (JWT-authenticated) |
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

**Admin panel:** Access at `/admin/login`. Default credentials in dev mode (no `ADMIN_PASSWORD_HASH` set): username `admin`, password `admin123`.

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
| `CONTACT_RECIPIENT_EMAIL` | Brandon's email for form submissions |
| `ADMIN_JWT_SECRET` | Admin session signing secret |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of admin password |
| `ISR_REVALIDATION_SECRET` | Webhook token for cache revalidation |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 ID (`G-BG798Y9ZT0`) |

---

## Admin Panel

Access `/admin/login` to manage site content.

**Initial admin password setup:**
```bash
# Install bcryptjs
npm install bcryptjs

# Generate password hash
node -e "const b = require('bcryptjs'); b.hash('YourNewPassword', 12).then(h => { console.log(h); process.exit(); })"
```

Set the output as `ADMIN_PASSWORD_HASH` in your environment.

---

## Contact Form → SES Setup

1. Verify your sending domain in AWS SES (SES → Verified Identities)
2. Request production access (move out of sandbox)
3. Set `SES_FROM_EMAIL` and `CONTACT_RECIPIENT_EMAIL` env vars
4. The `/api/contact` route handles rate limiting (3 req/10 min per IP) and server-side validation

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
| 2 | Admin password | Generate bcrypt hash, set `ADMIN_PASSWORD_HASH` + `ADMIN_JWT_SECRET` |
| 3 | Deployment target | Choose Vercel or AWS and configure secrets |
| 4 | DNS cutover | Lower TTL before launch, point domain to new host |
| 5 | Real project photos | Upload via admin panel once gallery CMS is activated |
| 6 | GA4 property | Confirm `G-BG798Y9ZT0` is correct (pre-configured) |
| 7 | bcryptjs dep | `npm install bcryptjs @types/bcryptjs` if running admin locally |
| 8 | `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Set in Vercel/CI env if GA4 is desired |

---

*Built by Juiceco-io · Veteran-Owned Business · Chester County PA*
