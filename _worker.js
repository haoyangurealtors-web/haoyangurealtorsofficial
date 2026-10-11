// Hao yangu realtors: small server-side helper that runs on Cloudflare Pages.
// It only handles a few addresses (see _routes.json):
//   /listing/12   adds that property's title, price and photo so WhatsApp/Facebook/Google show it properly
//   /, /buy ...   adds the correct web address and share image automatically
//   /sitemap.xml  lists every live listing for Google
//   /robots.txt   points Google to the sitemap
// Everything else is served as normal static files.

const SITE_NAME = "Hao yangu realtors";
const SECURITY_HEADERS = {
  "Content-Security-Policy": "default-src 'self'; script-src 'self' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co https://*.ingest.sentry.io https://*.ingest.de.sentry.io https://*.ingest.us.sentry.io; frame-src https://challenges.cloudflare.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Frame-Options": "DENY"
};

const PAGES = {
  "/": { title: SITE_NAME + " | Where property meets possibilities", description: "Browse homes for sale, rentals, commercial spaces and land. Hao yangu realtors: where property meets possibilities." },
  "/buy": { title: "Homes for sale | " + SITE_NAME, description: "Browse homes for sale from verified agents on Hao yangu realtors." },
  "/rent": { title: "Homes to rent | " + SITE_NAME, description: "Browse homes to rent from verified agents on Hao yangu realtors." },
  "/commercial": { title: "Commercial spaces | " + SITE_NAME, description: "Offices, shops and commercial spaces to buy or lease on Hao yangu realtors." },
  "/land": { title: "Land for sale | " + SITE_NAME, description: "Plots and land for sale from verified agents on Hao yangu realtors." },
  "/listings": { title: "All listings | " + SITE_NAME, description: "Every live property on Hao yangu realtors: buy, rent, commercial and land." },
  "/agents": { title: "Our agents | " + SITE_NAME, description: "Meet the verified agents on Hao yangu realtors." },
  "/advertise": { title: "Promote your listing | " + SITE_NAME, description: "Feature your property on Hao yangu realtors so more buyers and renters see it first." },
  "/verification": { title: "What Verified means | " + SITE_NAME, description: "What our Verified agent badge means, what we check, and how to stay safe when buying or renting." },
};

const esc = (v) => String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function formatPrice(value) {
  const n = Number(value) || 0;
  if (n >= 1000000) {
    const m = n / 1000000;
    return "KSh " + (m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)) + "M";
  }
  return "KSh " + n.toLocaleString("en-US");
}

// Replacement functions (not strings) are used so characters like $ in a listing never get misread.
function setTitle(html, title) {
  return html.replace(/<title>[\s\S]*?<\/title>/i, () => "<title>" + esc(title) + "</title>");
}
function setMeta(html, kind, key, value) {
  const tag = '<meta ' + kind + '="' + key + '" content="' + esc(value) + '" />';
  const re = new RegExp('<meta\\s+' + kind + '="' + key + '"[^>]*>', "i");
  return re.test(html) ? html.replace(re, () => tag) : html.replace("</head>", () => "    " + tag + "\n  </head>");
}
function setCanonical(html, href) {
  const tag = '<link rel="canonical" href="' + esc(href) + '" />';
  const re = /<link rel="canonical"[^>]*>/i;
  return re.test(html) ? html.replace(re, () => tag) : html.replace("</head>", () => "    " + tag + "\n  </head>");
}
function addJsonLd(html, data) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return html.replace("</head>", () => '    <script type="application/ld+json">' + json + "</script>\n  </head>");
}
function applyMeta(html, { title, description, url, image }) {
  let out = setTitle(html, title);
  out = setMeta(out, "name", "description", description);
  out = setMeta(out, "property", "og:title", title);
  out = setMeta(out, "property", "og:description", description);
  out = setMeta(out, "property", "og:url", url);
  out = setMeta(out, "property", "og:image", image);
  out = setMeta(out, "name", "twitter:card", "summary_large_image");
  out = setMeta(out, "name", "twitter:title", title);
  out = setMeta(out, "name", "twitter:description", description);
  out = setMeta(out, "name", "twitter:image", image);
  return setCanonical(out, url);
}

function htmlResponse(html, maxAge) {
  return new Response(html, {
    status: 200,
    headers: Object.assign({ "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=" + maxAge }, SECURITY_HEADERS),
  });
}

async function loadShell(request, env, url) {
  const res = await env.ASSETS.fetch(new Request(new URL("/", url).toString(), { method: "GET", headers: request.headers }));
  return res.ok ? await res.text() : null;
}

async function supabaseGet(env, query) {
  const base = String(env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  if (!base || !env.VITE_SUPABASE_ANON_KEY) return null;
  const res = await fetch(base + "/rest/v1/" + query, { headers: { apikey: env.VITE_SUPABASE_ANON_KEY } });
  return res.ok ? await res.json() : null;
}

async function pageShell(request, env, url, path) {
  const html = await loadShell(request, env, url);
  if (html === null) return null;
  const meta = PAGES[path];
  let out = applyMeta(html, { title: meta.title, description: meta.description, url: url.origin + (path === "/" ? "/" : path), image: url.origin + "/og-image.jpg" });
  if (path === "/") {
    out = addJsonLd(out, {
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      name: SITE_NAME,
      url: url.origin + "/",
      logo: url.origin + "/icon-512.png",
      image: url.origin + "/og-image.jpg",
      slogan: "Where property meets possibilities",
      areaServed: "Nakuru, Kenya",
    });
  }
  return htmlResponse(out, 300);
}

async function listingShell(request, env, url, id) {
  const html = await loadShell(request, env, url);
  if (html === null) return null;
  const rows = await supabaseGet(env, "listings?select=id,title,location,price_value,period,tag,beds,baths,size,description,img,created_at&status=eq.approved&id=eq." + id + "&limit=1");
  const l = rows && rows[0];
  if (!l) return htmlResponse(html, 60); // unknown or hidden listing: normal page, the app shows its own message
  const price = formatPrice(l.price_value) + (l.period || "");
  const facts = [l.beds != null ? l.beds + " bed" : "", l.baths != null ? l.baths + " bath" : "", l.size || ""].filter(Boolean).join(", ");
  const title = l.title + ", " + l.location + " | " + SITE_NAME;
  const lead = (price + " | " + l.tag + " | " + l.location + (facts ? " | " + facts : "")).trim();
  const body = String(l.description || "").replace(/\s+/g, " ").trim();
  const description = (lead + (body ? ". " + body : "")).slice(0, 200);
  const image = /^https:\/\//i.test(l.img || "") ? l.img : url.origin + "/og-image.jpg";
  const pageUrl = url.origin + "/listing/" + l.id;
  let out = applyMeta(html, { title, description, url: pageUrl, image });
  out = addJsonLd(out, {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: l.title,
    description: body || lead,
    url: pageUrl,
    image,
    datePosted: l.created_at,
    address: { "@type": "PostalAddress", addressLocality: l.location, addressCountry: "KE" },
    offers: { "@type": "Offer", price: Number(l.price_value) || 0, priceCurrency: "KES" },
  });
  return htmlResponse(out, 60);
}

async function sitemap(env, url) {
  let rows = [];
  try {
    rows = (await supabaseGet(env, "listings?select=id,created_at&status=eq.approved&order=id.desc&limit=1000")) || [];
  } catch (e) {
    rows = []; // still return the main pages if the database is briefly unreachable
  }
  const urls = Object.keys(PAGES).map((p) => "  <url><loc>" + esc(url.origin + (p === "/" ? "/" : p)) + "</loc></url>");
  rows.forEach((r) => {
    const last = String(r.created_at || "").slice(0, 10);
    urls.push("  <url><loc>" + esc(url.origin + "/listing/" + r.id) + "</loc>" + (last ? "<lastmod>" + esc(last) + "</lastmod>" : "") + "</url>");
  });
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.join("\n") + "\n</urlset>\n";
  return new Response(xml, { status: 200, headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=900" } });
}

function robots(url) {
  const txt = "User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: " + url.origin + "/sitemap.xml\n";
  return new Response(txt, { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}

export default {
  async fetch(request, env) {
    if (request.method !== "GET" && request.method !== "HEAD") return env.ASSETS.fetch(request);
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    try {
      let response = null;
      if (path === "/robots.txt") response = robots(url);
      else if (path === "/sitemap.xml") response = await sitemap(env, url);
      else if (/^\/listing\/\d+$/.test(path)) response = await listingShell(request, env, url, path.split("/")[2]);
      else if (PAGES[path]) response = await pageShell(request, env, url, path);
      if (response) return response;
    } catch (e) {
      /* fall through to the normal site */
    }
    return env.ASSETS.fetch(request);
  },
};
