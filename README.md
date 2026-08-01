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
Directory** to `frontend` → Deploy. `frontend/vercel.json` is already
included so the service worker and manifest get the right cache headers
automatically.

**Heroku (backend):** Two options —

- **One-tap button** (easiest, works great from a phone browser): use the
  `app.json` at the repo root. It uses the `heroku-buildpack-monorepo`
  buildpack with `APP_BASE=backend`, so Heroku builds only the `backend/`
  folder automatically — no CLI, no manual buildpack setup. Replace
  `YOUR_USERNAME` in `app.json`'s `repository` field with your GitHub
  username, then open:
  `https://heroku.com/deploy?template=https://github.com/YOUR_USERNAME/adevos-x-project`
  Heroku will show a form asking for `MONGODB_URI` and the other secrets
  from `.env.example` before it builds — fill them in and deploy.
- **Manual dashboard connect:** New App → Deploy tab → GitHub → connect this
  repo → add the same monorepo buildpack + `APP_BASE=backend` config var
  yourself under Settings.

## 3b. Deploying Entirely From a Phone (No Computer, No CLI)

Everything above works from a mobile browser except getting this code onto
GitHub in the first place. Two ways to do that from a phone:

**Option A — Termux (Android, recommended):**
```bash
pkg update && pkg install git unzip -y
termux-setup-storage
cd storage/downloads          # wherever adevos-x-project.zip was downloaded
unzip adevos-x-project.zip
cd adevos-x-project
git init
git remote add origin https://github.com/YOUR_USERNAME/adevos-x-project.git
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main       # use a GitHub Personal Access Token as the password
```
Create the empty GitHub repo first from github.com in your phone browser
(New Repository → do **not** initialize with a README), then run the steps
above. Generate a Personal Access Token at
github.com/settings/tokens to use as your push password.

**Option B — GitHub web upload (iPhone or Android, no app install):**
Unzip the project with any file manager app, then on github.com → your new
repo → **Add file → Upload files**, and upload folder-by-folder
(`frontend`, then `backend`, then the root files `app.json`,
`.gitignore`, `README.md`). Most mobile browsers preserve folder structure
when you pick a whole folder from the upload dialog; if yours doesn't, zip
each subfolder individually before picking files, or install Termux instead.

Once the code is on GitHub, open **vercel.com** and **heroku.com** in your
phone browser and follow section 3 above — both dashboards are fully
usable on mobile.

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
