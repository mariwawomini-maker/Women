# She Stands Women’s Museum

An Angular frontend and a Node/Express/MongoDB API implementing the *She Stands Women’s Museum — Museum-Standard Website Content Master*, including a role-based Curator & Operations Desk (`/admin`), four dedicated payment pages (`/donate/mpesa`, `/donate/paypal`, `/donate/google-pay`, `/donate/card`), structured museum enquiries & school booking workflows, community memory wall moderation, digital collections catalogue, privacy-conscious impact analytics, and JSON/CSV backup exports.

## Architecture & Admin Connections

Every public section in the 52-section Content Master connects directly to `/admin`:

- **Museum Content & Public Copy (`/admin` → Museum Content):** Manages all 15 reusable museum content types (`exhibition`, `collection`, `heroine`, `oral-history`, `education`, `research`, `event`, `shop`, `news`, `press`, `partner`, `timeline`, `team`, `visit`, `document`) with context-aware museum fields (accession numbers, materials, dimensions, cultural context, provenance, rights, event times/capacity/accessibility, shop availability/maker, transcripts, content notices, related-record linking, owner & review dates) plus grouped editors for all public page copy and visitor operations.
- **Role-Based Access (`/admin`):** Supports three staff credentials via environment variables (`ADMIN_PASSWORD`, `CURATOR_PASSWORD`, `OPERATIONS_PASSWORD`), each supporting bcrypt hashes or plaintext secrets.
- **Donations Ledger & Payment Readiness (`/admin` → Overview / Donations):** Tracks gifts across M-PESA (KES), PayPal (USD), Google Pay (USD), and Stripe Card Checkout (USD) with designation/dedication records, reconciliation actions, CSV export, and a live server configuration readiness monitor.
- **Enquiries & Bookings (`/admin` → Enquiries & Bookings):** Receives all structured website forms (school visits, group tours, research access, volunteer applications, partnerships, media/press, shop orders, event registrations, membership, donations, teacher feedback, and rights/corrections) with honeypot spam protection and automatic department routing.
- **Stories & Community Wall (`/admin` → Story Submissions & Community Wall):** Requires explicit ethical & consent clearance before any submitted memory or Hall of Remembrance / Interactive Space reflection appears publicly. Private contributor emails and internal conservation/storage fields are never exposed by public endpoints.
- **Media Library (`/admin` → Media Library):** Uploads images, audio, video and PDFs to Cloudinary and places them onto the homepage hero, oral-history audio player, galleries, collections, learning, visit, or editorial entries.
- **Audience, Socials & Backups (`/admin` → Audience & Data):** Manages official social links, newsletter subscribers (with name and topic interests), and full JSON/CSV disaster-recovery exports.

## Deploy the API on Render

The root `render.yaml` defines a Node web service (`rootDir: backend`, `npm ci`, `npm start`, health check `/api/health`).

Set these environment variables in Render:

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `FRONTEND_URL` | Allowed frontend origin(s), comma-separated, e.g. `https://women-y22.pages.dev` |
| `ADMIN_PASSWORD` | Master Administrator password (recommended: bcryptjs `$2b$12$...` hash) |
| `CURATOR_PASSWORD` | Optional Curatorial & Collections Lead password |
| `OPERATIONS_PASSWORD` | Optional Operations & Visitor Desk password |
| `JWT_SECRET` | Long random secret |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Required for media uploads and story file attachments |

## Deploy the Frontend on Cloudflare Pages

Connect this repository to Cloudflare Pages with:

| Setting | Value |
| --- | --- |
| Root directory | Leave blank (repository root) |
| Build command | `npm run build:pages` |
| Build output directory | `dist/she-stands/browser` |
| Environment variable | `PUBLIC_API_BASE_URL=https://YOUR-RENDER-SERVICE.onrender.com` |
| Node version | `24` |

`frontend/src/_redirects` (`/* /index.html 200`) is copied into `dist/she-stands/browser` so direct visits to `/admin`, `/donate`, `/donate/mpesa`, `/donate/paypal`, `/donate/google-pay`, and `/donate/card` resolve cleanly.

## Payment Gateway Requirements

Never store payment secrets in the Angular build or Git. Configure them privately in Render:

- **M-PESA (Kenyan Shillings / KES):**
  - *Safaricom Daraja STK Push:* `MPESA_ENV` (`sandbox` or `production`), `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY`, `MPESA_CALLBACK_URL=https://YOUR-RENDER-SERVICE.onrender.com/api/donations/mpesa/callback`, `MPESA_TRANSACTION_TYPE` (`CustomerPayBillOnline` or `CustomerBuyGoodsOnline`), `MPESA_ACCOUNT_REFERENCE`.
  - *Optional Approved Paybill Manual Verification:* `MPESA_PAYBILL_NUMBER` and `MPESA_ACCOUNT_NAME` (only if you want donors to submit manual Paybill confirmation codes for ledger review).
- **PayPal (USD International):** `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, and `PAYPAL_BASE_URL` (`https://api-m.sandbox.paypal.com` for sandbox, `https://api-m.paypal.com` for live).
- **Stripe Card Checkout & Google Pay (USD, One-Time & Monthly):** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`. Add webhook endpoint `https://YOUR-RENDER-SERVICE.onrender.com/api/stripe/webhook` in Stripe for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, and `checkout.session.async_payment_failed`, and enable Google Pay in Stripe Payment Methods.

## Local Development

Copy `backend/.env.example` to `backend/.env`, set `MONGODB_URI`, `ADMIN_PASSWORD`, and `JWT_SECRET`, then run:

1. `npm start` inside `backend/` (API on `http://localhost:4000/api`)
2. `npm start` inside `frontend/` (Site on `http://localhost:4200`, Admin on `http://localhost:4200/admin`)
