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
13. To switch on the AI support assistant (the chat button), follow "AI support assistant" below. It is free (no key, no card). The site works without it; until you add the Workers AI binding the chat simply says it isn't available.

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

## AI support assistant
A chat button sits in the bottom corner of the public site (dashboards don't show it). Visitors can ask it to find properties ("2 bedroom rental in Milimani under 50k"), ask how the site works, or be pointed to the team. It replies in the language the visitor writes in (English or Kiswahili), shows matching listings as small cards, and has an "Email our team" button that pre-fills a message with the chat so far.

How it works: the chat window sends each message to /api/chat on your own site. That address runs in _worker.js, adds the assistant's instructions, and asks a free open AI model (Meta Llama, running on Cloudflare Workers AI) for the reply. There is no paid AI provider and no API key to look after. The reply appears all at once when it is ready, rather than word by word.

What it can see: only what a visitor without an account already sees: listing title, location, price, bedrooms, bathrooms, size and agency, plus the name, focus, area and agency of Verified agents. It never sees descriptions, amenities, deposits, contact details, phone numbers, ratings or anyone's account, so the sign-up wall still holds. It cannot book viewings, message agents or take payments, and it is told to say so.

Switch it on (once)
1. In Cloudflare go to Workers & Pages > your Pages project > Settings > Bindings > Add > Workers AI. Set the variable name to AI (capital letters, exactly that) and save. Add it for Production, and for Preview too if you use preview deployments.
2. Redeploy (push to GitHub, or Retry deployment in Cloudflare). Open the live site, tap the chat button and send a message to check it.
3. If you used the old version, you can delete ANTHROPIC_API_KEY from Cloudflare. It is not used any more.

What "free" means
- Cloudflare gives every account 10,000 Workers AI "neurons" a day at no charge, and the allowance resets at 00:00 UTC (3:00 am in Kenya). No card is needed.
- With the default model, a chat message costs roughly 90 neurons, or roughly 180 when the assistant also searches the listings. That is about 50 to 100 messages a day for the whole site. These are estimates: the real cost depends on how long the chats are.
- When the daily allowance is used up, the chat shows "The assistant has reached its free limit for now" with the team's email address, and works again after the reset. Nothing else on the site is affected. On a free Cloudflare plan nothing is ever charged. If your Cloudflare account is on the paid Workers plan, usage above the free allowance IS billed (about $0.011 per 1,000 neurons), so set CHAT_DAILY_CAP below if that applies to you.
- To stretch the allowance, switch to a smaller model with CHAT_AI_MODEL (see below). It gives several times more chats a day but its answers are simpler, it follows Kiswahili less well and it is less reliable at searching, so test it before you keep it.

Optional settings (Cloudflare variables)
- CHAT_AI_MODEL: the model to use. The default is @cf/meta/llama-3.3-70b-instruct-fp8-fast (the best answers of the free models, but the most allowance per chat). A cheaper choice to try is @cf/meta/llama-3.1-8b-instruct-fp8-fast. The list of models is in the Cloudflare dashboard under AI > Workers AI > Models; choose one that supports function calling.
- CHAT_EXTRA_KNOWLEDGE: extra facts the assistant should know, up to about 2,500 characters: office hours, office address, a phone or WhatsApp number, extra FAQs. Without it the assistant only knows what is in the code and does not invent any of these.
- CHAT_RATE_LIMIT: messages allowed per visitor per 10 minutes (default 20).
- CHAT_KV and CHAT_DAILY_CAP: a stronger limit. In Cloudflare create a KV namespace (Storage and databases > KV), bind it to your Pages project with the variable name CHAT_KV, then set CHAT_DAILY_CAP to the most chats you want answered per day for the whole site (for example 80). Without CHAT_KV the per-visitor limit still applies, but it is only a speed bump (each Cloudflare server instance counts on its own), so rely on Cloudflare's own daily allowance as the real cap.
- VITE_CONTACT_EMAIL and VITE_FEATURED_PRICING (already used by the site) are also what the assistant tells visitors.

Changing what it knows or how it speaks: edit chatSystemPrompt() in _worker.js ("FACTS ABOUT THE SITE" and "RULES"). If you change a policy on the site (what Verified checks, how featuring works, the sign-up rules), change the matching line there too, so the assistant doesn't give old answers.

Try it on your laptop: there is no Workers AI binding on a laptop, so put CF_ACCOUNT_ID and CF_API_TOKEN (and your Supabase values) in .env, then run npm run dev. Create the token in Cloudflare under My Profile > API Tokens > Create Token, using the "Workers AI" template. The dev server answers /api/chat with the same code as the live site (dev-chat-bridge.js, used only by npm run dev). Never commit .env (it is already ignored by git).

Privacy: the Privacy Policy page now says that chat messages are processed by Cloudflare (Workers AI, running a Meta Llama model) to write replies and that you don't keep chats yourself. Cloudflare publishes its own terms on how Workers AI handles customer data; read them, and have whoever advises you on the Data Protection Act check that wording. The chat window also tells visitors not to share passwords or payment details.

This runs on Cloudflare Pages (it needs _worker.js and the AI binding). vercel.json is only for headers and page addresses and does not run the assistant.

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
- SupportChat.jsx, chatUtils.js: the AI support chat window (its styles are the "pk-chat" block at the end of index.css)
- _worker.js, _routes.json: share previews, sitemap and robots, and the AI assistant at /api/chat (Cloudflare)
- dev-chat-bridge.js: lets npm run dev answer /api/chat on your laptop (not part of the live site)
- _headers, _redirects, vercel.json: security settings and page addresses
- index.html, favicon and icons, og-image.jpg, logo files: the page shell and branding
- package.json, vite.config.js, tailwind.config.js, postcss.config.js: build settings
