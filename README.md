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
6. Run supabase-profile-photos.sql once as well. It lets each signed-in person save their own profile photo (and only their own).
7. Run supabase-agents-and-agencies.sql once too. It lets agents sign in to add and remove their own listings, and lets each agency see and edit every listing its agents post. Safe to run again. Until you run it, the site works as before and agent logins simply don't work yet.
8. To make someone a super admin on the live site, run supabase-add-superadmin.sql in Supabase (edit the email inside first). They must sign up with that email first.

Who can do what
- Superadmin: everything. Adds agencies (the Agencies tab), reviews and approves listings, verifies agents.
- Agency: adds listings, sees every listing posted under it (its own and its agents'), filters by who posted it, and edits or removes any of them. Adds its own agents and can give each one a login.
- Agent: signs in with the login email their agency gave them (create an account with that email, confirm it, then Staff sign in). Adds listings and removes their own. Sees only their own.
- Listings from agencies and agents always start as "Pending" until the superadmin approves them; editing never changes that.
- After signing in or signing up, superadmins, agencies and agents go straight to their own dashboard and see only that: the public site is not shown to them. The button in the top corner of their dashboard is "Log out". Everyone else (visitors and ordinary customers) sees the normal site.

Every time you push to GitHub, Cloudflare rebuilds and publishes the site in about a minute.

## What is in this folder
- App.jsx, AdminOverview.jsx, AdminChart.jsx, main.jsx, index.css: the website (AdminOverview.jsx is the super admin dashboard home)
- supabase-account-wall.sql: the database rule behind the sign-up wall
- supabase-profile-photos.sql: lets each person save their own profile photo
- supabase-add-superadmin.sql: makes an email a super admin (and shows the super admin count)
- supabase-agents-and-agencies.sql: agent logins, and the rules for who can add, edit and remove which listings
- _worker.js, _routes.json: share previews, sitemap and robots (Cloudflare)
- _headers, _redirects, vercel.json: security settings and page addresses
- index.html, favicon and icons, og-image.jpg, logo files: the page shell and branding
- package.json, vite.config.js, tailwind.config.js, postcss.config.js: build settings
