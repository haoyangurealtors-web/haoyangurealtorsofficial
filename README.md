# Hao yangu realtors

Where property meets possibilities.

## Run it on your laptop
You need Node.js 18 or newer (nodejs.org, the LTS version) and Git.

    npm install
    copy .env.example .env      (Mac/Linux: cp .env.example .env)
    npm run dev                 (opens a local copy of the site)
    npm run build               (makes the real site in the dist folder; run this before you push)

## Put it online
1. Push this folder to GitHub (git init, git add ., git commit, git push).
2. In Cloudflare Pages, connect the repository with these settings:
   Build command: npm run build   |   Build output directory: dist
3. Add the environment variables from .env.example (at least VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) and NODE_VERSION = 20.
4. Run supabase-setup.sql once in Supabase (SQL Editor). It needs no editing.
5. Then run supabase-account-wall.sql once too. It makes listing details (description, amenities, contact) readable only by signed-in users, so the sign-up wall can't be bypassed. Safe to run again.

Every time you push to GitHub, Cloudflare rebuilds and publishes the site in about a minute.

## What is in this folder
- App.jsx, AdminChart.jsx, main.jsx, index.css: the website
- supabase-account-wall.sql: the database rule behind the sign-up wall
- _worker.js, _routes.json: share previews, sitemap and robots (Cloudflare)
- _headers, _redirects, vercel.json: security settings and page addresses
- index.html, favicon and icons, og-image.jpg, logo files: the page shell and branding
- package.json, vite.config.js, tailwind.config.js, postcss.config.js: build settings
