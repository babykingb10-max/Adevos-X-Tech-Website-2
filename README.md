# Adevos-X Tech — Monorepo

A full-stack platform for deploying and managing WhatsApp/Telegram bots: a
public PWA site, an admin PWA control panel, and a Node.js/Express + MongoDB
backend API.

```
adevos-x-project/
├── frontend/          → deploy this folder to Vercel (public site + /admin)
└── backend/           → deploy this folder to Heroku (or Koyeb/Render)
```

## 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env   # fill in MONGODB_URI, JWT_SECRET, email + platform API keys
npm run dev             # starts on http://localhost:5000
```

On first boot the server calls `seed.js` automatically — it creates the
default site config, hero slides, homepage cards, one bot template, two
deployment platforms (Koyeb, Render), a welcome update, a sample tutorial,
and **one admin account** using `ADMIN_DEFAULT_USERNAME` /
`ADMIN_DEFAULT_PASSWORD` from `.env`. **Log in and change that password
immediately** — see `/admin/login.html`.

Seeding is idempotent: it only inserts data into collections that are empty,
so it's safe to redeploy without duplicating content.

## 2. Frontend Setup

The frontend is static HTML/CSS/JS — no build step. Before deploying, open
`frontend/js/config.js` and set:

- `API_BASE_URL` → your deployed backend URL
- `AppConfig.siteSettings.supportLinks` → real WhatsApp/Telegram links (these
  are also editable live from the Admin Panel once the backend is running —
  the Admin values override these local fallbacks)

Serve locally with any static server, e.g.:
```bash
cd frontend
npx serve .
```

## 3. Deployment (Monorepo → Vercel + Heroku)

**Vercel (frontend):** New Project → select this repo → set **Root
Directory** to `frontend` → Deploy.

**Heroku (backend):** New App → Deploy tab → connect this repo → because
Heroku builds from the repo root, either (a) set `backend` as a subdirectory
buildpack, or (b) push only the `backend/` folder to its own Heroku remote
using `git subtree push`. Add all `.env.example` variables under
Settings → Config Vars.

## 4. What Still Needs Real Credentials

These are wired up with clear `TODO` markers so the structure is ready but
requires your own accounts:

- `backend/utils/platformClients.js` — Koyeb/Render deploy/destroy calls
- `backend/controllers/paymentsController.js` — Paystack checkout + Mobile
  Money webhook signature verification
- `backend/controllers/authController.js` — Google/Apple token verification
  (`google-auth-library`)
- `backend/utils/mailer.js` — SMTP/Resend credentials for OTP emails

## 5. Admin Access

- URL: `/admin/login.html`
- Default credentials come from `ADMIN_DEFAULT_USERNAME` /
  `ADMIN_DEFAULT_PASSWORD` in `.env` — change the password on first login by
  updating the seeded admin user's `passwordHash` (an admin "change my
  password" endpoint is a natural next addition to `adminController.js`).

## 6. Conventions Followed

- English-only UI copy and code, per project spec.
- Icons (Font Awesome) used everywhere instead of emojis.
- Both `frontend/manifest.json` and `frontend/admin/manifest.json` make each
  surface installable as a PWA.
- All external service credentials are read from environment variables —
  nothing is hardcoded.
