# She Stands Women's Museum

An Angular frontend and a Node/Express/MongoDB API for the museum website, curator dashboard, donations, media, story submissions and visitor messages. The folders deploy independently from this repository.

## Deploy the API on Render

The root `render.yaml` defines a Node web service using `backend` as its root directory, `npm ci` as its build command, `npm start` as its start command and `/api/health` as its health check. You can use the Blueprint or create a web service with the same settings.

Set these Render environment values before the service starts:

| Variable | Value |
| --- | --- |
| `MONGODB_URI` | A reachable MongoDB connection string, such as a MongoDB Atlas URI |
| `FRONTEND_URL` | The exact Cloudflare Pages origin, for example `https://she-stands.pages.dev` |
| `ADMIN_PASSWORD` | The curator password, entered privately in Render |
| `JWT_SECRET` | A long random secret; the Blueprint can generate it |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Your Cloudinary account values for uploads and the original museum photos |

Do not commit `backend/.env`. It is ignored by Git. Render stores the production values in its environment settings. The four original generated photographs needed for Cloudinary's startup sync are included in `backend/site-assets`, because Render only makes the `backend` root available to that service.

The API URL will be `https://YOUR-RENDER-SERVICE.onrender.com`. Its health endpoint is `/api/health`. The service must connect to MongoDB before it accepts requests.

## Deploy the frontend on Cloudflare Pages

Connect this GitHub repository to a Pages project and set:

| Setting | Value |
| --- | --- |
| Root directory | Leave blank (repository root) |
| Build command | `npm run build:pages` |
| Build output directory | `dist/she-stands/browser` |
| Environment variable | `PUBLIC_API_BASE_URL=https://YOUR-RENDER-SERVICE.onrender.com` |
| Node version | `24` |

The root build installs the `frontend` dependencies, runs its Angular build, and copies the output to `dist/she-stands/browser`. `build:pages` writes the Render API URL into the published assets. The site and `/admin` then use that API URL. If you set the Cloudflare root directory to `frontend` instead, keep the same build command and output directory; the frontend also has its own build script. For Cloudflare preview domains or a custom domain, set the intended production origin in Render's `FRONTEND_URL` before using donation redirects and admin requests.

## Payment configuration

Donations are stored in MongoDB with payment method, currency, amount and status. The curator dashboard shows the ledger and M-Pesa receipts awaiting reconciliation.

- **Google Pay:** configure `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` on Render. Add `https://YOUR-RENDER-SERVICE.onrender.com/api/stripe/webhook` in Stripe and subscribe to `checkout.session.completed`, `checkout.session.async_payment_succeeded` and `checkout.session.async_payment_failed`. Google Pay appears in Stripe Checkout when the account and donor device support it.
- **PayPal:** configure `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` and `PAYPAL_BASE_URL` on Render. The default base URL is PayPal sandbox; use `https://api-m.paypal.com` with production credentials when ready.
- **M-Pesa:** configure `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY`, `MPESA_ENV` and `MPESA_CALLBACK_URL`. Set the callback to `https://YOUR-RENDER-SERVICE.onrender.com/api/donations/mpesa/callback`. Successful STK callbacks place a receipt in admin review for reconciliation.

Activate and verify merchant credentials with each payment provider before accepting live gifts. Never place these credentials in the Angular build or in this repository.

## Local development

Use Node.js 24 and a local MongoDB instance. Copy `backend/.env.example` to `backend/.env`, set `ADMIN_PASSWORD`, `JWT_SECRET` and `MONGODB_URI`, then run `npm install` and `npm start` once in `backend` and once in `frontend`. The public site opens at `http://localhost:4200`, the curator dashboard at `http://localhost:4200/admin`, and the API at `http://localhost:4000/api`.

Both folders have their own `npm start` command. The frontend uses the same host on port 4000 during local development; its published Cloudflare build uses the configured Render URL.
