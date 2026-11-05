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
8. Run supabase-agent-ratings-and-phone.sql once too (after step 7). It adds agent phone numbers (readable only by signed-in visitors) and agent ratings, with the rules for who can see which scores. Safe to run again. Until you run it the site works as before, but phone numbers and ratings can't be saved.
9. Then run supabase-agent-ratings-visible.sql, which lets signed-in visitors see each agent's average, rating breakdown and written reviews. Safe to run again. Until you run it, visitors can still rate but see no scores.
10. Run supabase-usage-by-day.sql to let the Overview show visitor activity by date (Today, 7 days, 30 days, All time). Safe to run again. Until you run it, the Overview shows All time only, and the date buttons stay switched off with a short note.
11. Run supabase-rental-deposit.sql BEFORE you publish the update that adds the deposit question (it adds the two columns the form saves to). Safe to run again. If the site is published first, adding or editing a rental will fail until the file is run.
12. To make someone a super admin on the live site, run supabase-add-superadmin.sql in Supabase (edit the email inside first). They must sign up with that email first.

Who can do what
- Superadmin: everything. Adds agencies (the Agencies tab), reviews and approves listings, verifies agents.
- Agency: adds listings, sees every listing posted under it (its own and its agents'), filters by who posted it, and edits or removes any of them. Adds its own agents and can give each one a login.
- Agent: signs in with the login email their agency gave them (create an account with that email, confirm it, then Staff sign in). Adds listings and removes their own. Sees only their own.
- Visitors with an account: tap any agent card to open the agent's profile (photo, name, phone, agency and the properties they handle), and rate the agent from 1 to 5 stars in the Rate tab. One rating per person per agent, which they can change or remove.
- Who sees ratings: visitors with an account see each agent's average on the agent cards and profile, plus the 1 to 5 breakdown and written reviews, with reviewers shown by first name only. The superadmin sees every agent's scores with full names (Ratings tab, and the Score line on the Agents tab); an agency sees the same for its own agents only. Agents never see their ratings, and signed-out visitors see none.
- Phone numbers: add one when creating an agent, or later from the agent's expanded row (Agents tab for the superadmin, My Agents tab for an agency).
- Rental deposit: anyone adding or editing a listing in the Rent category (superadmin, agency or agent) must say whether a deposit is required and, if so, how much in KSh. Signed-in visitors see it on the listing page ("Deposit: KSh 70,000", "No deposit required"), and staff see it in the listing rows. Rentals that were added before this update show "Ask the agent" until someone edits them and fills it in. Other categories have no deposit question.
- Overview date range: the Today / 7 days / 30 days / All time switch changes the page views, searches, property views, saves, category chart and supply-vs-demand numbers. It refreshes by itself every 15 seconds. Daily records start the day you run supabase-usage-by-day.sql; earlier visits only show under All time.
- Home page: "Featured listings" shows only featured (promoted) listings. Every other approved listing appears in a separate "Latest listings" section just below it (newest first, up to 8, with a View all button). A listing never appears in both. The "View all featured listings" button opens the listings page showing featured listings only (address ends in ?featured=1; the "Featured only" chip on that page switches it on and off, and it works together with the Buy/Rent/Commercial/Land chips). The "View all" button under Latest listings opens every listing.
- Listings from agencies and agents always start as "Pending" until the superadmin approves them; editing never changes that.
- After signing in or signing up, superadmins, agencies and agents go straight to their own dashboard and see only that: the public site is not shown to them. The button in the top corner of their dashboard is "Log out". Everyone else (visitors and ordinary customers) sees the normal site.

## Staff sign in
There is no "Staff sign in" link on the public site any more. Superadmins, agencies and agents sign in at your site address followed by /admin (for example yourdomain.com/admin). Bookmark it and share it only with your team.

## Staff sign in
There is no "Staff sign in" link on the public site any more. Superadmins, agencies and agents sign in at your site address followed by /admin (for example yourdomain.com/admin). Bookmark it and share it only with your team.

The glass look (index.css, the last two blocks) is used on the public site AND on every dashboard (superadmin, agency, agent) and the staff sign-in. The same colour variables drive light and dark mode, so one change there updates everything.

## Sign-up and login security
What the site itself checks (in authRules.js, used by Create account, Reset password and Log in):
- Email: trimmed and lower-cased, must be a properly formed address (no spaces, one @, a real-looking domain, 254 characters at most). Obvious typos such as gmail.con get a "Did you mean...?" suggestion that never blocks anyone.
- Password (Create account and Reset password): at least 10 characters, at most 72, at least one letter and one number, not a very common or predictable password (password123, qwerty..., 1234567890, Nairobi2024, repeated patterns), and not built from the person's own name or email. A live checklist and strength bar show this as they type. To change the minimum, edit PASSWORD_MIN at the top of authRules.js.
- Name: 2 to 60 characters, must include a letter.
- Log in: the same wrong message for a wrong email or a wrong password (so nobody can tell which accounts exist), and the same neutral message after "Forgot your password". After 5 wrong passwords in a row the form pauses for 60 seconds (visitor Log in and Staff sign in).
- Bots: a hidden trap field, plus the Cloudflare security check (see below).
- Staff: Staff sign in asks for a code from an authenticator app (two-step login) whenever the database says the role requires it, and for any staff member who has set it up. Agents are not forced to use it; agencies and the superadmin are set up by supabase-setup.sql, so check that file if you want to be sure. The database only treats someone as staff once their email is confirmed.

The browser can only guide people. Anyone can bypass a web page and talk to the sign-up service directly, so these settings must ALSO be switched on in the dashboards. Do this once:
1. Supabase > Authentication > Providers > Email:
   - Confirm email: ON. (Staff access and the account wall depend on confirmed emails.)
   - Minimum password length: 10 (the same as PASSWORD_MIN).
   - Password requirements: Letters and digits.
   - Secure password change: ON.
2. Supabase > Authentication > Attack Protection:
   - Prevent use of leaked passwords: ON (only offered on the Pro plan; the site already shows a clear message when it is rejected).
   - CAPTCHA protection: ON, choose Cloudflare Turnstile and paste the Turnstile SECRET key.
3. Cloudflare: create a Turnstile widget for your domain, then add its SITE key as VITE_TURNSTILE_SITE_KEY in Cloudflare Pages > Environment variables and republish. Until you do, the security check is OFF on the live site. Turn it on in Supabase (step 2) and in Cloudflare together: with only one of the two, sign-up and login will fail.
4. Supabase > Authentication > URL Configuration: set Site URL to your real address and list only your own addresses under Redirect URLs, so confirmation and reset emails can't be pointed anywhere else.
5. Supabase > Authentication > Rate Limits: leave the defaults on, or make them stricter.

The 3D house in the log-in window (AuthHouse3D.jsx) is plain WebGL, so there is nothing extra to install and it works with the site's security headers. It loads only when someone opens the window, pauses when the window is closed, holds still for people who have reduced motion switched on, and disappears quietly on a device without WebGL.

Every time you push to GitHub, Cloudflare rebuilds and publishes the site in about a minute.

## What is in this folder
- App.jsx, AdminOverview.jsx, AdminChart.jsx, main.jsx, index.css: the website (AdminOverview.jsx is the super admin dashboard home)
- partner.js: the partner shown on the home page (Scopio Securities). Fill in its description, website and logo there. Anything left empty is simply not shown. PartnerSection.jsx draws it.
- partner.js: the partner shown on the home page (Scopio Securities). Fill in its description, website and logo there. Anything left empty is simply not shown. PartnerSection.jsx draws it.
- authRules.js: the email, name and password rules and the failed-login pause. PasswordMeter.jsx: the strength bar and checklist. AuthHouse3D.jsx: the 3D house in the log-in window
- supabase-account-wall.sql: the database rule behind the sign-up wall
- supabase-profile-photos.sql: lets each person save their own profile photo
- supabase-add-superadmin.sql: makes an email a super admin (and shows the super admin count)
- supabase-agents-and-agencies.sql: agent logins, and the rules for who can add, edit and remove which listings
- supabase-agent-ratings-and-phone.sql: agent phone numbers and agent ratings, and who can see them
- supabase-rental-deposit.sql: deposit columns for rentals, and the rule that every new rental must state its deposit
- supabase-usage-by-day.sql: records visitor activity per day (Nakuru time) for the Overview date range
- supabase-agent-ratings-visible.sql: lets signed-in visitors see agent averages and reviews (first names only)
- _worker.js, _routes.json: share previews, sitemap and robots (Cloudflare)
- _headers, _redirects, vercel.json: security settings and page addresses
- index.html, favicon and icons, og-image.jpg, logo files: the page shell and branding
- package.json, vite.config.js, tailwind.config.js, postcss.config.js: build settings
