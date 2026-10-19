import React, { useState, useEffect, useRef, useMemo, lazy, Suspense } from "react";
import LOGO_IMAGE_SRC from "./logo.webp";
import LOGO_IMAGE_SRC_DARK from "./logo-dark.webp";
import {
  Menu,
  X,
  Sun,
  Moon,
  Search,
  MapPin,
  Bed,
  Bath,
  Ruler,
  Heart,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Check,
  Star,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Youtube,
  ArrowRight,
  Home as HomeIcon,
  Building2,
  TreePine,
  KeyRound,
  Users,
  UserPlus,
  ShieldCheck,
  ArrowUpRight,
  LayoutGrid,
  Shield,
  LogOut,
  LayoutDashboard,
  ClipboardList,
  UserCog,
  BadgeCheck,
  Ban,
  Trash2,
  Pause,
  RotateCcw,
  Plus,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Pencil,
  Camera,
} from "lucide-react";
const AdminChart = lazy(() => import("./AdminChart.jsx"));

// Brand glyphs that the icon library doesn't include.
function XIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}
function TikTokIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

/* ---------------------------------------------------------------- */
/* Data                                                              */
/* ---------------------------------------------------------------- */

const NAV_LINKS = [
  { key: "buy", label: "Buy" },
  { key: "rent", label: "Rent" },
  { key: "commercial", label: "Commercial" },
  { key: "land", label: "Land" },
  { key: "agents", label: "Agents" },
];

const TAB_META = {
  buy: {
    label: "Buy",
    icon: HomeIcon,
    secondaryLabel: "Bedrooms",
    secondaryOptions: ["Any", "1+", "2+", "3+", "4+"],
    budgetOptions: ["Any budget", "Under KSh 5M", "KSh 5M – 20M", "KSh 20M+"],
  },
  rent: {
    label: "Rent",
    icon: KeyRound,
    secondaryLabel: "Bedrooms",
    secondaryOptions: ["Any", "Studio", "1+", "2+", "3+"],
    budgetOptions: ["Any budget", "Under KSh 40K/mo", "KSh 40K – 120K/mo", "KSh 120K+/mo"],
  },
  commercial: {
    label: "Commercial",
    icon: Building2,
    secondaryLabel: "Space type",
    secondaryOptions: ["Any", "Office", "Retail", "Warehouse"],
    budgetOptions: ["Any budget", "Under KSh 100K/mo", "KSh 100K – 300K/mo", "KSh 300K+/mo"],
  },
  land: {
    label: "Land",
    icon: TreePine,
    secondaryLabel: "Plot size",
    secondaryOptions: ["Any", "Under ¼ acre", "¼ – 1 acre", "1 acre+"],
    budgetOptions: ["Any budget", "Under KSh 3M", "KSh 3M – 10M", "KSh 10M+"],
  },
};

const CATEGORIES = [
  {
    key: "buy",
    icon: HomeIcon,
    title: "Buy",
    blurb: "Houses, apartments and townhouses ready to own.",
  },
  {
    key: "rent",
    icon: KeyRound,
    title: "Rent",
    blurb: "Monthly homes across every price bracket.",
  },
  {
    key: "commercial",
    icon: Building2,
    title: "Commercial",
    blurb: "Offices, retail shopfronts and warehouses.",
  },
  {
    key: "land",
    icon: TreePine,
    title: "Land",
    blurb: "Plots for building, farming or holding.",
  },
];

const BUDGET_RANGES = {
  "Any budget": [0, Infinity],
  "Under KSh 5M": [0, 5000000],
  "KSh 5M – 20M": [5000000, 20000000],
  "KSh 20M+": [20000000, Infinity],
  "Under KSh 40K/mo": [0, 40000],
  "KSh 40K – 120K/mo": [40000, 120000],
  "KSh 120K+/mo": [120000, Infinity],
  "Under KSh 100K/mo": [0, 100000],
  "KSh 100K – 300K/mo": [100000, 300000],
  "KSh 300K+/mo": [300000, Infinity],
  "Under KSh 3M": [0, 3000000],
  "KSh 3M – 10M": [3000000, 10000000],
  "KSh 10M+": [10000000, Infinity],
};

const LAND_SIZE_RANGES = {
  "Any": [0, Infinity],
  "Under ¼ acre": [0, 0.25],
  "¼ – 1 acre": [0.25, 1],
  "1 acre+": [1, Infinity],
};

const LISTING_FILTERS = [
  { key: "all", label: "All", icon: LayoutGrid },
  { key: "buy", label: "Buy", icon: HomeIcon },
  { key: "rent", label: "Rent", icon: KeyRound },
  { key: "commercial", label: "Commercial", icon: Building2 },
  { key: "land", label: "Land", icon: TreePine },
];

const LISTING_META = {
  all: { title: "All listings", label: "All" },
  buy: { title: "Homes for sale", label: "Buy" },
  rent: { title: "Homes for rent", label: "Rent" },
  commercial: { title: "Commercial spaces", label: "Commercial" },
  land: { title: "Land for sale", label: "Land" },
};

const SORT_OPTIONS = ["Newest", "Price: Low to High", "Price: High to Low"];

/* ---------------------------------------------------------------- */
/* Superadmin configuration                                          */
/* ---------------------------------------------------------------- */
const SITE_CONFIG = {
  name: "Hao yangu realtors",
  // Public contact address shown across the site (set VITE_CONTACT_EMAIL).
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL || "haoyangurealtors@gmail.com",
  // Full https:// profile links. Empty = icon hidden.
  socials: {
    facebook: import.meta.env.VITE_FACEBOOK_URL || "https://www.facebook.com/profile.php?id=61595268120960",
    instagram: import.meta.env.VITE_INSTAGRAM_URL || "https://www.instagram.com/hao.yangu.realtors",
    twitter: import.meta.env.VITE_TWITTER_URL || "https://x.com/HYREALTORS",
    youtube: import.meta.env.VITE_YOUTUBE_URL || "https://youtube.com/@hao.yangu.realtors",
    tiktok: import.meta.env.VITE_TIKTOK_URL || "https://www.tiktok.com/@yaoyangurealtors",
  },
  // Set in your .env file (see .env.example). With these empty, the account buttons stay hidden.
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || "",
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
  },
  // Cloudflare Turnstile site key (public). Empty = no security check on sign-up and login.
  turnstileSiteKey: import.meta.env.VITE_TURNSTILE_SITE_KEY || "",
};
const AUTH_ENABLED = Boolean(SITE_CONFIG.supabase.url && SITE_CONFIG.supabase.anonKey);
const TURNSTILE_SITE_KEY = SITE_CONFIG.turnstileSiteKey;
const SESSION_KEY = "hy-realtors:session";

// Superadmin sign-in is verified against salted hashes, so no email or passphrase is readable in this file.
const SUPERADMIN_CONFIG = {
  salt: "hy-8096ed3a6b8f2ec5dd77e3e9",
  iterations: 150000,
  emailHashes: [
    "6297ad52af0e9d46adadfb1ac4eba806b65fce042f8c62624b43c01dc0af0ceb",
    // haoyangurealtors@gmail.com
    "c9bc739ae02e9f5829fb06471026cfc34f3d6a2f1b884f95a7b5468283fdca1c",
  ],
  passHash: "1940d9da546f9b2b13d2ec5fb71775e75cd9ba36ab606d242a1f76037af3a88e",
};
const ADMIN_HASH_ITERATIONS = 150000;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000;

const STORAGE_KEYS = {
  listings: "hy-realtors:listings",
  agents: "hy-realtors:agents",
  admins: "hy-realtors:admins",
  stats: "hy-realtors:usage-stats",
  favorites: "hy-realtors:favorites",
};

const toHex = (buf) =>
  Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

async function sha256Hex(text) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return toHex(digest);
}

async function pbkdf2Hex(secret, salt, iterations) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: enc.encode(salt), iterations, hash: "SHA-256" },
    key,
    256
  );
  return toHex(bits);
}

function randomSalt() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return toHex(bytes);
}

function readLockout() {
  try {
    return Number(window.sessionStorage.getItem("hy-realtors:lock")) || 0;
  } catch (e) {
    return 0;
  }
}
function writeLockout(until) {
  try {
    window.sessionStorage.setItem("hy-realtors:lock", String(until));
  } catch (e) {
    /* ignore */
  }
}

// Photos are resized in the browser so listings stay small.
function fileToResizedDataUrl(file, maxDim = 900, quality = 0.78) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type || !file.type.startsWith("image/")) {
      reject(new Error("Not an image"));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error || new Error("Read failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Bad image"));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
// ---------- Visitor accounts (Supabase Auth + a per-user favourites table) ----------
async function sbRequest(path, { method = "GET", body, token, headers = {} } = {}) {
  const res = await fetch(SITE_CONFIG.supabase.url.replace(/\/$/, "") + path, {
    method,
    headers: {
      apikey: SITE_CONFIG.supabase.anonKey,
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = null;
    }
  }
  if (!res.ok) {
    const err = new Error((data && (data.error_description || data.msg || data.message)) || "Request failed");
    err.status = res.status;
    err.code = data && (data.error_code || data.code || data.error);
    throw err;
  }
  return data;
}

// Profile names: the person's own name when they have one, otherwise the part of their email before the @.
const emailName = (email) => String(email || "").split("@")[0].trim();
const PLACEHOLDER_NAMES = new Set(["superadmin", "super admin", "admin", "administrator", "staff", "user", "account"]);
function displayNameFor(email, ...candidates) {
  for (const c of candidates) {
    const n = typeof c === "string" ? c.trim() : "";
    if (n && !PLACEHOLDER_NAMES.has(n.toLowerCase())) return n;
  }
  return emailName(email) || "Account";
}

function toAccount(user) {
  if (!user) return null;
  const meta = user.user_metadata || {};
  return { id: user.id, email: user.email, name: displayNameFor(user.email, meta.full_name, meta.name), avatar: typeof meta.avatar_url === "string" ? meta.avatar_url : "" };
}
function sessionFromResponse(data) {
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + (Number(data.expires_in) || 3600),
    user: toAccount(data.user),
  };
}
function saveSession(session) {
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    /* ignore */
  }
}
function clearSession() {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch (e) {
    /* ignore */
  }
}
async function getValidSession() {
  let session = null;
  try {
    session = JSON.parse(window.localStorage.getItem(SESSION_KEY) || "null");
  } catch (e) {
    session = null;
  }
  if (!session || !session.access_token) return null;
  if (session.expires_at - 60 > Math.floor(Date.now() / 1000)) return session;
  try {
    const data = await sbRequest("/auth/v1/token?grant_type=refresh_token", {
      method: "POST",
      body: { refresh_token: session.refresh_token },
    });
    const next = sessionFromResponse(data);
    saveSession(next);
    return next;
  } catch (e) {
    if (e && e.status && e.status < 500) clearSession();
    return null;
  }
}

const withCaptcha = (body, captchaToken) => (captchaToken ? { ...body, gotrue_meta_security: { captcha_token: captchaToken } } : body);

function jwtAal(token) {
  try {
    const part = String(token).split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(atob(part + "=".repeat((4 - (part.length % 4)) % 4)));
    return json.aal || "aal1";
  } catch (e) {
    return "aal1";
  }
}
const verifiedTotpFactors = (user) => ((user && user.factors) || []).filter((f) => f.factor_type === "totp" && f.status === "verified");

const authApi = {
  async signUp(email, password, name, captchaToken) {
    const data = await sbRequest("/auth/v1/signup", { method: "POST", body: withCaptcha({ email, password, data: { full_name: name } }, captchaToken) });
    return data && data.access_token ? { session: sessionFromResponse(data) } : { needsConfirmation: true };
  },
  async signIn(email, password, captchaToken) {
    const data = await sbRequest("/auth/v1/token?grant_type=password", { method: "POST", body: withCaptcha({ email, password }, captchaToken) });
    return sessionFromResponse(data);
  },
  recover(email, captchaToken) {
    return sbRequest("/auth/v1/recover", { method: "POST", body: withCaptcha({ email }, captchaToken) });
  },
  mfaEnroll(token) {
    return sbRequest("/auth/v1/factors", {
      method: "POST",
      token,
      body: { factor_type: "totp", friendly_name: "Hao yangu staff " + Date.now(), issuer: "Hao yangu realtors" },
    });
  },
  mfaChallenge(token, factorId) {
    return sbRequest(`/auth/v1/factors/${encodeURIComponent(factorId)}/challenge`, { method: "POST", token, body: {} });
  },
  async mfaVerify(token, factorId, challengeId, code) {
    const data = await sbRequest(`/auth/v1/factors/${encodeURIComponent(factorId)}/verify`, {
      method: "POST",
      token,
      body: { challenge_id: challengeId, code },
    });
    return sessionFromResponse(data);
  },
  mfaRemove(token, factorId) {
    return sbRequest(`/auth/v1/factors/${encodeURIComponent(factorId)}`, { method: "DELETE", token });
  },
  async signOut(token) {
    try {
      await sbRequest("/auth/v1/logout", { method: "POST", token });
    } catch (e) {
      /* the local session is cleared either way */
    }
  },
  updateUser(token, body) {
    return sbRequest("/auth/v1/user", { method: "PUT", token, body });
  },
  getUser(token) {
    return sbRequest("/auth/v1/user", { token });
  },
};

const normaliseListingId = (v) => (/^\d+$/.test(String(v)) ? Number(v) : v);
const favoritesApi = {
  async list(token) {
    const rows = await sbRequest("/rest/v1/favorites?select=listing_id", { token });
    return (rows || []).map((r) => normaliseListingId(r.listing_id));
  },
  add(token, ids) {
    return sbRequest("/rest/v1/favorites?on_conflict=user_id,listing_id", {
      method: "POST",
      token,
      headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
      body: ids.map((id) => ({ listing_id: String(id) })),
    });
  },
  remove(token, id) {
    return sbRequest("/rest/v1/favorites?listing_id=eq." + encodeURIComponent(String(id)), { method: "DELETE", token });
  },
};

// ---------- Shared data: listings, agents, staff and photos on Supabase ----------
const REMOTE = AUTH_ENABLED;

function listingFromRow(r) {
  const priceValue = Number(r.price_value) || 0;
  return {
    id: Number(r.id),
    title: r.title,
    location: r.location,
    price: formatPrice(priceValue),
    priceValue,
    period: r.period || "",
    tag: r.tag,
    beds: r.beds === null || r.beds === undefined ? null : Number(r.beds),
    baths: r.baths === null || r.baths === undefined ? null : Number(r.baths),
    size: r.size || "—",
    acres: r.acres === null || r.acres === undefined ? undefined : Number(r.acres),
    spaceType: r.space_type || undefined,
    img: r.img,
    featured: Boolean(r.featured),
    featuredUntil: r.featured_until || null,
    detailsLoaded: "contact" in r,
    description: r.description || "",
    amenities: Array.isArray(r.amenities) ? r.amenities : [],
    contact: r.contact || {},
    agency: r.agency || null,
    status: r.status,
    source: r.source,
    submittedBy: r.submitted_by,
  };
}
function listingToRow(l) {
  return {
    title: l.title,
    location: l.location,
    price_value: l.priceValue || 0,
    period: l.period || "",
    tag: l.tag,
    beds: l.beds === undefined ? null : l.beds,
    baths: l.baths === undefined ? null : l.baths,
    size: l.size || "",
    acres: l.acres === undefined ? null : l.acres,
    space_type: l.spaceType || null,
    img: l.img,
    featured: Boolean(l.featured),
    featured_until: l.featuredUntil || null,
    description: l.description || "",
    amenities: l.amenities || [],
    contact: l.contact || {},
    agency: l.agency || null,
    status: l.status,
    source: l.source || "admin",
    submitted_by: l.submittedBy || "",
  };
}
function agentFromRow(r) {
  return {
    id: Number(r.id),
    name: r.name,
    focus: r.focus || "",
    area: r.area || "",
    agency: r.agency || "",
    status: r.status,
    rating: r.rating === null || r.rating === undefined ? null : Number(r.rating),
    reviews: Number(r.reviews) || 0,
    img: r.img || "",
    comments: Array.isArray(r.comments) ? r.comments : [],
    verifiedAt: r.verified_at || null,
    verification: r.verification && typeof r.verification === "object" ? r.verification : {},
  };
}
function agentToRow(a) {
  return {
    name: a.name,
    focus: a.focus || "",
    area: a.area || "",
    agency: a.agency || null,
    status: a.status,
    rating: typeof a.rating === "number" ? a.rating : null,
    reviews: a.reviews || 0,
    img: a.img || "",
    comments: a.comments || [],
    verified_at: a.verifiedAt || null,
    verification: a.verification || {},
  };
}
function staffFromRow(r) {
  return {
    id: Number(r.id),
    name: r.name,
    email: r.email,
    agency: r.agency || "",
    status: r.status,
    createdAt: String(r.created_at || "").slice(0, 10),
  };
}
function staffToRow(a) {
  return { email: String(a.email).toLowerCase(), name: a.name, agency: a.agency, status: a.status, role: "admin" };
}

// Panels hand us the whole new list; we work out what was added, changed or removed and send just that.
async function syncRows(table, prev, next, toRow) {
  const session = await getValidSession();
  if (!session) throw Object.assign(new Error("Not signed in"), { status: 401 });
  const token = session.access_token;
  const prevById = new Map(prev.map((r) => [r.id, r]));
  const nextIds = new Set(next.map((r) => r.id));
  const ops = [];
  prev.forEach((r) => {
    if (!nextIds.has(r.id)) ops.push(sbRequest(`/rest/v1/${table}?id=eq.${encodeURIComponent(r.id)}`, { method: "DELETE", token }));
  });
  next.forEach((r) => {
    const old = prevById.get(r.id);
    if (!old) {
      ops.push(sbRequest(`/rest/v1/${table}`, { method: "POST", token, headers: { Prefer: "return=minimal" }, body: toRow(r) }));
    } else if (JSON.stringify(toRow(old)) !== JSON.stringify(toRow(r))) {
      ops.push(sbRequest(`/rest/v1/${table}?id=eq.${encodeURIComponent(r.id)}`, { method: "PATCH", token, headers: { Prefer: "return=minimal" }, body: toRow(r) }));
    }
  });
  await Promise.all(ops);
}

// Visitors without an account only get the public part of a listing. Signed-in visitors get everything.
const PUBLIC_LISTING_COLUMNS = "id,title,location,price_value,period,tag,beds,baths,size,acres,space_type,img,featured,featured_until,agency,status,created_at";
const PUBLIC_AGENT_COLUMNS = "id,name,focus,area,agency,status,rating,reviews,img,verified_at,created_at";

async function fetchRemoteData(isSuperadmin, isStaff = isSuperadmin) {
  const session = await getValidSession();
  const token = session ? session.access_token : undefined;
  const listingColumns = token ? "*" : PUBLIC_LISTING_COLUMNS;
  const requests = [
    sbRequest(`/rest/v1/listings?select=${listingColumns}&order=id.desc&limit=500`, { token }),
    sbRequest(`/rest/v1/agents?select=${PUBLIC_AGENT_COLUMNS}&order=id.asc`, { token }),
  ];
  if (token && isSuperadmin) requests.push(sbRequest("/rest/v1/staff?select=*&order=id.asc", { token }));
  const [listingRows, agentRows, staffRows] = await Promise.all(requests);
  let agents = agentRows;
  if (token && isStaff) {
    // Staff also see the private notes and verification details, which are never sent to anyone else.
    try {
      const priv = await sbRequest("/rest/v1/rpc/agent_private", { method: "POST", token, body: {} });
      const byId = new Map((priv || []).map((p) => [Number(p.id), p]));
      agents = agentRows.map((r) => {
        const extra = byId.get(Number(r.id));
        return extra ? { ...r, comments: extra.comments, verification: extra.verification } : r;
      });
    } catch (e) {
      // Before the database update is applied the full table is still readable, so fall back to it.
      agents = await sbRequest("/rest/v1/agents?select=*&order=id.asc", { token });
    }
  }
  const data = { listings: listingRows.map(listingFromRow), agents: agents.map(agentFromRow) };
  if (staffRows) data.admins = staffRows.filter((r) => r.role === "admin").map(staffFromRow);
  return data;
}

// Remember where a visitor was heading, so they land there after creating an account or logging in.
const INTENT_KEY = "hy-realtors:after-login";
function saveIntent(path) {
  try {
    window.localStorage.setItem(INTENT_KEY, JSON.stringify({ path, at: Date.now() }));
  } catch (e) {
    /* ignore */
  }
}
function clearIntent() {
  try {
    window.localStorage.removeItem(INTENT_KEY);
  } catch (e) {
    /* ignore */
  }
}
function takeIntent() {
  try {
    const raw = window.localStorage.getItem(INTENT_KEY);
    window.localStorage.removeItem(INTENT_KEY);
    const v = raw ? JSON.parse(raw) : null;
    return v && v.path && Date.now() - v.at < 3600000 ? v.path : null;
  } catch (e) {
    return null;
  }
}

function dataUrlToBlob(dataUrl) {
  const [head, b64] = dataUrl.split(",");
  const mime = (head.match(/data:([^;]+)/) || [])[1] || "image/jpeg";
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}
// Listing cards show a small copy of each photo (same name with -t before .jpg); older photos fall back to the full one.
const thumbSrc = (url) =>
  typeof url === "string" && /\/storage\/v1\/object\/public\/photos\/listings\/[^/]+\.jpg$/.test(url) && !/-t\.jpg$/.test(url)
    ? url.replace(/\.jpg$/, "-t.jpg")
    : url;

async function putPhoto(base, token, path, blob, upsert = false) {
  const res = await fetch(`${base}/storage/v1/object/photos/${path}`, {
    method: "POST",
    headers: {
      apikey: SITE_CONFIG.supabase.anonKey,
      Authorization: "Bearer " + token,
      "Content-Type": blob.type || "image/jpeg",
      "x-upsert": upsert ? "true" : "false",
    },
    body: blob,
  });
  if (!res.ok) throw Object.assign(new Error("Upload failed"), { status: res.status });
}

async function uploadPhoto(file, folder, maxDim, quality, withThumb = false) {
  const session = await getValidSession();
  if (!session) throw Object.assign(new Error("Not signed in"), { status: 401 });
  const blob = dataUrlToBlob(await fileToResizedDataUrl(file, maxDim, quality));
  const id = window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);
  const path = `${folder}/${id}.jpg`;
  const base = SITE_CONFIG.supabase.url.replace(/\/$/, "");
  await putPhoto(base, session.access_token, path, blob);
  if (withThumb) {
    try {
      const small = dataUrlToBlob(await fileToResizedDataUrl(file, 480, 0.72));
      await putPhoto(base, session.access_token, `${folder}/${id}-t.jpg`, small);
    } catch (e) {
      /* the full photo is used if the small one is missing */
    }
  }
  return `${base}/storage/v1/object/public/photos/${path}`;
}

// Profile photos live at photos/avatars/<user id>.jpg and the address is kept on the account itself.
async function uploadAvatar(blob) {
  const session = await getValidSession();
  if (!session || !session.user) throw Object.assign(new Error("Not signed in"), { status: 401 });
  const base = SITE_CONFIG.supabase.url.replace(/\/$/, "");
  const path = `avatars/${session.user.id}.jpg`;
  await putPhoto(base, session.access_token, path, blob, true);
  const url = `${base}/storage/v1/object/public/photos/${path}?v=${Date.now()}`;
  await authApi.updateUser(session.access_token, { data: { avatar_url: url } });
  saveSession({ ...session, user: { ...session.user, avatar: url } });
  return url;
}

function friendlySyncError(err) {
  if (err instanceof TypeError) return "We couldn't reach the server, so your last change wasn't saved.";
  if (err && (err.status === 401 || err.status === 403)) return "That wasn't allowed, or your session has expired. Please sign in again.";
  return "We couldn't save that change. Please try again.";
}

function friendlyAuthError(err, tab) {
  if (err instanceof TypeError) return "We couldn't reach the server. Check your connection and try again.";
  const code = String((err && err.code) || "");
  if (code === "email_not_confirmed") return "Please confirm your email first. Check your inbox for the link.";
  if (err && err.status === 429) return "Too many attempts. Please wait a minute and try again.";
  if (code === "captcha_failed") return "The security check didn't pass. Please try again.";
  if (code === "mfa_verification_failed" || code === "mfa_challenge_expired" || code === "mfa_verification_rejected") return "That code didn't work. Use the newest code from your authenticator app.";
  if (code === "weak_password") return "That password is too weak. Try a longer one with letters and numbers.";
  if (code === "user_already_exists" || code === "email_exists") return "That email already has an account. Try logging in instead.";
  if (tab === "login" && err && err.status === 400) return "Incorrect email or password.";
  if (tab === "recovery" && err && (err.status === 401 || err.status === 403)) return "That reset link has expired. Request a new one.";
  return "Something went wrong. Please try again.";
}

const isSafeImageSrc = (value) => /^(https:\/\/|data:image\/)/i.test(value.trim());

// Storage adapter. Where a shared backend is not available this falls back to this browser's own storage,
// so data is NOT shared between visitors until you connect a real backend (Supabase, Firebase, etc.).
(function installStorageFallback() {
  if (typeof window === "undefined" || window.storage) return;
  const memory = new Map();
  const read = (key) => {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return memory.has(key) ? memory.get(key) : null;
    }
  };
  const write = (key, value) => {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      memory.set(key, value);
    }
  };
  window.storage = {
    async get(key, shared = false) {
      const value = read(key);
      if (value === null || value === undefined) throw new Error("Key not found: " + key);
      return { key, value, shared };
    },
    async set(key, value, shared = false) {
      write(key, value);
      return { key, value, shared };
    },
    async delete(key, shared = false) {
      try {
        window.localStorage.removeItem(key);
      } catch (e) {
        memory.delete(key);
      }
      return { key, deleted: true, shared };
    },
  };
})();

const LISTING_STATUS_META = {
  pending: { label: "Pending", color: "var(--accent-text)" },
  approved: { label: "Approved", color: "var(--primary)" },
  held: { label: "On hold", color: "var(--ink-soft)" },
  revoked: { label: "Revoked", color: "var(--brick)" },
};

// A listing is "Featured" while its flag is on and any end date is still in the future.
const isFeatured = (l) => Boolean(l && l.featured) && (!l.featuredUntil || new Date(l.featuredUntil).getTime() > Date.now());
const FEATURE_OPTIONS = [
  { label: "7 days", days: 7 },
  { label: "14 days", days: 14 },
  { label: "30 days", days: 30 },
  { label: "Until I remove it", days: 0 },
];
const formatShortDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch (e) {
    return "";
  }
};
const SITE_FEATURED_PRICING = import.meta.env.VITE_FEATURED_PRICING || "";

// ---- What "Verified" means. EDIT THESE so they match what you really check. ----
const VERIFICATION_UPDATED = "October 2026";
const VERIFICATION_RECHECK_DAYS = 365;
const VERIFICATION_CRITERIA = [
  { id: "identity", label: "Identity confirmed", detail: "We checked a valid national ID or passport that matches the agent's name." },
  { id: "contact", label: "Contact details confirmed", detail: "We reached the agent on the phone number and email address they gave us." },
  { id: "registration", label: "Registration reviewed", detail: "We asked for any business or professional registration that applies to them (for example with the Estate Agents Registration Board) and checked what we were given." },
  { id: "agency", label: "Agency confirmed", detail: "If the agent works for an agency, the agency confirmed it. Independent agents tell us so." },
  { id: "conduct", label: "Code of conduct accepted", detail: "The agent agreed to advertise only properties they are authorised to advertise, keep details accurate and up to date, and never ask for money just to view a property." },
];

function formatPrice(value) {
  const n = Number(value) || 0;
  if (n >= 1000000) {
    const m = n / 1000000;
    return `KSh ${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  return `KSh ${n.toLocaleString()}`;
}

function matchesSecondary(p, category, value) {
  if (!value || value === "Any") return true;
  if (category === "buy" || category === "rent") {
    if (value === "Studio") return p.beds != null && p.beds <= 1;
    const min = parseInt(value, 10);
    return p.beds != null && !Number.isNaN(min) && p.beds >= min;
  }
  if (category === "commercial") return p.spaceType === value;
  if (category === "land") {
    const [min, max] = LAND_SIZE_RANGES[value] || [0, Infinity];
    return p.acres != null && p.acres >= min && p.acres <= max;
  }
  return true;
}

const STEPS = [
  {
    n: "01",
    title: "Search",
    body: "Filter by location, budget and type across Buy, Rent, Commercial and Land in one search.",
  },
  {
    n: "02",
    title: "Connect",
    body: "Contact the listing's agent directly and arrange a viewing.",
  },
  {
    n: "03",
    title: "Move in",
    body: "Agree the details with the agent, then get the keys to your hao.",
  },
];

// Agents are added by the superadmin or agency admins from the dashboard. None are pre-loaded.
const AGENTS = [];

/* ---------------------------------------------------------------- */
/* Small building blocks                                             */
/* ---------------------------------------------------------------- */

function Roofline({ className = "", flip = false, style = {} }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 20"
      preserveAspectRatio="none"
      style={{ display: "block", width: "100%", height: 16, transform: flip ? "scaleY(-1)" : "none", ...style }}
      aria-hidden="true"
    >
      <polyline
        points="0,20 20,2 40,20 60,2 80,20 100,2 120,20 140,2 160,20 180,2 200,20 220,2 240,20 260,2 280,20 300,2 320,20 340,2 360,20 380,2 400,20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


function LogoMark({ size = 34 }) {
  return (
    <span className="pk-logo-badge" style={{ width: Math.round(size * 1.75), height: size }}>
      <img src={LOGO_IMAGE_SRC} alt="Hao yangu realtors" className="pk-logo-img pk-logo-light" />
      <img src={LOGO_IMAGE_SRC_DARK} alt="" aria-hidden="true" className="pk-logo-img pk-logo-dark" />
    </span>
  );
}

// Keeps keyboard focus inside an open dialog, and returns it to where it was when the dialog closes.
function useDialogFocus(open, ref) {
  useEffect(() => {
    if (!open || !ref.current) return undefined;
    const node = ref.current;
    const previous = document.activeElement;
    const focusable = () =>
      Array.from(node.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(
        (el) => el.offsetParent !== null
      );
    const timer = setTimeout(() => {
      const items = focusable();
      (items[0] || node).focus();
    }, 80);
    const onKey = (e) => {
      if (e.key !== "Tab") return;
      const items = focusable();
      if (!items.length) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    node.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      node.removeEventListener("keydown", onKey);
      if (previous && previous.focus) previous.focus();
    };
  }, [open, ref]);
}

function VerifiedBadge({ size = 15 }) {
  return (
    <span role="img" aria-label="Verified agent" title="Verified agent" className="inline-flex">
      <BadgeCheck size={size} className="pk-primary-text" aria-hidden="true" />
    </span>
  );
}

function ImageWithFallback({ src, fallbackSrc, alt, className, iconFallback: Icon = HomeIcon, eager = false }) {
  const [current, setCurrent] = useState(src);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setCurrent(src);
    setFailed(false);
  }, [src]);
  if (failed || !current) {
    return (
      <div className={`${className} pk-img-fallback`}>
        <Icon size={28} strokeWidth={1.5} />
      </div>
    );
  }
  return (
    <img
      src={current}
      alt={alt}
      className={className}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => {
        if (fallbackSrc && current !== fallbackSrc) setCurrent(fallbackSrc);
        else setFailed(true);
      }}
    />
  );
}

function useCountUp(target, duration = 1500) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);
  const nodeRef = useRef(null);

  useEffect(() => {
    const el = nodeRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setValue(target);
      return;
    }
    let raf;
    const startTime = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, target, duration]);

  return [value, nodeRef];
}

function useLiveCounter(target, duration = 800) {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);
  const firstRef = useRef(true);

  useEffect(() => {
    const from = firstRef.current ? 0 : prevRef.current;
    const to = target;
    firstRef.current = false;
    prevRef.current = target;

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (from === to || reduceMotion) {
      setDisplay(to);
      return;
    }

    let raf;
    const startTime = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return display;
}

function AdminStatCounter({ value }) {
  const display = useLiveCounter(value);
  return <div className="pk-mono pk-primary-text pk-admin-stat-value">{display.toLocaleString()}</div>;
}

function StatItem({ stat }) {
  const [value, ref] = useCountUp(stat.target);
  const display = stat.comma ? value.toLocaleString() : value;
  return (
    <div ref={ref} className="pk-stat-cell">
      <div className="pk-mono pk-stat-num pk-primary-text">
        {stat.prefix}
        {display}
        {stat.suffix}
      </div>
      <div className="pk-ink-soft text-sm mt-1">{stat.label}</div>
    </div>
  );
}

function CustomSelect({ id, label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="pk-field" ref={wrapRef} style={{ position: "relative" }}>
      <label id={`${id}-label`}>{label}</label>
      <button
        type="button"
        className="pk-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${id}-label`}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{value}</span>
        <ChevronDown size={15} className={`pk-select-chevron ${open ? "pk-select-chevron-open" : ""}`} />
      </button>
      <ul className={`pk-select-panel pk-glass ${open ? "pk-select-panel-open" : ""}`} role="listbox" aria-labelledby={`${id}-label`}>
        {options.map((opt) => (
          <li key={opt}>
            <button
              type="button"
              role="option"
              aria-selected={opt === value}
              className={`pk-select-option ${opt === value ? "pk-select-option-active" : ""}`}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt}
              {opt === value && <Check size={14} />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PropertyCard({ property, isFavorite, onToggleFavorite, onSelect, style }) {
  return (
    <article
      className="pk-card overflow-hidden"
      style={{ cursor: onSelect ? "pointer" : "default", ...style }}
      onClick={() => onSelect && onSelect(property.id)}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={(e) => {
        if (onSelect && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect(property.id);
        }
      }}
    >
      <div className="pk-prop-media">
        <ImageWithFallback src={thumbSrc(property.img)} fallbackSrc={property.img} alt={property.title} className="pk-prop-media-img" iconFallback={HomeIcon} />
        <span className="pk-prop-tag">{isFeatured(property) ? "Featured" : property.tag}</span>
        <button
          className="pk-fav-btn"
          aria-label={isFavorite ? "Remove from saved" : "Save property"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(property.id);
          }}
        >
          <Heart size={16} color={isFavorite ? "#603838" : "#1E1D2F"} fill={isFavorite ? "#603838" : "none"} />
        </button>
      </div>
      <div className="p-4">
        <div className="pk-mono pk-prop-price pk-primary-text">
          {property.price}
          <span className="text-sm pk-ink-soft font-normal">{property.period}</span>
        </div>
        <h3 className="font-semibold mt-1">
          <a
            href={`/listing/${property.id}`}
            style={{ color: "inherit", textDecoration: "none" }}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
                e.stopPropagation();
                return;
              }
              e.preventDefault();
            }}
          >
            {property.title}
          </a>
        </h3>
        <p className="pk-ink-soft text-sm flex items-center gap-1 mt-1">
          <MapPin size={13} /> {property.location}
        </p>
        <div className="flex items-center gap-3 mt-3 pt-3 text-sm pk-ink-soft" style={{ borderTop: "1px solid var(--border)" }}>
          {property.beds != null && (
            <span className="flex items-center gap-1"><Bed size={14} /> {property.beds}</span>
          )}
          {property.baths != null && (
            <span className="flex items-center gap-1"><Bath size={14} /> {property.baths}</span>
          )}
          <span className="flex items-center gap-1"><Ruler size={14} /> {property.size}</span>
        </div>
      </div>
    </article>
  );
}

// ---------- Home hero: featured carousel, slim search card, mobile search sheet ----------
const HERO_TAG = {
  buy: { label: "For Sale", icon: HomeIcon },
  rent: { label: "For Rent", icon: KeyRound },
  commercial: { label: "Commercial", icon: Building2 },
  land: { label: "Land", icon: TreePine },
};

function HeroCarousel({ items, onOpen }) {
  const n = items.length;
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touching, setTouching] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const drag = useRef({ x: 0, y: 0, active: false, moved: false });
  const stepRef = useRef(0);
  const prevOffsets = useRef([]);

  useEffect(() => {
    const mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    setReduceMotion(Boolean(mq && mq.matches));
    const onVis = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // If the list gets shorter while someone is looking at it, never point past the end.
  useEffect(() => {
    if (index >= n) setIndex(0);
  }, [n, index]);

  const move = (delta) => {
    stepRef.current = delta;
    setIndex((i) => (((i + delta) % n) + n) % n);
  };
  const jump = (i) => {
    stepRef.current = 0;
    setIndex(i);
  };

  const paused = hovered || focused || touching || !tabVisible || reduceMotion || n < 2;
  useEffect(() => {
    if (paused) return undefined;
    const t = setTimeout(() => move(1), 5000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, paused, n]);

  const offsetOf = (i) => {
    let d = (i - index + n) % n;
    if (d > n / 2) d -= n;
    return d;
  };
  const offsets = items.map((_, i) => offsetOf(i));
  // A slide that hops from one side to the other during a one-step move should jump, not fly across.
  const noAnim = offsets.map((d, i) => Math.abs(stepRef.current) === 1 && prevOffsets.current[i] !== undefined && Math.abs(d - prevOffsets.current[i]) >= 2);
  useEffect(() => {
    prevOffsets.current = offsets;
  });

  const onPointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    drag.current = { x: e.clientX, y: e.clientY, active: true, moved: false };
    if (e.pointerType !== "mouse") setTouching(true);
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (d.active && Math.abs(e.clientX - d.x) > 10) d.moved = true;
  };
  const endDrag = (e, cancelled) => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    setTouching(false);
    if (cancelled) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
  };

  const current = items[index] || items[0];
  if (!current) return null;

  return (
    <div
      className="pk-hc"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured listings"
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") move(-1);
        if (e.key === "ArrowRight") move(1);
      }}
    >
      <div className="pk-hc-viewport">
        <div
          className="pk-hc-stage"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(e) => endDrag(e, false)}
          onPointerCancel={(e) => endDrag(e, true)}
        >
          {items.map((l, i) => {
            const d = offsets[i];
            const pos = d === 0 ? "0" : d === -1 ? "-1" : d === 1 ? "1" : d < 0 ? "far-l" : "far-r";
            const tag = HERO_TAG[String(l.tag || "").toLowerCase()] || { label: l.tag, icon: HomeIcon };
            const TagIcon = tag.icon;
            const isCurrent = d === 0;
            const activate = () => {
              if (drag.current.moved) {
                drag.current.moved = false;
                return;
              }
              if (isCurrent) onOpen(l.id);
              else if (d === 1) move(1);
              else if (d === -1) move(-1);
            };
            return (
              <div
                key={l.id}
                className="pk-hc-slide"
                data-pos={pos}
                data-noanim={noAnim[i] ? "true" : "false"}
                role={isCurrent ? "button" : undefined}
                tabIndex={isCurrent ? 0 : -1}
                aria-hidden={isCurrent ? undefined : true}
                aria-label={isCurrent ? `${l.title}, ${l.location}, ${l.price}${l.period || ""}. Open listing` : undefined}
                onClick={activate}
                onKeyDown={(e) => {
                  if (isCurrent && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onOpen(l.id);
                  }
                }}
              >
                <ImageWithFallback src={l.img} alt="" className="pk-hc-img" iconFallback={HomeIcon} eager={i === 0} />
                <span className="pk-hc-badge pk-hc-badge-top">
                  <TagIcon size={20} aria-hidden="true" />
                  <span>
                    <strong>{tag.label}</strong>
                    <em>{l.price}{l.period || ""}</em>
                  </span>
                </span>
                <span className="pk-hc-badge pk-hc-badge-bottom">
                  <MapPin size={20} aria-hidden="true" />
                  <span>
                    <strong>{l.title}</strong>
                    <em>{l.location}</em>
                  </span>
                </span>
              </div>
            );
          })}
          {n > 1 && (
            <>
              <button type="button" className="pk-hc-arrow pk-hc-arrow-prev" aria-label="Previous listing" onClick={() => move(-1)}>
                <ChevronLeft size={22} />
              </button>
              <button type="button" className="pk-hc-arrow pk-hc-arrow-next" aria-label="Next listing" onClick={() => move(1)}>
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </div>
      </div>
      {n > 1 && (
        <div className="pk-hc-dots">
          {items.map((l, i) => (
            <button key={l.id} type="button" className="pk-hc-dot" aria-label={`Show listing ${i + 1} of ${n}`} aria-current={i === index ? "true" : undefined} onClick={() => jump(i)} />
          ))}
        </div>
      )}
      <div className="sr-only" aria-live={paused ? "polite" : "off"}>
        {`Listing ${index + 1} of ${n}: ${current.title}`}
      </div>
    </div>
  );
}

function HeroSearch({ idPrefix, sheet = false, activeTab, onTabChange, location, setLocation, secondary, setSecondary, budget, setBudget, onSearch }) {
  const meta = TAB_META[activeTab];
  return (
    <div className={`pk-search-card ${sheet ? "pk-search-card-sheet" : ""}`}>
      <div className="pk-tab-row" style={{ scrollbarWidth: "none" }}>
        {Object.entries(TAB_META).map(([key, m]) => {
          const TIcon = m.icon;
          return (
            <button key={key} type="button" aria-pressed={activeTab === key} className={`pk-tab ${activeTab === key ? "pk-tab-active" : ""}`} onClick={() => onTabChange(key)}>
              <TIcon size={14} /> {m.label}
            </button>
          );
        })}
      </div>
      <div className="pk-search-grid">
        <div className="pk-field">
          <label htmlFor={`${idPrefix}-location`}>Location</label>
          <div className="flex items-center gap-2">
            <MapPin size={15} className="pk-ink-soft" />
            <input
              aria-label="Search by location"
              id={`${idPrefix}-location`}
              type="text"
              placeholder="Try Milimani, Section 58, Lanet…"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
            />
          </div>
        </div>
        <CustomSelect id={`${idPrefix}-secondary`} label={meta.secondaryLabel} value={secondary} options={meta.secondaryOptions} onChange={setSecondary} />
        <CustomSelect id={`${idPrefix}-budget`} label="Budget" value={budget} options={meta.budgetOptions} onChange={setBudget} />
        <button type="button" className="pk-btn-primary justify-center pk-search-btn" onClick={onSearch}>
          <Search size={16} /> Search
        </button>
      </div>
    </div>
  );
}

function HeroShortcuts({ onPick }) {
  const items = [
    { key: "buy", label: "Buy", icon: HomeIcon },
    { key: "rent", label: "Rent", icon: KeyRound },
    { key: "commercial", label: "Commercial", icon: Building2 },
    { key: "land", label: "Land", icon: TreePine },
    { key: "agents", label: "Agents", icon: Users },
  ];
  return (
    <nav className="pk-shortcuts" aria-label="Browse by category">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <button key={it.key} type="button" className="pk-shortcut" onClick={() => onPick(it.key)}>
            <span className="pk-shortcut-icon"><Icon size={22} strokeWidth={1.8} /></span>
            <span>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// Mobile search: a panel that slides up from the bottom.
function SearchSheet({ open, onClose, children }) {
  const ref = useRef(null);
  const [lingering, setLingering] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (open) {
      setLingering(true);
      let r2;
      const r1 = requestAnimationFrame(() => {
        r2 = requestAnimationFrame(() => setShown(true));
      });
      return () => {
        cancelAnimationFrame(r1);
        cancelAnimationFrame(r2);
      };
    }
    setShown(false);
    const t = setTimeout(() => setLingering(false), 300);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useDialogFocus(open, ref);

  if (!open && !lingering) return null;
  return (
    <div className={`pk-sheet-root ${shown && open ? "pk-sheet-open" : ""}`}>
      <div className="pk-sheet-backdrop" onClick={onClose} />
      <div ref={ref} className="pk-sheet" role="dialog" aria-modal="true" aria-label="Search properties" tabIndex={-1}>
        <div className="pk-sheet-head">
          <span className="pk-sheet-grab" aria-hidden="true" />
          <h2 className="pk-display text-lg font-semibold">Search properties</h2>
          <button type="button" className="pk-icon-btn" aria-label="Close search" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ---------- Profile photo: pick, move and zoom inside a circle, then save a 512 x 512 square ----------
const AVATAR_RULES = { maxBytes: 5 * 1024 * 1024, minPx: 192, outPx: 512, types: ["image/jpeg", "image/png", "image/webp"] };
const CROP_VIEW = 264;

function ProfilePhotoModal({ account, required, onClose, onSaved, onLogout }) {
  const dialogRef = useRef(null);
  const fileRef = useRef(null);
  const drag = useRef(null);
  const [img, setImg] = useState(null);
  const [src, setSrc] = useState("");
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState({ x: 0, y: 0 });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useDialogFocus(true, dialogRef);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && !required && !busy && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [required, busy, onClose]);

  useEffect(() => () => src && URL.revokeObjectURL(src), [src]);

  const onPick = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    if (!AVATAR_RULES.types.includes(file.type)) {
      setError("Please choose a JPG, PNG or WebP photo.");
      return;
    }
    if (file.size > AVATAR_RULES.maxBytes) {
      setError("That file is over 5 MB. Please choose a smaller photo.");
      return;
    }
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => {
      if (im.naturalWidth < AVATAR_RULES.minPx || im.naturalHeight < AVATAR_RULES.minPx) {
        URL.revokeObjectURL(url);
        setError(`That photo is too small. It needs to be at least ${AVATAR_RULES.minPx} × ${AVATAR_RULES.minPx} pixels.`);
        return;
      }
      setImg(im);
      setSrc(url);
      setZoom(1);
      setCenter({ x: im.naturalWidth / 2, y: im.naturalHeight / 2 });
    };
    im.onerror = () => {
      URL.revokeObjectURL(url);
      setError("We couldn't open that image. Please try a JPG or PNG.");
    };
    im.src = url;
  };

  const V = CROP_VIEW;
  const ds = img ? (V / Math.min(img.naturalWidth, img.naturalHeight)) * zoom : 1; // screen pixels per photo pixel
  const clampCenter = (c) => {
    const half = V / 2 / ds;
    return {
      x: Math.min(Math.max(c.x, half), img.naturalWidth - half),
      y: Math.min(Math.max(c.y, half), img.naturalHeight - half),
    };
  };
  const cc = img ? clampCenter(center) : center;

  const onPointerDown = (e) => {
    if (!img) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, cx: cc.x, cy: cc.y };
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d || !img) return;
    setCenter(clampCenter({ x: d.cx - (e.clientX - d.px) / ds, y: d.cy - (e.clientY - d.py) / ds }));
  };
  const endDrag = () => {
    drag.current = null;
  };
  const onKeyDown = (e) => {
    if (!img) return;
    const step = 12 / ds;
    const move = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
    if (!move) return;
    e.preventDefault();
    setCenter(clampCenter({ x: cc.x + move[0], y: cc.y + move[1] }));
  };

  const save = async () => {
    if (!img || busy) return;
    setBusy(true);
    setError("");
    try {
      const half = V / 2 / ds;
      const canvas = document.createElement("canvas");
      canvas.width = AVATAR_RULES.outPx;
      canvas.height = AVATAR_RULES.outPx;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, AVATAR_RULES.outPx, AVATAR_RULES.outPx);
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, cc.x - half, cc.y - half, half * 2, half * 2, 0, 0, AVATAR_RULES.outPx, AVATAR_RULES.outPx);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
      if (!blob) throw new Error("Could not process the photo");
      const url = await uploadAvatar(blob);
      onSaved(url);
    } catch (err) {
      setError(err instanceof TypeError ? friendlySyncError(err) : "We couldn't save your photo just now. Please try again, and contact us if it keeps happening.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pk-photo-root">
      <div className="pk-photo-backdrop" onClick={required || busy ? undefined : onClose} />
      <div ref={dialogRef} className="pk-photo-dialog" role="dialog" aria-modal="true" aria-labelledby="pk-photo-title" tabIndex={-1}>
        <h2 id="pk-photo-title" className="pk-display text-xl md:text-2xl font-semibold">
          {required ? "Add your profile photo" : "Change your photo"}
        </h2>
        <p className="pk-ink-soft text-sm mt-1">
          {required
            ? `One last step, ${account.name}. Pick a clear photo of yourself. You can move and zoom it to fit the circle.`
            : "Pick a new photo, then move and zoom it to fit the circle."}
        </p>
        <p className="pk-photo-rules">JPG, PNG or WebP · max 5 MB · min 192 × 192 px</p>

        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1} onChange={onPick} aria-label="Choose a profile photo" />

        {!img ? (
          <button type="button" className="pk-photo-empty" onClick={() => fileRef.current && fileRef.current.click()}>
            <Camera size={30} strokeWidth={1.6} />
            <span>Choose photo</span>
          </button>
        ) : (
          <>
            <div
              className="pk-photo-crop"
              style={{ width: V, height: V }}
              tabIndex={0}
              role="application"
              aria-label="Photo crop area. Drag, or use the arrow keys, to move the photo."
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onKeyDown={onKeyDown}
            >
              <img
                src={src}
                alt=""
                draggable={false}
                style={{ width: img.naturalWidth * ds, height: img.naturalHeight * ds, left: V / 2 - cc.x * ds, top: V / 2 - cc.y * ds }}
              />
              <span className="pk-photo-circle" aria-hidden="true" />
            </div>
            <label className="pk-photo-zoom">
              <span className="sr-only">Zoom</span>
              <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} aria-label="Zoom" />
            </label>
          </>
        )}

        {error && (
          <p role="alert" className="pk-photo-error">
            {error}
          </p>
        )}

        <div className="pk-photo-actions">
          {img && (
            <>
              <button type="button" className="pk-btn-primary justify-center" onClick={save} disabled={busy}>
                {busy ? "Saving…" : "Save photo"}
              </button>
              <button type="button" className="pk-btn-outline justify-center" onClick={() => fileRef.current && fileRef.current.click()} disabled={busy}>
                Choose a different photo
              </button>
            </>
          )}
          {!required && (
            <button type="button" className="pk-btn-outline justify-center" onClick={onClose} disabled={busy}>
              Cancel
            </button>
          )}
        </div>
        {required && (
          <button type="button" className="pk-photo-logout" onClick={onLogout} disabled={busy}>
            Not now? Log out
          </button>
        )}
      </div>
    </div>
  );
}

const LOADING_ITEMS = [
  { icon: HomeIcon, label: "Buy" },
  { icon: KeyRound, label: "Rent" },
  { icon: Building2, label: "Commercial" },
  { icon: TreePine, label: "Land" },
];

function LoadingScreen({ fadingOut }) {
  return (
    <div className={`pk-loading-screen ${fadingOut ? "pk-loading-fade-out" : ""}`}>
      <div className="pk-loading-inner">
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <LogoMark size={40} />
          <span className="pk-display pk-loading-wordmark">Hao yangu realtors</span>
        </div>

        <div className="pk-loading-path-wrap">
          <div className="pk-loading-row">
            {LOADING_ITEMS.map((item, i) => {
              const ItemIcon = item.icon;
              return (
                <div key={item.label} className="pk-loading-tile">
                  <div className={`pk-loading-tile-icon pk-loading-pulse-${i + 1}`}>
                    <ItemIcon size={24} />
                  </div>
                  <span className="pk-loading-tile-label">{item.label}</span>
                </div>
              );
            })}
          </div>
          <div className="pk-loading-track">
            <span className="pk-loading-track-line" />
            {LOADING_ITEMS.map((_, i) => (
              <span key={i} className="pk-loading-node" style={{ left: `${(i / (LOADING_ITEMS.length - 1)) * 100}%` }} />
            ))}
            <div className="pk-loading-pin">
              <MapPin size={22} fill="var(--accent)" />
            </div>
          </div>
        </div>

        <h2 className="pk-display pk-loading-heading">Finding your perfect place…</h2>
        <div className="pk-loading-bar-track">
          <div className="pk-loading-bar-fill" />
        </div>
        <p className="pk-loading-subtext">This may take a few seconds</p>
      </div>
    </div>
  );
}

function InitialsAvatar({ name, size = 48 }) {
  const initials =
    String(name || "")
      .split(/[\s._-]+/)
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";
  return (
    <div className="pk-initials-avatar" style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {initials}
    </div>
  );
}

// Shows the profile photo when there is one, otherwise the initials.
function Avatar({ name, src, size = 48 }) {
  const [bad, setBad] = useState(false);
  useEffect(() => {
    setBad(false);
  }, [src]);
  if (src && !bad && /^https:\/\//i.test(src)) {
    return <img className="pk-avatar-img" src={src} alt="" width={size} height={size} style={{ width: size, height: size }} onError={() => setBad(true)} />;
  }
  return <InitialsAvatar name={name} size={size} />;
}

function PropertyDetailPage({
  property,
  category,
  onBackHome,
  onBackCategory,
  favorites,
  onToggleFavorite,
  similar,
  onSelectProperty,
  onOpenModal,
}) {
  const isFavorite = favorites.has(property.id);
  const contact = property.contact;

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-8 pt-8 md:pt-12 pb-20">
      <p className="pk-mono text-xs uppercase tracking-wide mb-3 pk-breadcrumb">
        <button onClick={onBackHome} className="pk-primary-text font-semibold">Home</button>
        <span className="pk-ink-soft"> / </span>
        <button onClick={onBackCategory} className="pk-primary-text font-semibold">{LISTING_META[category].label}</button>
        <span className="pk-ink-soft"> / {property.title}</span>
      </p>

      <div className="pk-detail-grid">
        <div>
          <div className="pk-detail-media">
            <ImageWithFallback src={property.img} alt={property.title} className="pk-detail-media-img" iconFallback={HomeIcon} />
            <span className="pk-prop-tag">{isFeatured(property) ? "Featured" : property.tag}</span>
          </div>

          <div className="flex items-start justify-between gap-4 mt-6">
            <div>
              <h1 className="pk-display text-2xl md:text-4xl font-semibold mb-2">{property.title}</h1>
              <p className="pk-ink-soft flex items-center gap-1">
                <MapPin size={15} /> {property.location}
              </p>
            </div>
            <button
              className="pk-icon-btn flex-shrink-0"
              aria-label={isFavorite ? "Remove from saved" : "Save property"}
              onClick={() => onToggleFavorite(property.id)}
            >
              <Heart size={18} color={isFavorite ? "var(--accent)" : "currentColor"} fill={isFavorite ? "var(--accent)" : "none"} />
            </button>
          </div>

          <div className="pk-detail-facts">
            {property.beds != null && (
              <span><Bed size={16} /> {property.beds} Bedrooms</span>
            )}
            {property.baths != null && (
              <span><Bath size={16} /> {property.baths} Bathrooms</span>
            )}
            <span><Ruler size={16} /> {property.size}</span>
          </div>

          <div className="pk-detail-section">
            <h2 className="pk-display text-xl font-semibold mb-3">About this property</h2>
            <p className="pk-ink-soft leading-relaxed">{property.description}</p>
          </div>

          <div className="pk-detail-section">
            <h2 className="pk-display text-xl font-semibold mb-3">Features</h2>
            <ul className="pk-amenity-list">
              {property.amenities.map((a) => (
                <li key={a}>
                  <Check size={15} className="pk-primary-text" /> {a}
                </li>
              ))}
            </ul>
          </div>

          {similar.length > 0 && (
            <div className="pk-detail-section">
              <h2 className="pk-display text-xl font-semibold mb-4">Similar listings</h2>
              <div className="pk-listing-grid" style={{ marginTop: 0 }}>
                {similar.map((p) => (
                  <PropertyCard
                    key={p.id}
                    property={p}
                    isFavorite={favorites.has(p.id)}
                    onToggleFavorite={onToggleFavorite}
                    onSelect={onSelectProperty}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="pk-detail-sidebar">
          <div className="pk-contact-card">
            <div className="pk-mono pk-primary-text" style={{ fontSize: "1.7rem", fontWeight: 600 }}>
              {property.price}
              <span className="text-sm pk-ink-soft font-normal">{property.period}</span>
            </div>

            <div className="pk-contact-person">
              {contact.avatar ? (
                <ImageWithFallback src={contact.avatar} alt={contact.name} className="pk-agent-photo" iconFallback={Users} />
              ) : (
                <InitialsAvatar name={contact.name} />
              )}
              <div>
                <div className="font-semibold">{contact.name}</div>
                <div className="pk-primary-text text-xs font-semibold">{contact.role}</div>
              </div>
            </div>

            <div className="pk-contact-actions">
              {contact.phone && (
                <a className="pk-btn-primary justify-center" href={`tel:${contact.phone.replace(/\s+/g, "")}`}>
                  <Phone size={15} /> {contact.phone}
                </a>
              )}
              <a className="pk-btn-outline justify-center" href={`mailto:${contact.email}`}>
                <Mail size={15} /> Email
              </a>
            </div>

            <p className="pk-ink-soft text-xs mt-4 text-center leading-relaxed">
              <ShieldCheck size={13} className="inline-block mr-1" style={{ verticalAlign: "-2px" }} />
              Always view a property in person before making any payment.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function AgentScore({ rating, reviews, size = 13 }) {
  if (typeof rating !== "number") return null;
  return (
    <span className="pk-agent-score">
      <Star size={size} className="pk-accent-text" fill="var(--accent-text)" aria-hidden="true" />
      <span className="pk-mono font-semibold">{rating.toFixed(1)}</span>
      <span className="pk-ink-soft">({reviews})</span>
    </span>
  );
}

const AGENT_CONTACT = { email: SITE_CONFIG.contactEmail };

function ConfirmDialog({ open, title, message, confirmLabel = "Delete", danger = true, onConfirm, onCancel }) {
  const dialogRef = useRef(null);
  useDialogFocus(open, dialogRef);
  return (
    <div className={`pk-modal-backdrop ${open ? "pk-open" : ""}`} onClick={onCancel} inert={open ? undefined : ""}>
      <div className="pk-modal" ref={dialogRef} role="alertdialog" aria-modal="true" aria-label={title} tabIndex={-1} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <span className="pk-display text-lg font-semibold">{title}</span>
          <button className="pk-icon-btn" aria-label="Close" onClick={onCancel}>
            <X size={16} />
          </button>
        </div>
        <p className="pk-ink-soft text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button className="pk-btn-outline flex-1 justify-center" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="pk-btn-primary flex-1 justify-center"
            style={danger ? { background: "var(--brick)" } : undefined}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function AgentContactModal({ open, onClose }) {
  return (
    <div className={`pk-modal-backdrop ${open ? "pk-open" : ""}`} onClick={onClose}>
      <div className="pk-modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <span className="pk-display text-lg font-semibold">Join as an agent</span>
          <button className="pk-icon-btn" aria-label="Close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <p className="pk-ink-soft text-sm mb-5 leading-relaxed">
          Email us and our team will walk you through verification and onboarding.
        </p>

        <div className="pk-contact-row">
          <div className="pk-contact-row-icon">
            <Mail size={17} />
          </div>
          <div className="flex-1">
            <div className="text-xs pk-ink-soft font-semibold uppercase tracking-wide">Email</div>
            <div className="font-semibold">{AGENT_CONTACT.email}</div>
          </div>
        </div>
        <a
          className="pk-btn-primary justify-center mt-3"
          href={`mailto:${AGENT_CONTACT.email}?subject=${encodeURIComponent("Joining Hao yangu realtors as an agent")}`}
        >
          <Mail size={15} /> Email us
        </a>

      </div>
    </div>
  );
}

function ProfilePage({ currentUser, onUpdateUser, onChangePhoto, favorites, listings, onToggleFavorite, onSelectProperty, onBackHome, onLogout, onGoAdmin, onOpenModal, securitySlot }) {
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(currentUser?.name || "");

  if (!currentUser) {
    const savedHere = listings.filter((p) => favorites.has(p.id));
    return (
      <section className="mx-auto max-w-7xl px-4 md:px-8 pt-8 md:pt-12 pb-20">
        <p className="pk-mono text-xs uppercase tracking-wide mb-3 pk-breadcrumb">
          <button onClick={onBackHome} className="pk-primary-text font-semibold">Home</button>
          <span className="pk-ink-soft"> / Saved</span>
        </p>
        <h1 className="pk-display text-3xl md:text-5xl font-semibold mb-2">Saved properties</h1>
        <p className="pk-ink-soft text-sm mb-6">
          {savedHere.length} propert{savedHere.length === 1 ? "y" : "ies"} saved on this device
        </p>
        {onOpenModal && (
          <div className="pk-admin-notice mb-6 flex flex-wrap items-center justify-between gap-3">
            <span>Create a free account to keep your saved properties on every device.</span>
            <button className="pk-btn-primary" onClick={() => onOpenModal("signup")}>
              <UserPlus size={15} /> Create account
            </button>
          </div>
        )}
        {savedHere.length === 0 ? (
          <div className="pk-empty-state">
            <Heart size={32} strokeWidth={1.5} className="pk-ink-soft mx-auto mb-4" />
            <h3 className="pk-display text-xl font-semibold mb-2">Nothing saved yet</h3>
            <p className="pk-ink-soft text-sm max-w-sm mx-auto">Tap the heart on any listing to save it here for later.</p>
          </div>
        ) : (
          <div className="pk-listing-grid" style={{ marginTop: 0 }}>
            {savedHere.map((p) => (
              <PropertyCard key={p.id} property={p} isFavorite={true} onToggleFavorite={onToggleFavorite} onSelect={onSelectProperty} />
            ))}
          </div>
        )}
      </section>
    );
  }

  const savedProperties = listings.filter((p) => favorites.has(p.id));

  const handleSaveName = (e) => {
    e.preventDefault();
    // An empty name falls back to the part of the email before the @.
    onUpdateUser({ ...currentUser, name: displayNameFor(currentUser.email, nameDraft) });
    setEditing(false);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-8 pt-8 md:pt-12 pb-20">
      <p className="pk-mono text-xs uppercase tracking-wide mb-3 pk-breadcrumb">
        <button onClick={onBackHome} className="pk-primary-text font-semibold">Home</button>
        <span className="pk-ink-soft"> / Profile</span>
      </p>

      <div className="pk-profile-header">
        <div className="pk-profile-avatar-wrap">
          <Avatar name={currentUser.name} src={currentUser.avatar} size={72} />
          {onChangePhoto && (
            <button type="button" className="pk-profile-avatar-edit" aria-label="Change profile photo" onClick={onChangePhoto}>
              <Camera size={13} />
            </button>
          )}
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <form onSubmit={handleSaveName} className="flex items-center gap-2 flex-wrap">
              <input
                aria-label="Your name"
                className="pk-profile-name-input"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                autoFocus
              />
              <button type="submit" className="pk-btn-primary">Save</button>
              <button
                type="button"
                className="pk-btn-outline"
                onClick={() => {
                  setEditing(false);
                  setNameDraft(currentUser.name);
                }}
              >
                Cancel
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="pk-display text-2xl md:text-3xl font-semibold">{currentUser.name}</h1>
              {currentUser.role === "superadmin" && (
                <span className="pk-status-badge" style={{ "--badge-color": "var(--primary)" }}>Superadmin</span>
              )}
              {currentUser.role === "admin" && (
                <span className="pk-status-badge" style={{ "--badge-color": "var(--accent)" }}>Admin · {currentUser.agency}</span>
              )}
              <button className="pk-icon-btn" aria-label="Edit name" onClick={() => setEditing(true)}>
                <Pencil size={14} />
              </button>
            </div>
          )}
          <p className="pk-ink-soft text-sm mt-1 truncate">{currentUser.email}</p>
        </div>
      </div>

      <div className="pk-profile-actions">
        {(currentUser.role === "superadmin" || currentUser.role === "admin") && (
          <button className="pk-btn-outline" onClick={onGoAdmin}>
            <Shield size={15} /> {currentUser.role === "superadmin" ? "Superadmin dashboard" : "Admin console"}
          </button>
        )}
        <button className="pk-btn-outline" onClick={onLogout}>
          <LogOut size={15} /> Log out
        </button>
        <a
          className="pk-btn-outline"
          href={`mailto:${SITE_CONFIG.contactEmail}?subject=${encodeURIComponent("Delete my account")}&body=${encodeURIComponent("Please delete my account and saved properties. My account email is: " + currentUser.email)}`}
        >
          <Mail size={15} /> Request account deletion
        </a>
      </div>

      {securitySlot}

      <div className="pk-detail-section" style={{ marginTop: 40 }}>
        <h2 className="pk-display text-xl font-semibold mb-1">Saved properties</h2>
        <p className="pk-ink-soft text-sm mb-6">
          {savedProperties.length} propert{savedProperties.length === 1 ? "y" : "ies"} saved
        </p>

        {savedProperties.length === 0 ? (
          <div className="pk-empty-state">
            <Heart size={32} strokeWidth={1.5} className="pk-ink-soft mx-auto mb-4" />
            <h3 className="pk-display text-xl font-semibold mb-2">Nothing saved yet</h3>
            <p className="pk-ink-soft text-sm max-w-sm mx-auto">Tap the heart on any listing to save it here for later.</p>
          </div>
        ) : (
          <div className="pk-listing-grid" style={{ marginTop: 0 }}>
            {savedProperties.map((p) => (
              <PropertyCard key={p.id} property={p} isFavorite={true} onToggleFavorite={onToggleFavorite} onSelect={onSelectProperty} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

const LEGAL_UPDATED = "17 October 2026";

function LegalPage({ title, intro, crumb, onBackHome, children }) {
  return (
    <section className="mx-auto max-w-3xl px-4 md:px-8 pt-8 md:pt-12 pb-20 pk-policy">
      <p className="pk-mono text-xs uppercase tracking-wide mb-3 pk-breadcrumb">
        <button onClick={onBackHome} className="pk-primary-text font-semibold">Home</button>
        <span className="pk-ink-soft"> / {crumb}</span>
      </p>
      <h1 className="pk-display text-3xl md:text-5xl font-semibold mb-3">{title}</h1>
      <p className="pk-ink-soft text-sm mb-6">Last updated {LEGAL_UPDATED}</p>
      {intro && <p className="mb-4">{intro}</p>}
      {children}
    </section>
  );
}

function PrivacyPage({ onBackHome, onOpenTerms }) {
  const mail = SITE_CONFIG.contactEmail;
  const link = (
    <a className="pk-primary-text font-semibold" href={`mailto:${mail}`}>
      {mail}
    </a>
  );
  return (
    <LegalPage
      title="Privacy Policy"
      crumb="Privacy Policy"
      onBackHome={onBackHome}
      intro="Hao yangu realtors runs this website to help people in Nakuru, Kenya find property listed by agents and owners. This policy explains what personal information we collect, why, who we share it with, and the choices and rights you have."
    >
      <h2 className="pk-display text-xl font-semibold">1. What we collect</h2>
      <ul>
        <li><strong>Your account:</strong> your name, your email address and your password, plus the properties you save. We never see your password in readable form. Our sign-in provider keeps it in protected form.</li>
        <li><strong>Agents and staff:</strong> name, email, agency, area covered and photo. We also keep the date and a tick-list of the checks we completed when verifying an agent, and our private notes. We do not store copies of your documents on this website.</li>
        <li><strong>Listings:</strong> the contact name, phone number, email address, photos and descriptions that agents or owners submit. Anyone can see the basic part of a listing (photo, title, location, price and basic facts). The rest, including the contact details, is shown to visitors who have an account.</li>
        <li><strong>Messages:</strong> anything you send us by email.</li>
        <li><strong>Technical information:</strong> your IP address and device details are handled by our hosting and security providers when you visit. We keep anonymous counters, such as how many pages were viewed or searches made, which do not identify you. If error reporting is switched on, it records technical details of a fault.</li>
        <li><strong>Information on your device:</strong> the site stores your sign-in details and saved properties in your browser so they work between visits. We do not use advertising or tracking cookies. Our security provider may set a small cookie to tell people from automated bots.</li>
      </ul>

      <h2 className="pk-display text-xl font-semibold">2. Why we use it</h2>
      <ul>
        <li>To create and run your account and keep your saved properties.</li>
        <li>To show listings and agents, and to review and approve them.</li>
        <li>To reply to your messages and send emails you need, such as confirming your email or resetting your password.</li>
        <li>To keep the site secure and prevent fraud and abuse.</li>
        <li>To understand, in anonymous totals, how the site is used.</li>
        <li>To meet our legal duties.</li>
      </ul>
      <p>
        Our reasons under the Data Protection Act, 2019 are: providing the service you asked for, our legitimate interest in running a safe and trustworthy property site, legal obligations, and your consent where we ask for it. You can withdraw consent at any time.
      </p>

      <h2 className="pk-display text-xl font-semibold">3. Who we share it with</h2>
      <p>We do not sell personal information. We share it only with these groups.</p>
      <ul>
        <li><strong>Service providers that run the site for us:</strong> Supabase (database, sign-in and photo storage), Cloudflare (hosting and security, including a human check when we use it), and Resend (sending our emails). If we switch on error reporting, Sentry receives technical error details. Fonts are loaded from Google Fonts, which receives your IP address when the page loads.</li>
        <li><strong>Visitors:</strong> the basic part of each listing and verified agents' public profiles are visible to everyone. The full description and the contact details that agents and owners choose to publish are shown to visitors who have an account.</li>
        <li><strong>Authorities:</strong> when the law requires it, or to protect people from harm or fraud.</li>
      </ul>

      <h2 className="pk-display text-xl font-semibold">4. Storage outside Kenya</h2>
      <p>
        Our providers run servers outside Kenya, so your information is stored and processed abroad. These providers publish their own security and privacy terms. If you would like to know more about where your information is held, email us at {link}.
      </p>

      <h2 className="pk-display text-xl font-semibold">5. How long we keep it</h2>
      <ul>
        <li>Account information: until you delete your account or ask us to.</li>
        <li>Agent and staff records: while you work with us, and for a reasonable time afterwards to deal with questions or disputes.</li>
        <li>Listings: while they are live, and for a short time afterwards.</li>
        <li>Emails: for as long as we need them to deal with your request.</li>
        <li>Backups: removed as backups are replaced in the normal way.</li>
        <li>Anonymous counters: they cannot identify you, so we may keep them.</li>
      </ul>

      <h2 className="pk-display text-xl font-semibold">6. How we protect it</h2>
      <p>
        The site uses encrypted connections. Staff accounts need a confirmed email address, and access to data is limited by rules in our database so people see only what they should. No system is perfectly secure. If you find a problem, please email {link}.
      </p>

      <h2 className="pk-display text-xl font-semibold">7. Your rights</h2>
      <p>Under the Data Protection Act, 2019 you can:</p>
      <ul>
        <li>be told how your personal information is used;</li>
        <li>ask for a copy of what we hold about you;</li>
        <li>ask us to correct anything that is wrong or out of date;</li>
        <li>ask us to delete your information;</li>
        <li>object to certain uses, and withdraw consent you have given.</li>
      </ul>
      <p>
        To use any of these, email {link}. We may need to confirm it is really you, and we aim to reply within 30 days. To delete your account, email us from the address on the account with the subject "Delete my account". We will delete the account and your saved properties. We may keep limited records where the law requires it.
      </p>
      <p>
        If you are not happy with how we handle your information, you have the right to complain to the Office of the Data Protection Commissioner (odpc.go.ke).
      </p>

      <h2 className="pk-display text-xl font-semibold">8. Children</h2>
      <p>
        This site is for people aged 18 and over. We do not knowingly collect information from children. If you think a child has given us information, email us and we will delete it.
      </p>

      <h2 className="pk-display text-xl font-semibold">9. Other websites</h2>
      <p>
        We link to our social media pages and to other sites. They have their own privacy policies, and we are not responsible for them.
      </p>

      <h2 className="pk-display text-xl font-semibold">10. Changes and contact</h2>
      <p>
        We may update this policy. The date at the top shows the latest version, and we will tell you on the site or by email if a change is important. Questions: {link}. See also our{" "}
        <button className="pk-primary-text font-semibold underline" onClick={onOpenTerms}>Terms of Use</button>.
      </p>
    </LegalPage>
  );
}

function TermsPage({ onBackHome, onOpenPrivacy, onOpenVerification, onOpenAdvertise }) {
  const mail = SITE_CONFIG.contactEmail;
  const link = (
    <a className="pk-primary-text font-semibold" href={`mailto:${mail}`}>
      {mail}
    </a>
  );
  return (
    <LegalPage
      title="Terms of Use"
      crumb="Terms of Use"
      onBackHome={onBackHome}
      intro="These terms apply when you use the Hao yangu realtors website. By using the site or creating an account, you agree to them. If you do not agree, please do not use the site."
    >
      <h2 className="pk-display text-xl font-semibold">1. What we do</h2>
      <p>
        We publish property listings from agents and owners and help people contact them. Unless a listing clearly says Hao yangu realtors is the agent, we are not the seller, landlord or agent for the properties shown, and we are not part of any deal between you and an agent or owner.
      </p>

      <h2 className="pk-display text-xl font-semibold">2. Who can use the site</h2>
      <p>You must be 18 or over and able to enter into a binding agreement.</p>

      <h2 className="pk-display text-xl font-semibold">3. Your account</h2>
      <ul>
        <li>Give accurate information and keep it up to date.</li>
        <li>Keep your password private. You are responsible for what happens on your account.</li>
        <li>Tell us straight away if you think someone else has used your account.</li>
        <li>Some listing and agent details are shown only to people with an account.</li>
        <li>You may delete your account at any time by emailing us (see our Privacy Policy).</li>
      </ul>

      <h2 className="pk-display text-xl font-semibold">4. Rules for agents and owners who list properties</h2>
      <ul>
        <li>Only advertise properties you are authorised to advertise.</li>
        <li>Keep every detail accurate, current and not misleading. This includes price, location, size, photos and contact details.</li>
        <li>Only upload photos and text you own or have permission to use. Photos must show the actual property.</li>
        <li>Do not include unlawful, discriminatory or offensive content.</li>
        <li>Never ask anyone for money just to view a property.</li>
        <li>Remove or update a listing as soon as it is sold or let.</li>
        <li>Follow the laws that apply to you, including any registration that applies to estate agents.</li>
      </ul>
      <p>
        We review listings before they go live, but we may refuse, change or remove any listing or account at our discretion, for example if it is inaccurate, misleading or breaks these terms.
      </p>

      <h2 className="pk-display text-xl font-semibold">5. Featured listings</h2>
      <p>
        Featured listings are paid promotions, always labelled Featured. Price, payment and refund terms are agreed in writing when you book, and a listing is featured once payment is confirmed. Featuring does not mean we have checked the property more closely, and it does not guarantee any result. See{" "}
        <button className="pk-primary-text font-semibold underline" onClick={onOpenAdvertise}>Promote your listing</button>.
      </p>

      <h2 className="pk-display text-xl font-semibold">6. Verified agents</h2>
      <p>
        A Verified badge means we completed the checks described on our{" "}
        <button className="pk-primary-text font-semibold underline" onClick={onOpenVerification}>What Verified means</button> page. It is not a guarantee about any agent, property or deal.
      </p>

      <h2 className="pk-display text-xl font-semibold">7. Staying safe is your responsibility</h2>
      <ul>
        <li>View a property in person before you pay anything.</li>
        <li>Check ownership documents with a lawyer or the relevant land registry before paying a deposit.</li>
        <li>Pay only by traceable, documented methods, and never to someone you have not met.</li>
      </ul>
      <p>
        We do not handle payments for property deals, and we are not responsible for what you agree with an agent or owner. If something looks wrong, email us at {link}.
      </p>

      <h2 className="pk-display text-xl font-semibold">8. What you must not do</h2>
      <ul>
        <li>Break the law, commit fraud or pretend to be someone else.</li>
        <li>Harass or threaten other users.</li>
        <li>Try to break into the site, bypass its security or overload it.</li>
        <li>Copy large amounts of listings or data automatically without our written permission.</li>
        <li>Upload viruses or other harmful files.</li>
      </ul>

      <h2 className="pk-display text-xl font-semibold">9. Content you submit</h2>
      <p>
        You keep ownership of what you submit. You give us a free, non-exclusive right to store, display and promote it on our website and our social media pages while it is listed with us, and as needed to run the site.
      </p>

      <h2 className="pk-display text-xl font-semibold">10. Our content</h2>
      <p>
        The site's design, name, logo and text belong to Hao yangu realtors or its licensors. Please do not copy or reuse them without our permission.
      </p>

      <h2 className="pk-display text-xl font-semibold">11. Availability</h2>
      <p>
        We try to keep the site running, but we cannot promise it will always be available or free of errors. We may change, pause or stop parts of it.
      </p>

      <h2 className="pk-display text-xl font-semibold">12. Limits on our responsibility</h2>
      <p>
        To the extent the law of Kenya allows, we are not responsible for losses that come from your dealings with agents or owners, from listings or information supplied by others, or from the site being unavailable. Nothing in these terms limits any responsibility that cannot lawfully be limited.
      </p>

      <h2 className="pk-display text-xl font-semibold">13. Suspending or ending access</h2>
      <p>
        We may suspend or remove an account or listing if these terms are broken, or to protect other people. You can stop using the site at any time.
      </p>

      <h2 className="pk-display text-xl font-semibold">14. Changes, law and contact</h2>
      <p>
        We may update these terms. The date at the top shows the latest version, and using the site after a change means you accept it. These terms are governed by the laws of Kenya, and the courts of Kenya can hear any dispute. Questions: {link}. See also our{" "}
        <button className="pk-primary-text font-semibold underline" onClick={onOpenPrivacy}>Privacy Policy</button>.
      </p>
    </LegalPage>
  );
}

function AdvertisePage({ onBackHome, onBrowse }) {
  const subject = encodeURIComponent("Feature my listing on " + SITE_CONFIG.name);
  return (
    <section className="mx-auto max-w-3xl px-4 md:px-8 pt-8 md:pt-12 pb-20 pk-policy">
      <p className="pk-mono text-xs uppercase tracking-wide mb-3 pk-breadcrumb">
        <button onClick={onBackHome} className="pk-primary-text font-semibold">Home</button>
        <span className="pk-ink-soft"> / Promote your listing</span>
      </p>
      <h1 className="pk-display text-3xl md:text-5xl font-semibold mb-3">Promote your listing</h1>
      <p className="pk-ink-soft mb-6">Featured listings are shown first, with a Featured label, so more visitors see them.</p>

      <h2 className="pk-display text-xl font-semibold">What you get</h2>
      <ul>
        <li>Your listing appears first in the Featured and latest section on the home page.</li>
        <li>It is placed above other listings on the listings pages.</li>
        <li>It carries a clear Featured label, so visitors know it is promoted.</li>
        <li>It ends by itself on the date you choose, or stays until you ask us to remove it.</li>
      </ul>

      <h2 className="pk-display text-xl font-semibold">How it works</h2>
      <ol>
        <li>Email us the link to your listing and how long you want it featured (7, 14 or 30 days).</li>
        <li>We reply with the price and how to pay. Your listing is featured once payment is confirmed.</li>
        <li>You get a confirmation with the end date.</li>
      </ol>

      <h2 className="pk-display text-xl font-semibold">Price</h2>
      <p>{SITE_FEATURED_PRICING || "Contact us for current rates."}</p>

      <h2 className="pk-display text-xl font-semibold">Fair play</h2>
      <p>
        Featured listings go through the same review as every other listing, and are always labelled. Featuring a listing does not mean we have checked the property, its price or its owner beyond that review.
      </p>

      <div className="flex flex-wrap gap-3 mt-8">
        <a className="pk-btn-primary" href={`mailto:${SITE_CONFIG.contactEmail}?subject=${subject}`}>
          <Mail size={15} /> Email us to feature a listing
        </a>
        <button className="pk-btn-outline" onClick={onBrowse}>
          Browse listings
        </button>
      </div>
    </section>
  );
}

function VerificationPage({ onBackHome, onOpenAgents }) {
  const subject = encodeURIComponent("Concern about a listing or agent on " + SITE_CONFIG.name);
  return (
    <section className="mx-auto max-w-3xl px-4 md:px-8 pt-8 md:pt-12 pb-20 pk-policy">
      <p className="pk-mono text-xs uppercase tracking-wide mb-3 pk-breadcrumb">
        <button onClick={onBackHome} className="pk-primary-text font-semibold">Home</button>
        <span className="pk-ink-soft"> / What Verified means</span>
      </p>
      <h1 className="pk-display text-3xl md:text-5xl font-semibold mb-3">What Verified means</h1>
      <p className="pk-ink-soft mb-6">
        A Verified badge means our team checked the agent against the list below before approving them. It is not a guarantee about any property or deal.
      </p>

      <h2 className="pk-display text-xl font-semibold">What we check</h2>
      <ol>
        {VERIFICATION_CRITERIA.map((k) => (
          <li key={k.id}>
            <strong>{k.label}.</strong> {k.detail}
          </li>
        ))}
      </ol>
      <p>Each agent's card shows the date of their last check. We re-check agents at least every {Math.round(VERIFICATION_RECHECK_DAYS / 365) === 1 ? "12 months" : VERIFICATION_RECHECK_DAYS + " days"}, and we remove the badge if an agent no longer meets these checks.</p>

      <h2 className="pk-display text-xl font-semibold">About our listings</h2>
      <p>
        Every listing is reviewed by our team before it goes live. We check that it is complete and looks genuine. We do not check title deeds or ownership documents.
      </p>

      <h2 className="pk-display text-xl font-semibold">What Verified does not mean</h2>
      <ul>
        <li>It is not a guarantee of a property's ownership, condition or price.</li>
        <li>It is not legal, financial or professional advice.</li>
        <li>It does not replace your own checks.</li>
      </ul>

      <h2 className="pk-display text-xl font-semibold">Stay safe</h2>
      <ul>
        <li>View a property in person before you pay anything.</li>
        <li>Check ownership documents with a lawyer or the relevant land registry before paying a deposit.</li>
        <li>Pay only by traceable, documented methods, and never to someone you have not met.</li>
        <li>Be careful if you are asked to pay just to view a property.</li>
      </ul>

      <h2 className="pk-display text-xl font-semibold">Report a problem</h2>
      <p>
        If something looks wrong with a listing or an agent, email us at{" "}
        <a className="pk-primary-text font-semibold" href={`mailto:${SITE_CONFIG.contactEmail}?subject=${subject}`}>{SITE_CONFIG.contactEmail}</a>. We look into every report.
      </p>
      <p className="pk-ink-soft text-sm">Last updated {VERIFICATION_UPDATED}.</p>

      <div className="flex flex-wrap gap-3 mt-8">
        <button className="pk-btn-primary" onClick={onOpenAgents}>
          <Users size={15} /> See verified agents
        </button>
        <button className="pk-btn-outline" onClick={onBackHome}>
          Back to home
        </button>
      </div>
    </section>
  );
}

function AgentsPage({ agents, onBackHome, onOpenModal, onOpenVerification, locked = false, onRequireAccount }) {
  const visible = agents.filter((a) => a.status === "verified");
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-8 pt-8 md:pt-12 pb-20">
      <p className="pk-mono text-xs uppercase tracking-wide mb-3 pk-breadcrumb">
        <button onClick={onBackHome} className="pk-primary-text font-semibold">Home</button>
        <span className="pk-ink-soft"> / Agents</span>
      </p>
      <h1 className="pk-display text-3xl md:text-5xl font-semibold mb-2">Our agents</h1>
      <p className="pk-ink-soft">
        {visible.length} verified agent{visible.length === 1 ? "" : "s"}.{" "}
        <button className="pk-primary-text font-semibold underline" onClick={onOpenVerification}>
          What does Verified mean?
        </button>
      </p>

      {visible.length === 0 && (
        <div className="pk-empty-state">
          <Users size={32} strokeWidth={1.5} className="pk-ink-soft mx-auto mb-4" />
          <h3 className="pk-display text-xl font-semibold mb-2">No verified agents listed yet</h3>
          <p className="pk-ink-soft text-sm max-w-sm mx-auto">We check every agent before they appear here. Would you like to list with us?</p>
          <button className="pk-btn-primary" style={{ margin: "16px auto 0" }} onClick={() => setContactOpen(true)}>
            Join as an agent
          </button>
        </div>
      )}

      <div className="pk-agents-grid">
        {visible.map((a) => (
          <div
            key={a.id}
            className="pk-card p-6 flex flex-col items-center text-center gap-2"
            {...(locked
              ? {
                  role: "button",
                  tabIndex: 0,
                  style: { cursor: "pointer" },
                  onClick: onRequireAccount,
                  onKeyDown: (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onRequireAccount();
                    }
                  },
                }
              : {})}
          >
            <ImageWithFallback src={a.img} alt={a.name} className="pk-agent-photo-lg" iconFallback={Users} />
            <h3 className="font-semibold mt-2 flex items-center gap-1">
              {a.name}
              {a.status === "verified" && <VerifiedBadge size={15} />}
            </h3>
            <p className="pk-primary-text text-xs font-semibold">{a.focus}</p>
            <p className="pk-ink-soft text-xs flex items-center gap-1">
              <MapPin size={12} /> {a.area}
            </p>
            {a.verifiedAt && <p className="pk-ink-soft text-xs">Verified {formatShortDate(a.verifiedAt)}</p>}
            <AgentScore rating={a.rating} reviews={a.reviews} />
            {locked ? (
              <button
                className="pk-btn-outline mt-3"
                onClick={(e) => {
                  e.stopPropagation();
                  onRequireAccount();
                }}
              >
                <Mail size={14} /> Enquire
              </button>
            ) : (
              <a
                className="pk-btn-outline mt-3"
                href={`mailto:${SITE_CONFIG.contactEmail}?subject=${encodeURIComponent("Enquiry about agent " + a.name)}`}
              >
                <Mail size={14} /> Enquire
              </a>
            )}
          </div>
        ))}
      </div>

      <p className="pk-ink-soft text-sm text-center mt-14">
        Selling homes or land yourself?{" "}
        <button className="pk-primary-text font-semibold" onClick={() => setContactOpen(true)}>
          Join as an agent
        </button>
      </p>

      <AgentContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </section>
  );
}

function ListingsPage({
  category,
  onCategoryChange,
  onBackHome,
  location,
  setLocation,
  secondary,
  setSecondary,
  secondaryLabel,
  secondaryOptions,
  budget,
  setBudget,
  budgetOptions,
  sortBy,
  setSortBy,
  results,
  favorites,
  onToggleFavorite,
  onSelectProperty,
  onClearFilters,
}) {
  const meta = LISTING_META[category];

  const [visibleCount, setVisibleCount] = useState(12);
  useEffect(() => {
    setVisibleCount(12);
  }, [category]);

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-8 pt-8 md:pt-12 pb-20">
      <p className="pk-mono text-xs uppercase tracking-wide mb-3 pk-breadcrumb">
        <button onClick={onBackHome} className="pk-primary-text font-semibold">Home</button>
        <span className="pk-ink-soft"> / {meta.label}</span>
      </p>
      <h1 className="pk-display text-3xl md:text-5xl font-semibold mb-2">{meta.title}</h1>
      <p className="pk-ink-soft">
        {results.length} propert{results.length === 1 ? "y" : "ies"} found · Nakuru
      </p>

      <div className="pk-chip-row mt-7">
        {LISTING_FILTERS.map((f) => {
          const FIcon = f.icon;
          return (
            <button
              key={f.key}
              className={`pk-chip ${category === f.key ? "pk-chip-active" : ""}`}
              onClick={() => onCategoryChange(f.key)}
            >
              <FIcon size={15} /> {f.label}
            </button>
          );
        })}
      </div>

      <div className="pk-filter-card">
        <div className="pk-field">
          <label htmlFor="pk-listing-location">Location</label>
          <div className="flex items-center gap-2">
            <MapPin size={16} className="pk-ink-soft" />
            <input
              aria-label="Search by location" id="pk-listing-location"
              type="text"
              placeholder="Try Milimani, Section 58, Lanet…"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>
        {category !== "all" && (
          <CustomSelect id="pk-listing-secondary" label={secondaryLabel} value={secondary} options={secondaryOptions} onChange={setSecondary} />
        )}
        <CustomSelect id="pk-listing-budget" label="Budget" value={budget} options={budgetOptions} onChange={setBudget} />
        <CustomSelect id="pk-listing-sort" label="Sort by" value={sortBy} options={SORT_OPTIONS} onChange={setSortBy} />
        <button className="pk-btn-outline justify-center" onClick={onClearFilters}>
          <X size={15} /> Clear filters
        </button>
      </div>

      {results.length === 0 ? (
        <div className="pk-empty-state">
          <Search size={32} strokeWidth={1.5} className="pk-ink-soft mx-auto mb-4" />
          <h3 className="pk-display text-xl font-semibold mb-2">No properties match yet</h3>
          <p className="pk-ink-soft text-sm max-w-sm mx-auto mb-5">
            Try widening your budget or clearing a filter — new listings are added to Hao yangu realtors every day.
          </p>
          <button className="pk-btn-primary" style={{ margin: "0 auto" }} onClick={onClearFilters}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="pk-listing-grid">
          {results.slice(0, visibleCount).map((p) => (
            <PropertyCard key={p.id} property={p} isFavorite={favorites.has(p.id)} onToggleFavorite={onToggleFavorite} onSelect={onSelectProperty} />
          ))}
        </div>
      )}
      {results.length > visibleCount && (
        <div className="text-center mt-8">
          <p className="pk-ink-soft text-sm mb-3">
            Showing {visibleCount} of {results.length}
          </p>
          <button className="pk-btn-outline" style={{ margin: "0 auto" }} onClick={() => setVisibleCount((n) => n + 12)}>
            Show more
          </button>
        </div>
      )}
    </section>
  );
}

const TOAST_ICONS = { success: Check, warning: Pause, danger: Ban };

function AdminToastStack({ toasts, onDismiss }) {
  return (
    <div className="pk-toast-stack">
      {toasts.map((t) => {
        const ToastIcon = TOAST_ICONS[t.type] || Check;
        return (
          <div key={t.id} className={`pk-toast pk-toast-${t.type}`}>
            {t.type === "success" && (
              <span className="pk-toast-sparkles" aria-hidden="true">
                <span style={{ "--dx": "18px", "--dy": "-10px" }} />
                <span style={{ "--dx": "-16px", "--dy": "-14px" }} />
                <span style={{ "--dx": "10px", "--dy": "16px" }} />
                <span style={{ "--dx": "-14px", "--dy": "12px" }} />
                <span style={{ "--dx": "0px", "--dy": "-20px" }} />
              </span>
            )}
            <span className="pk-toast-icon">
              <ToastIcon size={14} />
            </span>
            <span className="pk-toast-message">{t.message}</span>
            <button className="pk-toast-close" onClick={() => onDismiss(t.id)} aria-label="Dismiss">
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

let turnstilePromise = null;
function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!turnstilePromise) {
    turnstilePromise = new Promise((resolve, reject) => {
      const el = document.createElement("script");
      el.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      el.async = true;
      el.defer = true;
      el.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("Security check missing")));
      el.onerror = () => {
        turnstilePromise = null;
        reject(new Error("Security check failed to load"));
      };
      document.head.appendChild(el);
    });
  }
  return turnstilePromise;
}

// Cloudflare's "are you human" check. Renders nothing unless a Turnstile site key is configured.
function CaptchaBox({ onToken, resetSignal }) {
  const holder = useRef(null);
  const widgetId = useRef(null);
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return undefined;
    let cancelled = false;
    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !holder.current || widgetId.current !== null) return;
        widgetId.current = turnstile.render(holder.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token) => onToken(token),
          "expired-callback": () => onToken(""),
          "error-callback": () => onToken(""),
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (widgetId.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch (e) {
          /* ignore */
        }
      }
      widgetId.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (widgetId.current !== null && window.turnstile) {
      try {
        window.turnstile.reset(widgetId.current);
      } catch (e) {
        /* ignore */
      }
    }
  }, [resetSignal]);
  if (!TURNSTILE_SITE_KEY) return null;
  return <div ref={holder} style={{ minHeight: 65 }} />;
}

// Two-step login for staff: an authenticator app makes a new 6-digit code every 30 seconds.
function MfaSetup({ onDone }) {
  const [step, setStep] = useState("start");
  const [info, setInfo] = useState(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const begin = async () => {
    setBusy(true);
    setError("");
    try {
      const session = await getValidSession();
      if (!session) throw Object.assign(new Error("Not signed in"), { status: 401 });
      const user = await authApi.getUser(session.access_token);
      const stale = ((user && user.factors) || []).filter((f) => f.factor_type === "totp" && f.status !== "verified");
      for (const f of stale) await authApi.mfaRemove(session.access_token, f.id);
      const factor = await authApi.mfaEnroll(session.access_token);
      setInfo({
        id: factor.id,
        secret: factor.totp && factor.totp.secret,
        uri: factor.totp && factor.totp.uri,
        qr: factor.totp && factor.totp.qr_code,
      });
      setStep("scan");
    } catch (err) {
      setError("We couldn't start the setup. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const confirm = async (e) => {
    e.preventDefault();
    if (busy || !info) return;
    setBusy(true);
    setError("");
    try {
      const session = await getValidSession();
      if (!session) throw Object.assign(new Error("Not signed in"), { status: 401 });
      const challenge = await authApi.mfaChallenge(session.access_token, info.id);
      const upgraded = await authApi.mfaVerify(session.access_token, info.id, challenge.id, code.trim());
      onDone(upgraded);
    } catch (err) {
      setError(friendlyAuthError(err, "mfa"));
    } finally {
      setBusy(false);
    }
  };

  if (step === "start") {
    return (
      <div className="flex flex-col gap-3">
        <p className="pk-ink-soft text-sm">
          Two-step login asks for a 6-digit code from an app on your phone each time you sign in, so a stolen password alone is not enough.
        </p>
        {error && <p className="pk-admin-error" role="alert">{error}</p>}
        <button className="pk-btn-primary justify-center" onClick={begin} disabled={busy}>
          <Shield size={15} /> {busy ? "Please wait…" : "Set up two-step login"}
        </button>
      </div>
    );
  }
  return (
    <form onSubmit={confirm} className="flex flex-col gap-3">
      <ol className="pk-ink-soft text-sm" style={{ paddingLeft: 18, listStyle: "decimal" }}>
        <li>Open an authenticator app such as Google Authenticator or Microsoft Authenticator.</li>
        <li>
          Add a new account. On this phone, tap{" "}
          {info && info.uri ? (
            <a href={info.uri} className="pk-primary-text font-semibold">open in authenticator app</a>
          ) : (
            "the link"
          )}
          , or scan the picture, or type this key:
        </li>
      </ol>
      {info && info.secret && (
        <code style={{ wordBreak: "break-all", userSelect: "all", padding: "8px 10px", borderRadius: 8, background: "var(--surface-2)" }}>{info.secret}</code>
      )}
      {info && info.qr && <img src={info.qr} alt="Scan this with your authenticator app" style={{ width: 150, height: 150, background: "#fff", borderRadius: 8, padding: 6 }} />}
      <label className="text-sm font-medium">
        Then enter the 6-digit code
        <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="123456" value={code} onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))} />
      </label>
      {error && <p className="pk-admin-error" role="alert">{error}</p>}
      <button type="submit" className="pk-btn-primary justify-center" disabled={busy || code.length < 6}>
        {busy ? "Checking…" : "Turn on two-step login"}
      </button>
    </form>
  );
}

function MfaCard({ enabled, onDone }) {
  return (
    <div className="pk-detail-section" style={{ marginTop: 28 }}>
      <h2 className="pk-display text-xl font-semibold mb-2">Two-step login</h2>
      {enabled ? (
        <p className="pk-ink-soft text-sm">On. You will be asked for a code from your authenticator app each time you sign in as staff.</p>
      ) : (
        <MfaSetup onDone={onDone} />
      )}
    </div>
  );
}

function RemoteStaffGate({ account, staffState, onLogin, onVerifyCode, onMfaDone, onLogout, onExit }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (TURNSTILE_SITE_KEY && !captchaToken) {
      setError("Please complete the security check.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onLogin(email.trim().toLowerCase(), password, captchaToken);
    } catch (err) {
      setError(friendlyAuthError(err, "login"));
    } finally {
      setBusy(false);
      if (TURNSTILE_SITE_KEY) {
        setCaptchaToken("");
        setCaptchaReset((n) => n + 1);
      }
    }
  };

  const handleCode = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await onVerifyCode(code.trim());
      setCode("");
    } catch (err) {
      setError(friendlyAuthError(err, "mfa"));
    } finally {
      setBusy(false);
    }
  };

  let body;
  if (account && staffState === "none") {
    body = (
      <div className="flex flex-col gap-4">
        <p className="pk-ink-soft text-sm">
          You're signed in as <strong>{account.email}</strong>, but this account doesn't have staff access. Ask the site owner to add your email, then sign in again.
        </p>
        <button className="pk-btn-outline justify-center" onClick={onLogout}>
          <LogOut size={15} /> Log out
        </button>
      </div>
    );
  } else if (account && staffState === "mfa-code") {
    body = (
      <form onSubmit={handleCode} className="flex flex-col gap-4">
        <p className="pk-ink-soft text-sm">Enter the 6-digit code from your authenticator app.</p>
        <label>
          Code
          <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} autoFocus placeholder="123456" value={code} onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))} />
        </label>
        {error && <p className="pk-admin-error" role="alert">{error}</p>}
        <button type="submit" className="pk-btn-primary justify-center" disabled={busy || code.length < 6}>
          {busy ? "Checking…" : "Verify"}
        </button>
        <button type="button" className="pk-btn-outline justify-center" onClick={onLogout}>
          <LogOut size={15} /> Use a different account
        </button>
      </form>
    );
  } else if (account && staffState === "mfa-enrol") {
    body = (
      <div className="flex flex-col gap-4">
        <p className="pk-ink-soft text-sm">Staff accounts must use two-step login. Set it up once to continue.</p>
        <MfaSetup onDone={onMfaDone} />
        <button type="button" className="pk-btn-outline justify-center" onClick={onLogout}>
          <LogOut size={15} /> Log out
        </button>
      </div>
    );
  } else if (account) {
    body = <p className="pk-ink-soft text-sm">Checking your access…</p>;
  } else {
    body = (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label>
          Email
          <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
        </label>
        <label>
          Password
          <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </label>
        <CaptchaBox onToken={setCaptchaToken} resetSignal={captchaReset} />
        {error && <p className="pk-admin-error" role="alert">{error}</p>}
        <button type="submit" className="pk-btn-primary justify-center" disabled={busy}>
          {busy ? "Checking…" : "Sign in"}
        </button>
      </form>
    );
  }

  return (
    <div className="pk-admin-gate">
      <div className="pk-admin-gate-card">
        <div className="flex justify-center mb-4">
          <LogoMark size={44} />
        </div>
        <div className="pk-admin-gate-icon">
          <Lock size={22} />
        </div>
        <h1 className="pk-display text-2xl font-semibold mb-1">Staff sign in</h1>
        <p className="pk-ink-soft text-sm mb-6">For authorised staff only.</p>
        {body}
        <button className="pk-admin-gate-back" onClick={onExit}>
          ← Back to site
        </button>
      </div>
    </div>
  );
}

function StaffGate({ admins, onAuthenticate, onExit }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(readLockout());

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (Date.now() < lockedUntil) {
      setError("Too many attempts. Please wait a few minutes and try again.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const normalized = email.trim().toLowerCase();
      let user = null;
      const emailHash = await sha256Hex(SUPERADMIN_CONFIG.salt + normalized);
      if (SUPERADMIN_CONFIG.emailHashes.includes(emailHash)) {
        const attempt = await pbkdf2Hex(password, SUPERADMIN_CONFIG.salt, SUPERADMIN_CONFIG.iterations);
        if (attempt === SUPERADMIN_CONFIG.passHash) {
          user = { name: displayNameFor(normalized), email: normalized, isSuperAdmin: true, role: "superadmin" };
        }
      } else {
        const admin = admins.find((a) => a.email.toLowerCase() === normalized);
        // Always do the same amount of work so response time doesn't reveal which emails exist.
        const attempt = await pbkdf2Hex(password, admin?.passSalt || SUPERADMIN_CONFIG.salt, ADMIN_HASH_ITERATIONS);
        if (admin && admin.status === "active" && admin.passHash && attempt === admin.passHash) {
          user = { name: displayNameFor(normalized, admin.name), email: normalized, isSuperAdmin: false, role: "admin", agency: admin.agency, adminId: admin.id };
        }
      }
      if (user) {
        onAuthenticate(user);
        return;
      }
      const next = attempts + 1;
      if (next >= MAX_LOGIN_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_MS;
        setLockedUntil(until);
        writeLockout(until);
        setAttempts(0);
        setError("Too many attempts. Please wait a few minutes and try again.");
      } else {
        setAttempts(next);
        setError("Incorrect email or password.");
      }
    } catch (err) {
      setError("Sign-in isn't available in this browser. Please use an up-to-date browser over HTTPS.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pk-admin-gate">
      <div className="pk-admin-gate-card">
        <div className="flex justify-center mb-4">
          <LogoMark size={44} />
        </div>
        <div className="pk-admin-gate-icon">
          <Lock size={22} />
        </div>
        <h1 className="pk-display text-2xl font-semibold mb-1">Staff sign in</h1>
        <p className="pk-ink-soft text-sm mb-6">For authorised staff only.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label>
            Email
            <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
          </label>
          <label>
            Password
            <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </label>
          {error && <p className="pk-admin-error">{error}</p>}
          <button type="submit" className="pk-btn-primary justify-center" disabled={busy}>
            {busy ? "Checking…" : "Sign in"}
          </button>
        </form>
        <button className="pk-admin-gate-back" onClick={onExit}>
          ← Back to site
        </button>
      </div>
    </div>
  );
}

function AdminOverview({ listings, agents, admins, stats }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const todayLabel = new Date().toLocaleDateString("en-KE", { weekday: "long", month: "long", day: "numeric" });

  const categoryData = [
    { name: "Buy", views: stats?.buyViews || 0 },
    { name: "Rent", views: stats?.rentViews || 0 },
    { name: "Commercial", views: stats?.commercialViews || 0 },
    { name: "Land", views: stats?.landViews || 0 },
  ];

  const statCards = [
    { label: "Live listings", value: listings.filter((l) => l.status === "approved").length },
    { label: "Pending review", value: listings.filter((l) => l.status === "pending").length },
    { label: "Active agents", value: agents.filter((a) => a.status !== "banned").length },
    { label: "Admin accounts", value: admins.length },
    { label: "Page views", value: stats?.pageViews || 0 },
    { label: "Searches run", value: stats?.searches || 0 },
    { label: "Property views", value: stats?.propertyDetailViews || 0 },
    { label: "Listings saved", value: stats?.favorites || 0 },
  ];

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
        <h2 className="pk-display text-2xl font-semibold flex items-center gap-2">
          {greeting}, Superadmin <Sparkles size={17} className="pk-accent-text" />
        </h2>
        <span className="pk-live-badge">
          <span className="pk-live-dot" /> Live
        </span>
      </div>
      <p className="pk-ink-soft text-sm mb-2">{todayLabel} · counts reflect real visits to this site.</p>

      <div className="pk-admin-stat-grid">
        {statCards.map((s) => (
          <div key={s.label} className="pk-admin-stat-card">
            <AdminStatCounter value={s.value} />
            <div className="pk-ink-soft text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="pk-admin-chart-card">
        <h3 className="font-semibold mb-4">Category interest (page views)</h3>
        <Suspense fallback={<p className="pk-ink-soft text-sm">Loading chart…</p>}>
          <AdminChart data={categoryData} />
        </Suspense>
      </div>

      <p className="pk-ink-soft text-xs mt-4">
        Counts are aggregated from real visits to this site and refresh every few seconds while this tab is open.
      </p>
    </div>
  );
}

const EMPTY_LISTING_FORM = {
  title: "",
  tag: "Buy",
  location: "",
  priceValue: "",
  period: "",
  beds: "",
  baths: "",
  size: "",
  spaceType: "Office",
  acres: "",
  img: "",
  description: "",
  selectedAmenities: [],
  customAmenities: "",
  contactName: "",
  contactRole: "Property Owner",
  contactPhone: "",
  contactEmail: "",
};

const LOCATION_PRESETS = [
  "Milimani, Nakuru",
  "Section 58, Nakuru",
  "Kenyatta Avenue, Nakuru",
  "Lanet, Nakuru",
  "London, Nakuru",
  "Kiamunyi, Nakuru",
  "Njoro, Nakuru",
];

const AMENITY_PRESETS = {
  Buy: ["Gated compound", "Parking", "Backup water", "Backup generator", "CCTV surveillance", "DSQ", "Borehole water", "Fitted kitchen", "Garden"],
  Rent: ["Gated compound", "Parking", "Backup water", "24-hour security", "CCTV surveillance", "Swimming pool", "DSQ", "Serviced block"],
  Commercial: ["Parking", "Backup generator", "Fibre-ready", "CCTV surveillance", "Boardroom", "Loading dock", "Reception area", "High foot traffic"],
  Land: ["Title deed ready", "Fenced", "Access road", "Piped water", "Electricity at boundary", "Ready to build"],
};

const DEFAULT_PERIOD_BY_TAG = { Buy: "", Rent: "/mo", Commercial: "/mo", Land: "" };

function buildListingFromForm(form, nextId) {
  const priceValue = Number(form.priceValue) || 0;
  return {
    id: nextId,
    title: form.title.trim(),
    location: form.location.trim(),
    price: formatPrice(priceValue),
    priceValue,
    period: form.period,
    tag: form.tag,
    beds: form.tag === "Buy" || form.tag === "Rent" ? Number(form.beds) || 0 : null,
    baths: form.tag !== "Land" ? Number(form.baths) || 0 : null,
    size: form.tag === "Land" ? `${form.acres || 0} acre${Number(form.acres) === 1 ? "" : "s"}` : form.size.trim() || "—",
    acres: form.tag === "Land" ? Number(form.acres) || 0 : undefined,
    spaceType: form.tag === "Commercial" ? form.spaceType : undefined,
    img: form.img.trim(),
    featured: false,
    description: form.description.trim() || "No description provided yet.",
    amenities: [...form.selectedAmenities, ...form.customAmenities.split(",").map((a) => a.trim()).filter(Boolean)],
    contact: {
      name: form.contactName.trim() || "Hao yangu realtors Team",
      role: form.contactRole,
      phone: form.contactPhone.trim(),
      email: form.contactEmail.trim() || SITE_CONFIG.contactEmail,
    },
  };
}

const BILLING_LABELS = { "": "One-off (sale price)", "/mo": "Monthly (rent/lease)" };
const BILLING_VALUE_BY_LABEL = { "One-off (sale price)": "", "Monthly (rent/lease)": "/mo" };

function ListingForm({ onSubmit, submitLabel = "Publish listing" }) {
  const [form, setForm] = useState(EMPTY_LISTING_FORM);
  const [formError, setFormError] = useState("");
  const [photoBusy, setPhotoBusy] = useState(false);

  const handleCategoryChange = (tag) => {
    setForm((f) => ({ ...f, tag, period: DEFAULT_PERIOD_BY_TAG[tag], selectedAmenities: [] }));
  };

  const toggleAmenity = (amenity) => {
    setForm((f) => ({
      ...f,
      selectedAmenities: f.selectedAmenities.includes(amenity)
        ? f.selectedAmenities.filter((a) => a !== amenity)
        : [...f.selectedAmenities, amenity],
    }));
  };

  const handlePhoto = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setPhotoBusy(true);
    try {
      const dataUrl = REMOTE ? await uploadPhoto(file, "listings", 900, 0.78, true) : await fileToResizedDataUrl(file, 900, 0.78);
      setForm((f) => ({ ...f, img: dataUrl }));
      setFormError("");
    } catch (err) {
      setFormError(REMOTE ? "We couldn't upload that photo. Check your connection and sign-in, then try again." : "We couldn't read that image. Try a JPG or PNG.");
    }
    setPhotoBusy(false);
    e.target.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.location.trim() || !form.priceValue) return;
    if (!form.img.trim()) {
      setFormError("Please add a photo of the property.");
      return;
    }
    if (REMOTE && form.img.startsWith("data:")) {
      setFormError("The photo hasn't finished uploading. Please choose it again.");
      return;
    }
    if (!isSafeImageSrc(form.img)) {
      setFormError("The photo link must start with https://");
      return;
    }
    setFormError("");
    onSubmit(form);
    setForm(EMPTY_LISTING_FORM);
  };

  return (
    <form onSubmit={handleSubmit} className="pk-admin-form">
      <h3 className="pk-display text-lg font-semibold mb-4">New listing details</h3>
      <div className="pk-admin-form-grid">
        <label>
          Title
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </label>
        <CustomSelect id="pk-form-category" label="Category" value={form.tag} options={["Buy", "Rent", "Commercial", "Land"]} onChange={handleCategoryChange} />
        <label>
          Location
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="e.g. Milimani, Nakuru"
            list="pk-location-presets"
            required
          />
          <datalist id="pk-location-presets">
            {LOCATION_PRESETS.map((loc) => (
              <option key={loc} value={loc} />
            ))}
          </datalist>
        </label>
        <label>
          Price (KSh)
          <input type="number" min="0" value={form.priceValue} onChange={(e) => setForm({ ...form, priceValue: e.target.value })} required />
        </label>
        <CustomSelect
          id="pk-form-billing"
          label="Billing"
          value={BILLING_LABELS[form.period]}
          options={Object.values(BILLING_LABELS)}
          onChange={(label) => setForm({ ...form, period: BILLING_VALUE_BY_LABEL[label] })}
        />
        {(form.tag === "Buy" || form.tag === "Rent") && (
          <>
            <label>
              Bedrooms
              <input type="number" min="0" value={form.beds} onChange={(e) => setForm({ ...form, beds: e.target.value })} />
            </label>
            <label>
              Bathrooms
              <input type="number" min="0" value={form.baths} onChange={(e) => setForm({ ...form, baths: e.target.value })} />
            </label>
            <label>
              Size
              <input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} placeholder="e.g. 120 m²" />
            </label>
          </>
        )}
        {form.tag === "Commercial" && (
          <>
            <CustomSelect
              id="pk-form-spacetype"
              label="Space type"
              value={form.spaceType}
              options={["Office", "Retail", "Warehouse"]}
              onChange={(v) => setForm({ ...form, spaceType: v })}
            />
            <label>
              Bathrooms
              <input type="number" min="0" value={form.baths} onChange={(e) => setForm({ ...form, baths: e.target.value })} />
            </label>
            <label>
              Floor area
              <input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} placeholder="e.g. 200 m² floor area" />
            </label>
          </>
        )}
        {form.tag === "Land" && (
          <label>
            Size (acres)
            <input type="number" min="0" step="0.01" value={form.acres} onChange={(e) => setForm({ ...form, acres: e.target.value })} />
          </label>
        )}
        <label className="pk-admin-form-full">
          Photo
          <input type="file" accept="image/*" onChange={handlePhoto} />
          {photoBusy && <span className="pk-ink-soft text-xs">Preparing photo…</span>}
          {form.img && (
            <img
              src={form.img}
              alt="Listing preview"
              style={{ width: 160, height: 110, objectFit: "cover", borderRadius: 10, border: "1.5px solid var(--border)" }}
            />
          )}
          <input
            value={form.img.startsWith("data:") ? "" : form.img}
            onChange={(e) => setForm({ ...form, img: e.target.value })}
            placeholder="Or paste an image link (https://…)"
          />
        </label>
        <label className="pk-admin-form-full">
          Description
          <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>
        <label className="pk-admin-form-full">
          Common features (tap to add)
          <div className="pk-chip-row" style={{ flexWrap: "wrap", overflow: "visible", marginTop: 8 }}>
            {(AMENITY_PRESETS[form.tag] || []).map((a) => (
              <button
                type="button"
                key={a}
                className={`pk-chip ${form.selectedAmenities.includes(a) ? "pk-chip-active" : ""}`}
                onClick={() => toggleAmenity(a)}
              >
                {a}
              </button>
            ))}
          </div>
        </label>
        <label className="pk-admin-form-full">
          Other features (comma-separated)
          <input
            value={form.customAmenities}
            onChange={(e) => setForm({ ...form, customAmenities: e.target.value })}
            placeholder="Anything not listed above"
          />
        </label>
        <label>
          Contact name
          <input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
        </label>
        <CustomSelect
          id="pk-form-contactrole"
          label="Contact role"
          value={form.contactRole}
          options={["Property Owner", "Listing Agent"]}
          onChange={(v) => setForm({ ...form, contactRole: v })}
        />
        <label>
          Phone
          <input
            value={form.contactPhone}
            onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
            placeholder="+254 7xx xxx xxx"
            required
          />
        </label>
        <label>
          Email
          <input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} required />
        </label>
      </div>
      {formError && <p className="pk-admin-error mt-4">{formError}</p>}
      <button type="submit" className="pk-btn-primary justify-center mt-5" disabled={photoBusy}>
        {submitLabel}
      </button>
    </form>
  );
}

function ListingExpandDetails({ listing }) {
  return (
    <div className="pk-admin-expand">
      <div className="pk-admin-expand-grid">
        <div>
          <ImageWithFallback src={listing.img} alt={listing.title} className="pk-admin-expand-photo" iconFallback={HomeIcon} />
        </div>
        <div>
          <div className="pk-admin-expand-label">Description</div>
          <p className="pk-ink-soft text-sm mb-4">{listing.description}</p>

          <div className="pk-admin-expand-label">Details</div>
          <p className="pk-ink-soft text-sm mb-4">
            {listing.beds != null && `${listing.beds} bed · `}
            {listing.baths != null && `${listing.baths} bath · `}
            {listing.size}
            {listing.spaceType ? ` · ${listing.spaceType}` : ""}
          </p>

          <div className="pk-admin-expand-label">Features</div>
          <div className="pk-admin-expand-chips" style={{ marginBottom: 16 }}>
            {(listing.amenities || []).length === 0 && <span className="pk-ink-soft text-xs">None listed</span>}
            {(listing.amenities || []).map((a) => (
              <span key={a} className="pk-admin-expand-chip">
                {a}
              </span>
            ))}
          </div>

          <div className="pk-admin-expand-label">Contact</div>
          <p className="pk-ink-soft text-sm">
            {listing.contact?.name} · {listing.contact?.role}
            <br />
            {listing.contact?.phone} · {listing.contact?.email}
          </p>
        </div>
      </div>
    </div>
  );
}

function AdminListingsPanel({ listings, onUpdateListings, onToast }) {
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [featureFor, setFeatureFor] = useState(null);

  const visible = filter === "all" ? listings : listings.filter((l) => l.status === filter);
  const sorted = [...visible].sort((a, b) => b.id - a.id);

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const setStatus = (id, status) => {
    const listing = listings.find((l) => l.id === id);
    onUpdateListings(listings.map((l) => (l.id === id ? { ...l, status } : l)));
    if (!listing) return;
    if (status === "approved") onToast?.(`"${listing.title}" is now live`, "success");
    else if (status === "held") onToast?.(`"${listing.title}" put on hold`, "warning");
    else if (status === "revoked") onToast?.(`"${listing.title}" revoked`, "danger");
  };

  const deleteListing = (id) => {
    const listing = listings.find((l) => l.id === id);
    onUpdateListings(listings.filter((l) => l.id !== id));
    if (listing) onToast?.(`"${listing.title}" deleted`, "danger");
    setConfirmDelete(null);
  };

  const setFeature = (id, days) => {
    const until = days ? new Date(Date.now() + days * 86400000).toISOString() : null;
    onUpdateListings(listings.map((l) => (l.id === id ? { ...l, featured: true, featuredUntil: until } : l)));
    onToast?.(days ? `Featured for ${days} days` : "Featured until you remove it", "success");
    setFeatureFor(null);
  };
  const removeFeature = (id) => {
    onUpdateListings(listings.map((l) => (l.id === id ? { ...l, featured: false, featuredUntil: null } : l)));
    onToast?.("Featuring removed", "warning");
    setFeatureFor(null);
  };

  const handleAdd = (form) => {
    const nextId = listings.length ? Math.max(...listings.map((l) => l.id)) + 1 : 1;
    const newListing = {
      ...buildListingFromForm(form, nextId),
      agency: null,
      status: "approved",
      source: "admin",
      submittedBy: adminName || "Superadmin",
    };
    onUpdateListings([...listings, newListing]);
    onToast?.(`"${newListing.title}" published`, "success");
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-1 flex-wrap">
        <div>
          <h2 className="pk-display text-2xl font-semibold mb-1">Listings</h2>
          <p className="pk-ink-soft text-sm">
            {listings.length} total · admin-submitted listings land here as "Pending" for your review.
          </p>
        </div>
        <button className="pk-btn-primary" onClick={() => setShowForm((s) => !s)}>
          <Plus size={16} /> {showForm ? "Close form" : "Add listing"}
        </button>
      </div>

      {showForm && <ListingForm onSubmit={handleAdd} />}

      <div className="pk-chip-row mt-6">
        {["all", "pending", "approved", "held", "revoked"].map((f) => (
          <button key={f} className={`pk-chip ${filter === f ? "pk-chip-active" : ""}`} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : LISTING_STATUS_META[f].label}
          </button>
        ))}
      </div>

      <div className="pk-admin-listing-list">
        {sorted.length === 0 && <p className="pk-ink-soft text-sm mt-6">No listings in this view.</p>}
        {sorted.map((l) => (
          <div key={l.id} className="pk-admin-card">
            <div className="pk-admin-listing-row">
              <ImageWithFallback src={l.img} alt={l.title} className="pk-admin-listing-thumb" iconFallback={HomeIcon} />
              <div className="pk-admin-listing-info">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{l.title}</span>
                  <span className="pk-status-badge" style={{ "--badge-color": LISTING_STATUS_META[l.status].color }}>
                    {LISTING_STATUS_META[l.status].label}
                  </span>
                  {l.featured && (
                    <span className="pk-status-badge" style={{ "--badge-color": isFeatured(l) ? "var(--primary)" : "var(--ink-soft)" }}>
                      {isFeatured(l)
                        ? l.featuredUntil
                          ? `Featured until ${formatShortDate(l.featuredUntil)}`
                          : "Featured (no end date)"
                        : "Featuring ended"}
                    </span>
                  )}
                </div>
                <p className="pk-ink-soft text-xs mt-1">
                  {l.location} · {l.price}
                  {l.period} · {l.tag}
                </p>
                <p className="pk-ink-soft text-xs">
                  Submitted by {l.submittedBy || "—"}
                  {l.agency ? ` · ${l.agency}` : ""}
                </p>
              </div>
              <div className="pk-admin-listing-actions">
                {l.status === "approved" && (
                  <button className="pk-icon-btn" title="Feature this listing" aria-label="Feature this listing" onClick={() => setFeatureFor(featureFor === l.id ? null : l.id)}>
                    <Star size={15} fill={isFeatured(l) ? "currentColor" : "none"} />
                  </button>
                )}
                {l.status !== "approved" && (
                  <button className="pk-icon-btn" title="Approve" aria-label="Approve" onClick={() => setStatus(l.id, "approved")}>
                    <Check size={15} />
                  </button>
                )}
                {l.status !== "held" && (
                  <button className="pk-icon-btn" title="Hold" aria-label="Hold" onClick={() => setStatus(l.id, "held")}>
                    <Pause size={15} />
                  </button>
                )}
                {l.status !== "revoked" && (
                  <button className="pk-icon-btn" title="Revoke" aria-label="Revoke" onClick={() => setStatus(l.id, "revoked")}>
                    <RotateCcw size={15} />
                  </button>
                )}
                <button className="pk-icon-btn" title="Delete" aria-label="Delete" onClick={() => setConfirmDelete(l)}>
                  <Trash2 size={15} />
                </button>
                <button className="pk-icon-btn" title={expandedIds.has(l.id) ? "Collapse" : "Expand"} aria-label={expandedIds.has(l.id) ? "Collapse" : "Expand"} onClick={() => toggleExpand(l.id)}>
                  {expandedIds.has(l.id) ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
              </div>
            </div>
            {featureFor === l.id && (
              <div className="pk-feature-menu" role="group" aria-label="Feature this listing">
                <span className="text-sm font-semibold">Feature for:</span>
                {FEATURE_OPTIONS.map((o) => (
                  <button key={o.label} className="pk-btn-outline" onClick={() => setFeature(l.id, o.days)}>
                    {o.label}
                  </button>
                ))}
                {l.featured && (
                  <button className="pk-btn-outline" onClick={() => removeFeature(l.id)}>
                    Remove featuring
                  </button>
                )}
                <button className="pk-btn-outline" onClick={() => setFeatureFor(null)}>
                  Cancel
                </button>
              </div>
            )}
            {expandedIds.has(l.id) && <ListingExpandDetails listing={l} />}
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete this listing?"
        message={confirmDelete ? `"${confirmDelete.title}" will be permanently removed. This can't be undone.` : ""}
        confirmLabel="Delete"
        onConfirm={() => confirmDelete && deleteListing(confirmDelete.id)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

function AdminAdminsPanel({ admins, onUpdateAdmins, onToast, listings, agents }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agency, setAgency] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [justCreated, setJustCreated] = useState(null);
  const [formError, setFormError] = useState("");
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [confirmDelete, setConfirmDelete] = useState(null);

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !agency.trim() || (!REMOTE && !password)) return;
    const normalizedEmail = email.trim().toLowerCase();
    if (!REMOTE && password.length < 10) {
      setFormError("Use a password of at least 10 characters.");
      return;
    }
    if (admins.some((a) => a.email.toLowerCase() === normalizedEmail)) {
      setFormError("An admin with that email already exists.");
      return;
    }
    setFormError("");
    const passSalt = REMOTE ? "" : randomSalt();
    const passHash = REMOTE ? "" : await pbkdf2Hex(password, passSalt, ADMIN_HASH_ITERATIONS);
    const newAdmin = {
      id: admins.length ? Math.max(...admins.map((a) => a.id)) + 1 : 1,
      name: name.trim(),
      email: normalizedEmail,
      agency: agency.trim(),
      ...(REMOTE ? {} : { passSalt, passHash }),
      status: "active",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    onUpdateAdmins([...admins, newAdmin]);
    onToast?.(`Admin account created for ${newAdmin.name}`, "success");
    setJustCreated(newAdmin.email);
    setName("");
    setEmail("");
    setAgency("");
    setPassword("");
  };

  const toggleStatus = (id) => {
    const admin = admins.find((a) => a.id === id);
    const nextStatus = admin?.status === "active" ? "suspended" : "active";
    onUpdateAdmins(admins.map((a) => (a.id === id ? { ...a, status: nextStatus } : a)));
    if (admin) onToast?.(`${admin.name} ${nextStatus === "active" ? "reactivated" : "suspended"}`, nextStatus === "active" ? "success" : "warning");
  };

  const deleteAdmin = (id) => {
    const admin = admins.find((a) => a.id === id);
    onUpdateAdmins(admins.filter((a) => a.id !== id));
    if (admin) onToast?.(`Removed ${admin.name}`, "danger");
    setConfirmDelete(null);
  };

  return (
    <div>
      <h2 className="pk-display text-2xl font-semibold mb-1">Admin accounts</h2>
      <p className="pk-ink-soft text-sm mb-6">
        {REMOTE
          ? "Add an agency admin by email. They create a normal account on the site with that email, confirm it, then use Staff sign in. Each admin can add listings and view the agents and listings under their own agency only."
          : "Create agency admin accounts here. Each admin can add listings and view the agents and listings under their own agency only."}
      </p>

      <form onSubmit={handleCreate} className="pk-admin-form">
        <div className="pk-admin-form-grid">
          <label>
            Full name
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="pk-admin-form-full">
            Agency name
            <input
              value={agency}
              onChange={(e) => setAgency(e.target.value)}
              placeholder="Agency name"
              required
            />
          </label>
          {!REMOTE && (
          <label className="pk-admin-form-full">
            Password for this admin
            <div className="pk-input-wrap">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 10 characters" minLength={10} autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="pk-input-indicator pk-password-toggle"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </label>
          )}
        </div>
        <button type="submit" className="pk-btn-primary justify-center mt-5">
          <UserCog size={16} /> {REMOTE ? "Add admin" : "Create admin account"}
        </button>
      </form>

      {formError && <p className="pk-admin-error mt-3">{formError}</p>}

      {justCreated && (
        <div className="pk-admin-notice">
          {REMOTE ? (
            <>
              <strong>{justCreated}</strong> now has agency admin access. Ask them to sign up on the site with that email, confirm it from
              their inbox, then use Staff sign in. Until they confirm, nothing is unlocked.
            </>
          ) : (
            <>
              Account created for <strong>{justCreated}</strong>. Send them the email and the password you chose through a
              private channel (not a group chat). Passwords are stored as hashes and can't be viewed again.
            </>
          )}
        </div>
      )}

      <div className="pk-admin-listing-list mt-6">
        {admins.length === 0 && <p className="pk-ink-soft text-sm">No admin accounts yet.</p>}
        {admins.map((a) => {
          const agencyAgents = agents.filter((ag) => ag.agency === a.agency);
          const agencyListings = listings.filter((l) => l.agency === a.agency);
          return (
            <div key={a.id} className="pk-admin-card">
              <div className="pk-admin-listing-row">
                <InitialsAvatar name={a.name} size={44} />
                <div className="pk-admin-listing-info">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{a.name}</span>
                    <span className="pk-status-badge" style={{ "--badge-color": a.status === "active" ? "var(--primary)" : "var(--brick)" }}>
                      {a.status === "active" ? "Active" : "Suspended"}
                    </span>
                  </div>
                  <p className="pk-ink-soft text-xs mt-1">
                    {a.email} · {a.agency} · added {a.createdAt}
                  </p>
                </div>
                <div className="pk-admin-listing-actions">
                  <button className="pk-icon-btn" title={a.status === "active" ? "Suspend" : "Reactivate"} aria-label={a.status === "active" ? "Suspend" : "Reactivate"} onClick={() => toggleStatus(a.id)}>
                    {a.status === "active" ? <Pause size={15} /> : <RotateCcw size={15} />}
                  </button>
                  <button className="pk-icon-btn" title="Delete" aria-label="Delete" onClick={() => setConfirmDelete(a)}>
                    <Trash2 size={15} />
                  </button>
                  <button className="pk-icon-btn" title={expandedIds.has(a.id) ? "Collapse" : "Expand"} aria-label={expandedIds.has(a.id) ? "Collapse" : "Expand"} onClick={() => toggleExpand(a.id)}>
                    {expandedIds.has(a.id) ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                </div>
              </div>
              {expandedIds.has(a.id) && (
                <div className="pk-admin-expand">
                  <div className="pk-admin-stat-grid" style={{ margin: "0 0 4px" }}>
                    <div className="pk-admin-stat-card">
                      <div className="pk-mono pk-primary-text pk-admin-stat-value">{agencyAgents.length}</div>
                      <div className="pk-ink-soft text-xs mt-1">Agents in agency</div>
                    </div>
                    <div className="pk-admin-stat-card">
                      <div className="pk-mono pk-primary-text pk-admin-stat-value">{agencyListings.length}</div>
                      <div className="pk-ink-soft text-xs mt-1">Listings from agency</div>
                    </div>
                    <div className="pk-admin-stat-card">
                      <div className="pk-mono pk-primary-text pk-admin-stat-value">
                        {agencyListings.filter((l) => l.status === "pending").length}
                      </div>
                      <div className="pk-ink-soft text-xs mt-1">Awaiting review</div>
                    </div>
                    <div className="pk-admin-stat-card">
                      <div className="pk-mono pk-primary-text pk-admin-stat-value">
                        {agencyListings.filter((l) => l.status === "approved").length}
                      </div>
                      <div className="pk-ink-soft text-xs mt-1">Live listings</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Remove this admin account?"
        message={confirmDelete ? `${confirmDelete.name} will lose access immediately. This can't be undone.` : ""}
        confirmLabel="Remove"
        onConfirm={() => confirmDelete && deleteAdmin(confirmDelete.id)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

const AGENT_FOCUS_OPTIONS = ["Residential Sales", "Rentals", "Commercial Leasing", "Land & Development"];

function AgentForm({ agencyLocked, agencySuggestions = [], onSubmit }) {
  const blank = { name: "", focus: AGENT_FOCUS_OPTIONS[0], area: "", agency: agencyLocked || "", img: "" };
  const [form, setForm] = useState(blank);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [busy, setBusy] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = REMOTE ? await uploadPhoto(file, "agents", 320, 0.8) : await fileToResizedDataUrl(file, 320, 0.8);
      setForm((f) => ({ ...f, img: dataUrl }));
      setError("");
    } catch (err) {
      setError(REMOTE ? "We couldn't upload that photo. Check your connection and sign-in, then try again." : "We couldn't read that image. Try a JPG or PNG.");
    }
    setBusy(false);
    e.target.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.area.trim()) {
      setError("Name and area are required.");
      return;
    }
    if (form.img && ((REMOTE && form.img.startsWith("data:")) || !isSafeImageSrc(form.img))) {
      setError("The photo link must start with https:// (or upload a photo).");
      return;
    }
    setError("");
    onSubmit({ ...form, agency: (agencyLocked || form.agency).trim() });
    setForm(blank);
    setDone(`${form.name.trim()} added. They stay hidden from the public site until verified.`);
  };

  return (
    <form onSubmit={handleSubmit} className="pk-admin-form" style={{ marginBottom: 24 }}>
      <h3 className="pk-display text-lg font-semibold mb-4">Add an agent</h3>
      <div className="pk-admin-form-grid">
        <label>
          Full name
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label>
          Focus
          <select value={form.focus} onChange={(e) => setForm({ ...form, focus: e.target.value })}>
            {AGENT_FOCUS_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </label>
        <label>
          Area covered
          <input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="e.g. Milimani & Section 58" required />
        </label>
        <label>
          Agency
          <input
            value={agencyLocked || form.agency}
            onChange={(e) => setForm({ ...form, agency: e.target.value })}
            list="pk-agency-list"
            disabled={!!agencyLocked}
            placeholder="Leave blank if independent"
          />
          <datalist id="pk-agency-list">
            {agencySuggestions.map((a) => (
              <option key={a} value={a} />
            ))}
          </datalist>
        </label>
        <label className="pk-admin-form-full">
          Photo (optional)
          <input type="file" accept="image/*" onChange={handleFile} />
          {form.img && (
            <img src={form.img} alt="Agent preview" style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 999, border: "2px solid var(--accent)" }} />
          )}
        </label>
      </div>
      {error && <p className="pk-admin-error mt-4">{error}</p>}
      {done && !error && <div className="pk-admin-notice mt-4">{done}</div>}
      <button type="submit" className="pk-btn-primary justify-center mt-5" disabled={busy}>
        <Plus size={15} /> Add agent
      </button>
    </form>
  );
}

function VerifyDialog({ agent, onConfirm, onCancel }) {
  const [checked, setChecked] = useState({});
  const [notes, setNotes] = useState("");
  const dialogRef = useRef(null);
  useDialogFocus(Boolean(agent), dialogRef);
  useEffect(() => {
    setChecked({});
    setNotes("");
  }, [agent && agent.id]);
  const allDone = VERIFICATION_CRITERIA.every((k) => checked[k.id]);
  return (
    <div className={`pk-modal-backdrop ${agent ? "pk-open" : ""}`} onClick={onCancel} inert={agent ? undefined : ""}>
      <div className="pk-modal" ref={dialogRef} role="dialog" aria-modal="true" aria-label="Verify agent" tabIndex={-1} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="flex items-center justify-between mb-2">
          <span className="pk-display text-lg font-semibold">Verify {agent ? agent.name : ""}</span>
          <button className="pk-icon-btn" aria-label="Close" onClick={onCancel}>
            <X size={16} />
          </button>
        </div>
        <p className="pk-ink-soft text-sm mb-3">Tick each check only if you have actually done it. This is what the public Verified page promises.</p>
        {VERIFICATION_CRITERIA.map((k) => (
          <label key={k.id} className="pk-check-row">
            <input type="checkbox" checked={Boolean(checked[k.id])} onChange={(e) => setChecked({ ...checked, [k.id]: e.target.checked })} />
            <span className="text-sm">
              <strong>{k.label}.</strong> <span className="pk-ink-soft">{k.detail}</span>
            </span>
          </label>
        ))}
        <label className="text-sm font-medium block mt-3">
          Notes (private, optional)
          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="For example: ID seen on 8 Oct, agency confirmed by phone" />
        </label>
        <div className="flex gap-3 mt-5">
          <button className="pk-btn-outline flex-1 justify-center" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="pk-btn-primary flex-1 justify-center"
            disabled={!allDone}
            onClick={() => onConfirm(agent, { checks: VERIFICATION_CRITERIA.map((k) => k.id), notes: notes.trim() })}
          >
            <BadgeCheck size={15} /> Mark as verified
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminAgentsPanel({ agents, onUpdateAgents, onToast, admins = [] }) {
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [confirmAction, setConfirmAction] = useState(null);
  const [verifying, setVerifying] = useState(null);

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addAgent = (data) => {
    const newAgent = {
      id: agents.length ? Math.max(...agents.map((a) => a.id)) + 1 : 1,
      name: data.name.trim(),
      focus: data.focus,
      area: data.area.trim(),
      agency: data.agency,
      status: "unverified",
      rating: null,
      reviews: 0,
      comments: [],
      img: data.img || "",
      verifiedAt: null,
      verification: {},
    };
    onUpdateAgents([...agents, newAgent]);
    onToast?.(`${newAgent.name} added`, "success");
  };

  const confirmVerify = (agent, details) => {
    onUpdateAgents(
      agents.map((a) => (a.id === agent.id ? { ...a, status: "verified", verifiedAt: new Date().toISOString(), verification: { ...details, at: new Date().toISOString() } } : a))
    );
    onToast?.(`${agent.name} verified`, "success");
    setVerifying(null);
  };
  const removeVerification = (agent) => {
    onUpdateAgents(agents.map((a) => (a.id === agent.id ? { ...a, status: "unverified", verifiedAt: null, verification: {} } : a)));
    onToast?.(`Verification removed from ${agent.name}`, "warning");
  };
  const recheckDue = (a) => a.status === "verified" && a.verifiedAt && Date.now() - new Date(a.verifiedAt).getTime() > VERIFICATION_RECHECK_DAYS * 86400000;

  const setStatus = (id, status) => {
    const agent = agents.find((a) => a.id === id);
    onUpdateAgents(agents.map((a) => (a.id === id ? { ...a, status } : a)));
    if (!agent) return;
    if (status === "verified") onToast?.(`${agent.name} verified`, "success");
    else if (status === "banned") onToast?.(`${agent.name} banned`, "danger");
    setConfirmAction(null);
  };
  const deleteAgent = (id) => {
    const agent = agents.find((a) => a.id === id);
    onUpdateAgents(agents.filter((a) => a.id !== id));
    if (agent) onToast?.(`Removed ${agent.name}`, "danger");
    setConfirmAction(null);
  };

  return (
    <div>
      <h2 className="pk-display text-2xl font-semibold mb-1">Agents</h2>
      <p className="pk-ink-soft text-sm mb-6">Add agents, then verify them. Only verified agents appear on the public site; banned or unverified agents are hidden.</p>
      <AgentForm agencySuggestions={admins.map((a) => a.agency)} onSubmit={addAgent} />
      {agents.length === 0 && <p className="pk-ink-soft text-sm">No agents yet.</p>}

      <div className="pk-admin-listing-list">
        {agents.map((a) => (
          <div key={a.id} className="pk-admin-card">
            <div className="pk-admin-listing-row">
              <ImageWithFallback src={a.img} alt={a.name} className="pk-agent-photo" iconFallback={Users} />
              <div className="pk-admin-listing-info">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{a.name}</span>
                  <span
                    className="pk-status-badge"
                    style={{
                      "--badge-color":
                        a.status === "banned" ? "var(--brick)" : a.status === "verified" ? "var(--primary)" : "var(--ink-soft)",
                    }}
                  >
                    {a.status === "banned" ? "Banned" : a.status === "verified" ? "Verified" : "Unverified"}
                  </span>
                  {recheckDue(a) && (
                    <span className="pk-status-badge" style={{ "--badge-color": "var(--brick)" }}>
                      Re-check due
                    </span>
                  )}
                </div>
                <p className="pk-ink-soft text-xs mt-1">
                  {a.focus} · {a.area}
                  {a.status === "verified" && a.verifiedAt ? ` · Verified ${formatShortDate(a.verifiedAt)}` : ""}
                </p>
              </div>
              <div className="pk-admin-listing-actions">
                {a.status !== "verified" && (
                  <button className="pk-icon-btn" title="Verify" aria-label="Verify" onClick={() => setVerifying(a)}>
                    <BadgeCheck size={15} />
                  </button>
                )}
                {a.status === "verified" && (
                  <button className="pk-icon-btn" title="Remove verification" aria-label="Remove verification" onClick={() => removeVerification(a)}>
                    <RotateCcw size={15} />
                  </button>
                )}
                {a.status !== "banned" && (
                  <button className="pk-icon-btn" title="Ban" aria-label="Ban" onClick={() => setConfirmAction({ type: "ban", agent: a })}>
                    <Ban size={15} />
                  </button>
                )}
                <button className="pk-icon-btn" title="Delete" aria-label="Delete" onClick={() => setConfirmAction({ type: "delete", agent: a })}>
                  <Trash2 size={15} />
                </button>
                <button className="pk-icon-btn" title={expandedIds.has(a.id) ? "Collapse" : "Expand"} aria-label={expandedIds.has(a.id) ? "Collapse" : "Expand"} onClick={() => toggleExpand(a.id)}>
                  {expandedIds.has(a.id) ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
              </div>
            </div>
            {expandedIds.has(a.id) && (
              <div className="pk-admin-expand">
                <div className="pk-admin-expand-grid">
                  <div>
                    <div className="pk-admin-expand-label">Score</div>
                    <AgentScore rating={a.rating} reviews={a.reviews} />
                    <div className="pk-admin-expand-label mt-4">Agency</div>
                    <p className="pk-ink-soft text-sm">{a.agency || "Independent"}</p>
                  </div>
                  <div>
                    <div className="pk-admin-expand-label">Notes from admins</div>
                    {(a.comments || []).length === 0 && <p className="pk-ink-soft text-sm">No notes yet.</p>}
                    <div className="flex flex-col gap-2">
                      {(a.comments || []).map((c) => (
                        <div key={c.id} className="pk-agent-comment">
                          <span className="font-semibold">{c.author}</span> <span className="pk-ink-soft">· {c.date}</span>
                          <p>{c.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <VerifyDialog agent={verifying} onConfirm={confirmVerify} onCancel={() => setVerifying(null)} />

      <ConfirmDialog
        open={!!confirmAction}
        title={confirmAction?.type === "ban" ? "Ban this agent?" : "Delete this agent?"}
        message={
          confirmAction
            ? confirmAction.type === "ban"
              ? `${confirmAction.agent.name} will be hidden from the public site immediately.`
              : `${confirmAction.agent.name} will be permanently removed. This can't be undone.`
            : ""
        }
        confirmLabel={confirmAction?.type === "ban" ? "Ban" : "Delete"}
        onConfirm={() =>
          confirmAction && (confirmAction.type === "ban" ? setStatus(confirmAction.agent.id, "banned") : deleteAgent(confirmAction.agent.id))
        }
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}

function AgencyListingsPanel({ agency, adminName, listings, allListings, onUpdateListings, onToast }) {
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [confirmDelete, setConfirmDelete] = useState(null);
  const sorted = [...listings].sort((a, b) => b.id - a.id);

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAdd = (form) => {
    const nextId = allListings.length ? Math.max(...allListings.map((l) => l.id)) + 1 : 1;
    const newListing = {
      ...buildListingFromForm(form, nextId),
      agency,
      status: "pending",
      source: "admin",
      submittedBy: adminName,
    };
    onUpdateListings([...allListings, newListing]);
    onToast?.(`"${newListing.title}" submitted for review`, "success");
  };

  const deleteOwn = (id) => {
    const listing = listings.find((l) => l.id === id);
    onUpdateListings(allListings.filter((l) => l.id !== id));
    if (listing) onToast?.(`"${listing.title}" deleted`, "danger");
    setConfirmDelete(null);
  };

  return (
    <div>
      <h2 className="pk-display text-2xl font-semibold mb-1">My Listings</h2>
      <p className="pk-ink-soft text-sm mb-6">
        Listings you submit land as "Pending" until a superadmin reviews them. {listings.length} total so far.
      </p>

      <ListingForm onSubmit={handleAdd} submitLabel="Submit for review" />

      <div className="pk-admin-listing-list mt-6">
        {sorted.length === 0 && <p className="pk-ink-soft text-sm">You haven't submitted any listings yet.</p>}
        {sorted.map((l) => (
          <div key={l.id} className="pk-admin-card">
            <div className="pk-admin-listing-row">
              <ImageWithFallback src={l.img} alt={l.title} className="pk-admin-listing-thumb" iconFallback={HomeIcon} />
              <div className="pk-admin-listing-info">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{l.title}</span>
                  <span className="pk-status-badge" style={{ "--badge-color": LISTING_STATUS_META[l.status].color }}>
                    {LISTING_STATUS_META[l.status].label}
                  </span>
                </div>
                <p className="pk-ink-soft text-xs mt-1">
                  {l.location} · {l.price}
                  {l.period} · {l.tag}
                </p>
              </div>
              <div className="pk-admin-listing-actions">
                <button className="pk-icon-btn" title="Delete" aria-label="Delete" onClick={() => setConfirmDelete(l)}>
                  <Trash2 size={15} />
                </button>
                <button className="pk-icon-btn" title={expandedIds.has(l.id) ? "Collapse" : "Expand"} aria-label={expandedIds.has(l.id) ? "Collapse" : "Expand"} onClick={() => toggleExpand(l.id)}>
                  {expandedIds.has(l.id) ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
              </div>
            </div>
            {expandedIds.has(l.id) && <ListingExpandDetails listing={l} />}
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete this listing?"
        message={confirmDelete ? `"${confirmDelete.title}" will be permanently removed. This can't be undone.` : ""}
        confirmLabel="Delete"
        onConfirm={() => confirmDelete && deleteOwn(confirmDelete.id)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

function AgencyAgentsPanel({ agents, allAgents, onUpdateAgents, adminName, agency }) {
  const [drafts, setDrafts] = useState({});
  const [expandedIds, setExpandedIds] = useState(new Set());

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addAgent = (data) => {
    const newAgent = {
      id: allAgents.length ? Math.max(...allAgents.map((a) => a.id)) + 1 : 1,
      name: data.name.trim(),
      focus: data.focus,
      area: data.area.trim(),
      agency,
      status: "unverified",
      rating: null,
      reviews: 0,
      comments: [],
      img: data.img || "",
    };
    onUpdateAgents([...allAgents, newAgent]);
  };

  const addComment = (agentId) => {
    const text = (drafts[agentId] || "").trim();
    if (!text) return;
    const newComment = { id: Date.now(), author: adminName, text, date: new Date().toISOString().slice(0, 10) };
    onUpdateAgents(allAgents.map((a) => (a.id === agentId ? { ...a, comments: [...(a.comments || []), newComment] } : a)));
    setDrafts((d) => ({ ...d, [agentId]: "" }));
  };

  return (
    <div>
      <h2 className="pk-display text-2xl font-semibold mb-1">My Agents</h2>
      <p className="pk-ink-soft text-sm mb-6">Agents under your agency and your notes on them. New agents appear on the public site once the superadmin verifies them.</p>
      <AgentForm agencyLocked={agency} onSubmit={addAgent} />

      {agents.length === 0 && <p className="pk-ink-soft text-sm">No agents are assigned to your agency yet.</p>}

      <div className="pk-admin-listing-list">
        {agents.map((a) => (
          <div key={a.id} className="pk-admin-card">
            <div className="pk-admin-listing-row">
              <ImageWithFallback src={a.img} alt={a.name} className="pk-agent-photo" iconFallback={Users} />
              <div className="pk-admin-listing-info">
                <div className="font-semibold flex items-center gap-1">
                  {a.name}
                  {a.status === "verified" && <VerifiedBadge size={14} />}
                </div>
                <div className="pk-ink-soft text-xs">
                  {a.focus} · {a.area}
                </div>
                <AgentScore rating={a.rating} reviews={a.reviews} />
              </div>
              <div className="pk-admin-listing-actions">
                <button className="pk-icon-btn" title={expandedIds.has(a.id) ? "Collapse" : "View notes"} aria-label={expandedIds.has(a.id) ? "Collapse" : "View notes"} onClick={() => toggleExpand(a.id)}>
                  {expandedIds.has(a.id) ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
              </div>
            </div>
            {expandedIds.has(a.id) && (
              <div className="pk-admin-expand">
                <div className="pk-admin-expand-label">Notes</div>
                <div className="flex flex-col gap-2 mb-3">
                  {(a.comments || []).length === 0 && <p className="pk-ink-soft text-xs">No notes yet.</p>}
                  {(a.comments || []).map((c) => (
                    <div key={c.id} className="pk-agent-comment">
                      <span className="font-semibold">{c.author}</span> <span className="pk-ink-soft">· {c.date}</span>
                      <p>{c.text}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    aria-label="Add a note about this agent" className="pk-note-input"
                    placeholder="Add a note about this agent…"
                    value={drafts[a.id] || ""}
                    onChange={(e) => setDrafts((d) => ({ ...d, [a.id]: e.target.value }))}
                  />
                  <button className="pk-btn-outline" onClick={() => addComment(a.id)}>
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AgencyAdminConsole({ theme, setTheme, onExit, currentAdmin, listings, onUpdateListings, agents, onUpdateAgents }) {
  const [tab, setTab] = useState("listings");
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  const showToast = (message, type = "success") => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };
  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const myAgents = agents.filter((a) => a.agency === currentAdmin.agency);
  const myListings = listings.filter((l) => l.agency === currentAdmin.agency);

  const TABS = [
    { key: "listings", label: "My Listings", icon: ClipboardList },
    { key: "agents", label: "My Agents", icon: BadgeCheck },
  ];

  return (
    <div className="pk-admin-shell">
      <div className="pk-admin-topbar">
        <div className="flex items-center gap-3">
          <LogoMark size={30} />
          <div>
            <div className="pk-display font-semibold" style={{ lineHeight: 1.15 }}>
              Hao yangu realtors admin
            </div>
            <div className="pk-ink-soft text-xs">{currentAdmin.agency}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="pk-icon-btn" aria-label="Toggle theme" onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}>
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button className="pk-btn-outline" onClick={onExit}>
            <LogOut size={15} /> Exit to site
          </button>
        </div>
      </div>
      <div className="pk-admin-body">
        <nav className="pk-admin-sidebar">
          {TABS.map((t) => {
            const TIcon = t.icon;
            return (
              <button key={t.key} className={`pk-admin-nav-item ${tab === t.key ? "pk-admin-nav-active" : ""}`} onClick={() => setTab(t.key)}>
                <TIcon size={16} /> {t.label}
              </button>
            );
          })}
        </nav>
        <main className="pk-admin-main">
          <div key={tab} className="pk-admin-tab-content">
            {tab === "listings" && (
              <AgencyListingsPanel
                agency={currentAdmin.agency}
                adminName={currentAdmin.name}
                listings={myListings}
                allListings={listings}
                onUpdateListings={onUpdateListings}
                onToast={showToast}
              />
            )}
            {tab === "agents" && (
              <AgencyAgentsPanel agents={myAgents} allAgents={agents} onUpdateAgents={onUpdateAgents} adminName={currentAdmin.name} agency={currentAdmin.agency} />
            )}
          </div>
        </main>
      </div>
      <AdminToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

function AdminConsole({ theme, setTheme, onExit, adminName, listings, onUpdateListings, agents, onUpdateAgents, admins, onUpdateAdmins }) {
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  const showToast = (message, type = "success") => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };
  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  useEffect(() => {
    let cancelled = false;
    const loadStats = async () => {
      try {
        if (REMOTE) {
          const session = await getValidSession();
          if (!session) return;
          const rows = await sbRequest("/rest/v1/usage_events?select=key,count", { token: session.access_token });
          if (!cancelled) setStats(Object.fromEntries((rows || []).map((r) => [r.key, Number(r.count)])));
          return;
        }
        const res = await window.storage.get(STORAGE_KEYS.stats, true);
        if (!cancelled && res && res.value) setStats(JSON.parse(res.value));
      } catch (e) {
        /* no stats saved yet */
      }
    };
    loadStats();
    const interval = setInterval(loadStats, REMOTE ? 15000 : 8000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const TABS = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "listings", label: "Listings", icon: ClipboardList },
    { key: "admins", label: "Admins", icon: UserCog },
    { key: "agents", label: "Agents", icon: BadgeCheck },
  ];

  return (
    <div className="pk-admin-shell">
      <div className="pk-admin-topbar">
        <div className="flex items-center gap-3">
          <LogoMark size={30} />
          <span className="pk-display font-semibold">Hao yangu realtors admin</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="pk-icon-btn" aria-label="Toggle theme" onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}>
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button className="pk-btn-outline" onClick={onExit}>
            <LogOut size={15} /> Exit to site
          </button>
        </div>
      </div>
      <div className="pk-admin-body">
        <nav className="pk-admin-sidebar">
          {TABS.map((t) => {
            const TIcon = t.icon;
            return (
              <button key={t.key} className={`pk-admin-nav-item ${tab === t.key ? "pk-admin-nav-active" : ""}`} onClick={() => setTab(t.key)}>
                <TIcon size={16} /> {t.label}
              </button>
            );
          })}
        </nav>
        <main className="pk-admin-main">
          <div key={tab} className="pk-admin-tab-content">
            {tab === "overview" && <AdminOverview listings={listings} agents={agents} admins={admins} stats={stats} />}
            {tab === "listings" && <AdminListingsPanel listings={listings} onUpdateListings={onUpdateListings} onToast={showToast} />}
            {tab === "admins" && (
              <AdminAdminsPanel admins={admins} onUpdateAdmins={onUpdateAdmins} onToast={showToast} listings={listings} agents={agents} />
            )}
            {tab === "agents" && <AdminAgentsPanel agents={agents} onUpdateAgents={onUpdateAgents} onToast={showToast} admins={admins} />}
          </div>
        </main>
      </div>
      <AdminToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Main component                                                     */
/* ---------------------------------------------------------------- */

export default function App() {
  const [theme, setTheme] = useState("light");
  const [appLoading, setAppLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [page, setPage] = useState("home");
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [activeTab, setActiveTab] = useState("buy");
  const [listingCategory, setListingCategory] = useState("buy");
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0]);
  const [scrollTarget, setScrollTarget] = useState(null);
  const [budget, setBudget] = useState(TAB_META.buy.budgetOptions[0]);
  const [secondary, setSecondary] = useState(TAB_META.buy.secondaryOptions[0]);
  const [location, setLocation] = useState("");
  const [favorites, setFavorites] = useState(() => {
    try {
      return new Set(JSON.parse(window.localStorage.getItem(STORAGE_KEYS.favorites) || "[]"));
    } catch (e) {
      return new Set();
    }
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "", confirm: "", website: "" });
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [authAgree, setAuthAgree] = useState(false);
  const [authIntro, setAuthIntro] = useState("");
  const [authChecked, setAuthChecked] = useState(!AUTH_ENABLED);
  const gateAutoFor = useRef(null);
  const recoveryTokenRef = useRef(null);
  const authDialogRef = useRef(null);
  const drawerRef = useRef(null);
  const firstPageRender = useRef(true);
  useDialogFocus(authOpen, authDialogRef);
  useDialogFocus(menuOpen, drawerRef);
  // No seed data — listings are added exclusively by admins/superadmins via their dashboards.
  const [listings, setListings] = useState([]);
  const [agents, setAgents] = useState(AGENTS);
  const [admins, setAdmins] = useState([]);
  const [staffState, setStaffState] = useState("unknown");
  const [mfaFactorId, setMfaFactorId] = useState("");
  const [mfaTick, setMfaTick] = useState(0);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);
  const [dataReady, setDataReady] = useState(false);
  const [routerReady, setRouterReady] = useState(false);
  const [syncError, setSyncError] = useState("");
  const listingsRef = useRef([]);
  const agentListRef = useRef([]);
  const adminListRef = useRef([]);
  listingsRef.current = listings;
  agentListRef.current = agents;
  adminListRef.current = admins;
  const refreshRemoteRef = useRef(null);

  const pendingStatsRef = useRef({});
  const statsFlushScheduled = useRef(false);

  const [searchSheetOpen, setSearchSheetOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const heroRef = useRef(null);
  const featuredRef = useRef(null);
  const agentsRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    const hide = setTimeout(() => setAppLoading(false), 900);
    return () => clearTimeout(hide);
  }, []);

  useEffect(() => {
    if (!appLoading) {
      const remove = setTimeout(() => setShowLoader(false), 500);
      return () => clearTimeout(remove);
    }
  }, [appLoading]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen || authOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, authOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setAuthOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Hydrate listings from persistent storage (shared across everyone using this site).
  // Starts empty on first-ever load — real listings come only from admins/superadmins.
  useEffect(() => {
    if (REMOTE) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEYS.listings, true);
        if (!cancelled && res && res.value) {
          setListings(JSON.parse(res.value));
        } else {
          await window.storage.set(STORAGE_KEYS.listings, JSON.stringify(listings), true);
        }
      } catch (e) {
        try {
          await window.storage.set(STORAGE_KEYS.listings, JSON.stringify(listings), true);
        } catch (e2) {
          /* storage unavailable — continue with an empty list */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (REMOTE) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEYS.agents, true);
        if (!cancelled && res && res.value) {
          setAgents(JSON.parse(res.value));
        } else {
          await window.storage.set(STORAGE_KEYS.agents, JSON.stringify(agents), true);
        }
      } catch (e) {
        try {
          await window.storage.set(STORAGE_KEYS.agents, JSON.stringify(agents), true);
        } catch (e2) {
          /* storage unavailable — continue with an empty list */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshRemote = async () => {
    try {
      const data = await fetchRemoteData(Boolean(currentUser && currentUser.role === "superadmin"), Boolean(currentUser));
      setListings(data.listings);
      setAgents(data.agents);
      if (data.admins) setAdmins(data.admins);
    } catch (e) {
      /* keep what is on screen */
    } finally {
      setDataReady(true);
    }
  };
  refreshRemoteRef.current = refreshRemote;

  useEffect(() => {
    if (REMOTE) return undefined;
    const t = setTimeout(() => setDataReady(true), 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!REMOTE) return undefined;
    refreshRemote();
    const interval = setInterval(() => {
      if (!document.hidden) refreshRemote();
    }, currentUser && currentUser.role === "superadmin" ? 15000 : 120000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser && currentUser.email, currentUser && currentUser.role, account && account.id]);

  const reportSyncError = (err) => {
    setSyncError(friendlySyncError(err));
    setTimeout(() => setSyncError(""), 8000);
  };
  const remoteUpdate = (table, listRef, setter, next, toRow) => {
    const prev = listRef.current;
    setter(next);
    syncRows(table, prev, next, toRow)
      .catch(reportSyncError)
      .finally(() => {
        if (refreshRemoteRef.current) refreshRemoteRef.current();
      });
  };

  const updateListings = (next) => {
    if (REMOTE) {
      remoteUpdate("listings", listingsRef, setListings, next, listingToRow);
      return;
    }
    setListings(next);
    window.storage?.set(STORAGE_KEYS.listings, JSON.stringify(next), true).catch(() => {});
  };

  const updateAgents = (next) => {
    if (REMOTE) {
      remoteUpdate("agents", agentListRef, setAgents, next, agentToRow);
      return;
    }
    setAgents(next);
    window.storage?.set(STORAGE_KEYS.agents, JSON.stringify(next), true).catch(() => {});
  };

  useEffect(() => {
    if (REMOTE) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEYS.admins, true);
        if (!cancelled && res && res.value) setAdmins(JSON.parse(res.value));
      } catch (e) {
        /* no admins saved yet — continue with empty list */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateAdmins = (next) => {
    if (REMOTE) {
      remoteUpdate("staff", adminListRef, setAdmins, next, staffToRow);
      return;
    }
    setAdmins(next);
    window.storage?.set(STORAGE_KEYS.admins, JSON.stringify(next), true).catch(() => {});
  };

  // Real usage tracking: increments are batched in memory and flushed to shared
  // storage every few seconds, so the admin Overview reflects genuine visits
  // to this site rather than fabricated numbers.
  const flushStats = async () => {
    const pending = pendingStatsRef.current;
    pendingStatsRef.current = {};
    statsFlushScheduled.current = false;
    if (REMOTE) {
      if (!Object.keys(pending).length) return;
      try {
        const session = await getValidSession();
        await sbRequest("/rest/v1/rpc/log_events", { method: "POST", token: session ? session.access_token : undefined, body: { deltas: pending } });
      } catch (e) {
        /* stats are best-effort only */
      }
      return;
    }
    try {
      const res = await window.storage.get(STORAGE_KEYS.stats, true);
      const current = res && res.value ? JSON.parse(res.value) : {};
      const merged = { ...current };
      Object.entries(pending).forEach(([key, amount]) => {
        merged[key] = (merged[key] || 0) + amount;
      });
      await window.storage.set(STORAGE_KEYS.stats, JSON.stringify(merged), true);
    } catch (e) {
      /* stats are best-effort only */
    }
  };

  const logEvent = (key, amount = 1) => {
    pendingStatsRef.current[key] = (pendingStatsRef.current[key] || 0) + amount;
    if (!statsFlushScheduled.current) {
      statsFlushScheduled.current = true;
      setTimeout(flushStats, 4000);
    }
  };

  useEffect(() => {
    if (!scrollTarget) return;
    const id = requestAnimationFrame(() => {
      if (scrollTarget === "top") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const refMap = { agents: agentsRef, cta: ctaRef, hero: heroRef, featured: featuredRef };
        refMap[scrollTarget]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      setScrollTarget(null);
    });
    return () => cancelAnimationFrame(id);
  }, [scrollTarget, page]);

  const scrollTo = (ref) => {
    setMenuOpen(false);
    ref?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goHome = () => {
    setPage("home");
    setScrollTarget("top");
    setMenuOpen(false);
  };

  const switchListingCategory = (key) => {
    setListingCategory(key);
    if (key !== "all") setActiveTab(key);
    if (key === "all") {
      setSecondary("Any");
      setBudget(TAB_META.buy.budgetOptions[0]);
    } else {
      setSecondary(TAB_META[key].secondaryOptions[0]);
      setBudget(TAB_META[key].budgetOptions[0]);
    }
    setSortBy(SORT_OPTIONS[0]);
  };

  const goToListings = (key, { resetFilters = true } = {}) => {
    if (resetFilters) {
      switchListingCategory(key);
      setLocation("");
    } else {
      setListingCategory(key);
      if (key !== "all") setActiveTab(key);
      logEvent("searches");
    }
    logEvent("pageViews");
    if (key !== "all") logEvent(`${key}Views`);
    setPage("listings");
    setScrollTarget("top");
    setMenuOpen(false);
  };

  const handleClearFilters = () => {
    switchListingCategory(listingCategory);
    setLocation("");
  };

  const goToAgents = () => {
    setPage("agents");
    setScrollTarget("top");
    setMenuOpen(false);
    logEvent("pageViews");
  };

  const goToAdvertise = () => {
    setPage("advertise");
    setScrollTarget("top");
    setMenuOpen(false);
    logEvent("pageViews");
  };
  const goToPrivacy = () => {
    setPage("privacy");
    setScrollTarget("top");
    setMenuOpen(false);
    logEvent("pageViews");
  };
  const goToTerms = () => {
    setPage("terms");
    setScrollTarget("top");
    setMenuOpen(false);
    logEvent("pageViews");
  };
  const goToVerification = () => {
    setPage("verification");
    setScrollTarget("top");
    setMenuOpen(false);
    logEvent("pageViews");
  };

  const goToProfile = () => {
    setPage("profile");
    setScrollTarget("top");
    setMenuOpen(false);
  };

  const handleLogout = () => {
    if (REMOTE) {
      handleAccountLogout();
      return;
    }
    setCurrentUser(null);
    goHome();
  };

  const handleNavClick = (key) => {
    if (key === "agents") {
      goToAgents();
      return;
    }
    goToListings(key);
  };

  const locked = AUTH_ENABLED && !account && !currentUser;
  const GATE_LISTING_MESSAGE = "Create a free account to see the full details of this property and contact the agent.";
  const GATE_AGENT_MESSAGE = "Create a free account to see agent details and get in touch.";

  const openListing = (id) => {
    if (locked) {
      saveIntent(`/listing/${id}`);
      openAuth("signup", GATE_LISTING_MESSAGE);
      return;
    }
    viewProperty(id);
  };
  const requireAccountForAgents = () => {
    saveIntent("/agents");
    openAuth("signup", GATE_AGENT_MESSAGE);
  };

  const closeSearchSheet = () => setSearchSheetOpen(false);
  const handleShortcut = (key) => {
    if (key === "agents") {
      if (locked) requireAccountForAgents();
      else goToAgents();
      return;
    }
    goToListings(key);
  };

  // The mobile search sheet has no place on a wide screen, so close it if the window grows.
  useEffect(() => {
    if (!searchSheetOpen || !window.matchMedia) return undefined;
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => mq.matches && setSearchSheetOpen(false);
    mq.addEventListener ? mq.addEventListener("change", onChange) : mq.addListener(onChange);
    return () => (mq.removeEventListener ? mq.removeEventListener("change", onChange) : mq.removeListener(onChange));
  }, [searchSheetOpen]);

  // Someone arriving straight on a listing address (for example from WhatsApp) sees the sign-up pop-up once.
  useEffect(() => {
    if (!(page === "detail" && locked && authChecked)) return;
    if (gateAutoFor.current === selectedPropertyId) return;
    gateAutoFor.current = selectedPropertyId;
    saveIntent(`/listing/${selectedPropertyId}`);
    setAuthIntro(GATE_LISTING_MESSAGE);
    setAuthTab("signup");
    setAuthOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, locked, authChecked, selectedPropertyId]);

  const viewProperty = (id) => {
    setSelectedPropertyId(id);
    logEvent("pageViews");
    logEvent("propertyDetailViews");
    setPage("detail");
    setScrollTarget("top");
    setMenuOpen(false);
  };


  // ---------- Every page has its own web address ----------
  const pathForState = () => {
    if (page === "listings") return listingCategory === "all" ? "/listings" : `/${listingCategory}`;
    if (page === "detail" && selectedPropertyId !== null) return `/listing/${selectedPropertyId}`;
    if (page === "agents") return "/agents";
    if (page === "advertise") return "/advertise";
    if (page === "privacy") return "/privacy";
    if (page === "terms") return "/terms";
    if (page === "verification") return "/verification";
    if (page === "profile") return "/saved";
    if (page === "admin") return "/admin";
    return "/";
  };
  const applyPath = (path) => {
    const clean = path.replace(/\/+$/, "") || "/";
    const detail = clean.match(/^\/listing\/(\d+)$/);
    if (detail) {
      setSelectedPropertyId(Number(detail[1]));
      setPage("detail");
    } else if (clean === "/agents") {
      setPage("agents");
    } else if (clean === "/advertise") {
      setPage("advertise");
    } else if (clean === "/privacy") {
      setPage("privacy");
    } else if (clean === "/terms") {
      setPage("terms");
    } else if (clean === "/verification") {
      setPage("verification");
    } else if (clean === "/saved") {
      setPage("profile");
    } else if (clean === "/admin") {
      setPage("admin");
    } else if (clean === "/listings") {
      switchListingCategory("all");
      setLocation("");
      setPage("listings");
    } else if (["/buy", "/rent", "/commercial", "/land"].includes(clean)) {
      switchListingCategory(clean.slice(1));
      setLocation("");
      setPage("listings");
    } else {
      setPage("home");
    }
    setScrollTarget("top");
  };
  useEffect(() => {
    applyPath(window.location.pathname);
    setRouterReady(true);
    const onPop = () => applyPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (firstPageRender.current) {
      firstPageRender.current = false;
      return;
    }
    if (page === "admin") return;
    const el = document.getElementById("main");
    if (el) el.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, selectedPropertyId, listingCategory]);

  useEffect(() => {
    if (!routerReady) return;
    const path = pathForState();
    if (window.location.pathname !== path) window.history.pushState(null, "", path);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routerReady, page, listingCategory, selectedPropertyId]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setSecondary(TAB_META[key].secondaryOptions[0]);
    setBudget(TAB_META[key].budgetOptions[0]);
  };

  const listingFilterMeta =
    listingCategory === "all"
      ? { secondaryLabel: null, secondaryOptions: [], budgetOptions: TAB_META.buy.budgetOptions }
      : TAB_META[listingCategory];

  const approvedListings = useMemo(() => listings.filter((l) => l.status === "approved"), [listings]);

  const filteredProperties = useMemo(() => {
    let list = approvedListings.filter((p) => (listingCategory === "all" ? true : p.tag.toLowerCase() === listingCategory));

    if (location.trim()) {
      const q = location.trim().toLowerCase();
      list = list.filter((p) => p.location.toLowerCase().includes(q));
    }

    if (listingCategory !== "all") {
      list = list.filter((p) => matchesSecondary(p, listingCategory, secondary));
    }

    const [min, max] = BUDGET_RANGES[budget] || [0, Infinity];
    list = list.filter((p) => p.priceValue >= min && p.priceValue <= max);

    const sorted = [...list];
    if (sortBy === "Price: Low to High") sorted.sort((a, b) => a.priceValue - b.priceValue);
    else if (sortBy === "Price: High to Low") sorted.sort((a, b) => b.priceValue - a.priceValue);
    else sorted.sort((a, b) => Number(isFeatured(b)) - Number(isFeatured(a)) || b.id - a.id);
    return sorted;
  }, [approvedListings, listingCategory, location, secondary, budget, sortBy]);

  const homeFeatured = useMemo(() => {
    const promoted = approvedListings.filter(isFeatured);
    const rest = approvedListings.filter((l) => !isFeatured(l));
    return [...promoted, ...rest].slice(0, 8);
  }, [approvedListings]);

  // The home carousel shows promoted (featured) listings only: newest first, at most five.
  const heroFeatured = useMemo(() => approvedListings.filter(isFeatured).sort((a, b) => b.id - a.id).slice(0, 5), [approvedListings]);

  const selectedProperty = approvedListings.find((p) => p.id === selectedPropertyId) || null;

  useEffect(() => {
    const base = SITE_CONFIG.name;
    let title = `${base} | Where property meets possibilities`;
    let desc = "Browse homes for sale, rentals, commercial spaces and land. Hao yangu realtors: where property meets possibilities.";
    const names = { buy: "Homes for sale", rent: "Homes to rent", commercial: "Commercial spaces", land: "Land for sale", all: "All listings" };
    if (page === "listings") title = `${names[listingCategory] || "Listings"} | ${base}`;
    else if (page === "agents") title = `Our agents | ${base}`;
    else if (page === "advertise") title = `Promote your listing | ${base}`;
    else if (page === "privacy") title = `Privacy Policy | ${base}`;
    else if (page === "terms") title = `Terms of Use | ${base}`;
    else if (page === "verification") title = `What Verified means | ${base}`;
    else if (page === "profile") title = `Saved properties | ${base}`;
    else if (page === "admin") title = `Staff sign in | ${base}`;
    else if (page === "detail" && selectedProperty) {
      title = `${selectedProperty.title}, ${selectedProperty.location} | ${base}`;
      desc = (selectedProperty.description || "").slice(0, 155) || desc;
    }
    document.title = title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", desc);
  }, [page, listingCategory, selectedProperty]);
  const similarProperties = useMemo(() => {
    if (!selectedProperty) return [];
    return approvedListings.filter((p) => p.tag === selectedProperty.tag && p.id !== selectedProperty.id).slice(0, 3);
  }, [approvedListings, selectedProperty]);
  const currentCategory =
    page === "listings"
      ? listingCategory
      : page === "detail" && selectedProperty
      ? selectedProperty.tag.toLowerCase()
      : page === "agents"
      ? "agents"
      : null;

  const toggleFavorite = (id) => {
    const adding = !favorites.has(id);
    logEvent("favorites");
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    if (account) {
      getValidSession()
        .then((session) => {
          if (!session) return null;
          return adding ? favoritesApi.add(session.access_token, [id]) : favoritesApi.remove(session.access_token, id);
        })
        .catch(() => {});
    }
  };

  const openAuth = (tab = "login", intro = "") => {
    if (!intro) clearIntent();
    setAuthIntro(intro);
    setAuthTab(tab);
    setAuthError("");
    setAuthNotice("");
    setShowPw(false);
    setAuthAgree(false);
    setAuthForm((f) => ({ ...f, password: "", confirm: "", website: "" }));
    setAuthOpen(true);
    setMenuOpen(false);
  };
  const closeAuth = () => setAuthOpen(false);
  const switchAuthTab = (tab) => {
    setAuthTab(tab);
    setAuthError("");
    setAuthNotice("");
    setShowPw(false);
  };

  const favoritesRef = useRef(favorites);
  favoritesRef.current = favorites;

  const establishSession = (session) => {
    saveSession(session);
    setAccount(session.user);
    const intent = takeIntent();
    if (intent) applyPath(intent);
  };

  // Restore a saved login, or finish a confirmation / password-reset link opened from an email.
  useEffect(() => {
    if (!AUTH_ENABLED) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const token = params.get("access_token");
        if (params.get("error")) {
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
          setAuthTab("login");
          setAuthError("That email link has expired or was already used. Please request a new one.");
          setAuthOpen(true);
        } else if (token) {
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
          if (params.get("type") === "recovery") {
            recoveryTokenRef.current = token;
            setAuthTab("recovery");
            setAuthOpen(true);
          } else {
            const user = await authApi.getUser(token);
            const session = {
              access_token: token,
              refresh_token: params.get("refresh_token"),
              expires_at: Math.floor(Date.now() / 1000) + (Number(params.get("expires_in")) || 3600),
              user: toAccount(user),
            };
            saveSession(session);
            if (!cancelled) {
              setAccount(session.user);
              const intent = takeIntent();
              if (intent) applyPath(intent);
            }
          }
        } else {
          const session = await getValidSession();
          if (!cancelled && session) setAccount(session.user);
        }
      } catch (e) {
        /* stay logged out */
      } finally {
        if (!cancelled) setAuthChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // When someone logs in, merge what they saved on this device with what is saved on their account.
  useEffect(() => {
    if (!account) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const session = await getValidSession();
        if (!session) return;
        const remote = await favoritesApi.list(session.access_token);
        const local = [...favoritesRef.current];
        const missing = local.filter((id) => !remote.includes(id));
        if (missing.length) await favoritesApi.add(session.access_token, missing);
        if (!cancelled) setFavorites(new Set([...remote, ...local]));
      } catch (e) {
        /* keep working with the local list */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [account && account.id]);

  // Staff are ordinary accounts whose confirmed email is on the staff list; the database decides.
  useEffect(() => {
    if (!REMOTE) return undefined;
    if (!account) {
      setCurrentUser(null);
      setStaffState("unknown");
      return undefined;
    }
    let cancelled = false;
    setStaffState("unknown");
    (async () => {
      try {
        const session = await getValidSession();
        if (!session) return;
        const profile = await sbRequest("/rest/v1/rpc/my_staff_profile", { method: "POST", token: session.access_token, body: {} });
        if (cancelled) return;
        if (!(profile && profile.role)) {
          setCurrentUser(null);
          setStaffState("none");
          return;
        }
        let factors = [];
        try {
          factors = verifiedTotpFactors(await authApi.getUser(session.access_token));
        } catch (e) {
          factors = [];
        }
        if (cancelled) return;
        if (factors.length > 0 && jwtAal(session.access_token) !== "aal2") {
          setMfaFactorId(factors[0].id);
          setCurrentUser(null);
          setStaffState("mfa-code");
          return;
        }
        if (factors.length === 0 && profile.mfa_required) {
          setCurrentUser(null);
          setStaffState("mfa-enrol");
          return;
        }
        const isSuper = profile.role === "superadmin";
        setCurrentUser({
          name: displayNameFor(account.email, profile.name, account.name),
          avatar: account.avatar || "",
          email: account.email,
          isSuperAdmin: isSuper,
          role: isSuper ? "superadmin" : "admin",
          agency: profile.agency || "",
          adminId: profile.id,
          mfa: factors.length > 0,
        });
        setStaffState("staff");
      } catch (e) {
        if (!cancelled) setStaffState("none");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account && account.id, mfaTick]);

  const handleMfaCode = async (code) => {
    const session = await getValidSession();
    if (!session) throw Object.assign(new Error("Not signed in"), { status: 401 });
    const challenge = await authApi.mfaChallenge(session.access_token, mfaFactorId);
    const upgraded = await authApi.mfaVerify(session.access_token, mfaFactorId, challenge.id, code);
    establishSession(upgraded);
    setMfaTick((t) => t + 1);
  };
  const handleMfaDone = (upgraded) => {
    establishSession(upgraded);
    setMfaTick((t) => t + 1);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (authBusy) return;
    const email = authForm.email.trim().toLowerCase();
    const { password, confirm, name, website } = authForm;
    setAuthError("");
    setAuthNotice("");
    if (website) return; // hidden field only bots fill in
    if (authTab !== "recovery" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAuthError("Enter a valid email address.");
      return;
    }
    if (authTab === "signup" && !name.trim()) {
      setAuthError("Please enter your name.");
      return;
    }
    if (authTab === "signup" && !authAgree) {
      setAuthError("Please tick the box to agree to the Terms of Use and Privacy Policy.");
      return;
    }
    if (authTab === "signup" || authTab === "recovery") {
      if (!(password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password))) {
        setAuthError("Use at least 8 characters, with letters and a number.");
        return;
      }
      if (password !== confirm) {
        setAuthError("The two passwords don't match.");
        return;
      }
    }
    if (TURNSTILE_SITE_KEY && authTab !== "recovery" && !captchaToken) {
      setAuthError("Please complete the security check.");
      return;
    }
    setAuthBusy(true);
    try {
      if (authTab === "login") {
        establishSession(await authApi.signIn(email, password, captchaToken));
        setAuthOpen(false);
      } else if (authTab === "signup") {
        const result = await authApi.signUp(email, password, name.trim(), captchaToken);
        if (result.session) {
          establishSession(result.session);
          setAuthOpen(false);
        } else {
          setAuthTab("login");
          setAuthForm((f) => ({ ...f, password: "", confirm: "" }));
          setAuthNotice(`Almost there! We sent a confirmation link to ${email}. Open it to activate your account, then log in.`);
        }
      } else if (authTab === "forgot") {
        await authApi.recover(email, captchaToken);
        setAuthNotice("If an account exists for that email, a reset link is on its way. Check your inbox.");
      } else if (authTab === "recovery") {
        await authApi.updateUser(recoveryTokenRef.current, { password });
        recoveryTokenRef.current = null;
        setAuthTab("login");
        setAuthForm((f) => ({ ...f, password: "", confirm: "" }));
        setAuthNotice("Password updated. You can now log in.");
      }
    } catch (err) {
      setAuthError(friendlyAuthError(err, authTab));
    } finally {
      setAuthBusy(false);
      if (TURNSTILE_SITE_KEY) {
        setCaptchaToken("");
        setCaptchaReset((n) => n + 1);
      }
    }
  };

  const handleAccountLogout = async () => {
    const session = await getValidSession();
    clearSession();
    setAccount(null);
    setCurrentUser(null);
    setStaffState("unknown");
    setFavorites(new Set()); // don't leave one person's saved list on a shared device
    setMenuOpen(false);
    goHome();
    if (session) authApi.signOut(session.access_token);
  };

  const handlePhotoSaved = (url) => {
    setAccount((a) => (a ? { ...a, avatar: url } : a));
    setCurrentUser((u) => (u ? { ...u, avatar: url } : u));
    setPhotoModalOpen(false);
  };

  const updateAccountName = async (user) => {
    setAccount((a) => (a ? { ...a, name: user.name } : a));
    const session = await getValidSession();
    if (!session) return;
    try {
      await authApi.updateUser(session.access_token, { data: { full_name: user.name } });
      saveSession({ ...session, user: { ...session.user, name: user.name } });
    } catch (err) {
      /* the new name still shows on this device */
    }
  };

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify([...favorites]));
    } catch (e) {
      /* ignore */
    }
  }, [favorites]);

  const verifiedAgents = useMemo(() => agents.filter((a) => a.status === "verified"), [agents]);
  const liveStats = [
    { target: approvedListings.length, prefix: "", suffix: "", comma: true, label: "Active listings" },
    { target: verifiedAgents.length, prefix: "", suffix: "", comma: true, label: "Verified agents" },
    {
      target: new Set(approvedListings.map((l) => String(l.location || "").split(",").pop().trim().toLowerCase()).filter(Boolean)).size,
      prefix: "",
      suffix: "",
      comma: false,
      label: "Locations covered",
    },
  ];

  return (
    <div className="pk-root" data-theme={theme}>
      {syncError && (
        <div
          role="alert"
          className="pk-admin-notice"
          style={{ position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)", width: "min(520px, calc(100% - 32px))", zIndex: 1000, background: "var(--surface)", color: "var(--brick)", border: "1.5px solid var(--brick)" }}
        >
          {syncError}
        </div>
      )}

      {showLoader && <LoadingScreen fadingOut={!appLoading} />}

      {page === "admin" ? (
        currentUser?.role === "superadmin" ? (
          <AdminConsole
            theme={theme}
            setTheme={setTheme}
            adminName={currentUser?.name}
            onExit={goHome}
            listings={listings}
            onUpdateListings={updateListings}
            agents={agents}
            onUpdateAgents={updateAgents}
            admins={admins}
            onUpdateAdmins={updateAdmins}
          />
        ) : currentUser?.role === "admin" ? (
          <AgencyAdminConsole
            theme={theme}
            setTheme={setTheme}
            onExit={goHome}
            currentAdmin={currentUser}
            listings={listings}
            onUpdateListings={updateListings}
            agents={agents}
            onUpdateAgents={updateAgents}
          />
        ) : (
REMOTE ? (
          <RemoteStaffGate
            account={account}
            staffState={staffState}
            onLogin={async (email, password, captcha) => {
              establishSession(await authApi.signIn(email, password, captcha));
            }}
            onVerifyCode={handleMfaCode}
            onMfaDone={handleMfaDone}
            onLogout={handleAccountLogout}
            onExit={goHome}
          />
        ) : (
import.meta.env.PROD ? (
          <div className="pk-admin-gate">
            <div className="pk-admin-gate-card">
              <div className="flex justify-center mb-4">
          <LogoMark size={44} />
        </div>
        <div className="pk-admin-gate-icon">
                <Lock size={22} />
              </div>
              <h1 className="pk-display text-2xl font-semibold mb-1">Staff sign in isn't set up</h1>
              <p className="pk-ink-soft text-sm mb-6">This site needs its Supabase settings before staff can sign in.</p>
              <button className="pk-admin-gate-back" onClick={goHome}>
                ← Back to site
              </button>
            </div>
          </div>
        ) : (
          <StaffGate admins={admins} onAuthenticate={(user) => { setCurrentUser(user); }} onExit={goHome} />
        )
        )
        )
      ) : (
      <>
      <a
        href="#main"
        className="pk-skip-link"
        onClick={(e) => {
          e.preventDefault();
          const el = document.getElementById("main");
          if (el) {
            el.focus();
            el.scrollIntoView();
          }
        }}
      >
        Skip to main content
      </a>

      {/* ---------------- HEADER ---------------- */}
      <header className={`pk-header ${scrolled ? "pk-scrolled" : ""}`}>
        <div className="mx-auto max-w-7xl px-4 md:px-8 flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={goHome}>
            <LogoMark />
            <span className="pk-display pk-wordmark">
              Hao yangu realtors
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.key}
                className={`pk-navlink ${currentCategory === link.key ? "pk-navlink-active" : ""}`}
                onClick={() => handleNavClick(link.key)}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button className="pk-icon-btn" aria-label="Toggle theme" onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}>
              {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
            </button>
            {currentUser ? (
              <>
                {(currentUser.isSuperAdmin || currentUser.role === "admin") && (
                  <button className="pk-btn-outline" onClick={() => setPage("admin")}>
                    <Shield size={15} /> Dashboard
                  </button>
                )}
                <button className="pk-user-chip" title={currentUser.email} onClick={goToProfile}>
                  <Avatar name={currentUser.name} src={currentUser.avatar} size={30} />
                  <span>{currentUser.name}</span>
                </button>
                <button className="pk-icon-btn" aria-label="Log out" onClick={handleLogout}>
                  <LogOut size={15} />
                </button>
              </>
            ) : account ? (
              <>
                <button className="pk-btn-outline" onClick={goToProfile}>
                  <Heart size={15} /> <span className="hidden xl:inline">Saved</span>{favorites.size > 0 ? ` (${favorites.size})` : ""}
                </button>
                <button className="pk-user-chip" title={account.email} onClick={goToProfile}>
                  <Avatar name={account.name} src={account.avatar} size={30} />
                  <span>{account.name}</span>
                </button>
                <button className="pk-icon-btn" aria-label="Log out" onClick={handleAccountLogout}>
                  <LogOut size={15} />
                </button>
              </>
            ) : (
              <>
                <button className="pk-btn-outline" onClick={goToProfile}>
                  <Heart size={15} /> <span className="hidden xl:inline">Saved</span>{favorites.size > 0 ? ` (${favorites.size})` : ""}
                </button>
                {AUTH_ENABLED ? (
                  <>
                    <button className="pk-btn-outline" onClick={() => openAuth("login")}>
                      Log in
                    </button>
                    <button className="pk-btn-primary" onClick={() => openAuth("signup")}>
                      <UserPlus size={15} /> Create account
                    </button>
                  </>
                ) : (
                  <a className="pk-btn-primary" href={`mailto:${SITE_CONFIG.contactEmail}`}>
                    <Mail size={15} /> Contact us
                  </a>
                )}
              </>
            )}
          </div>

          <div className="flex md:hidden items-center gap-2">
            <button className="pk-icon-btn" aria-label="Toggle theme" onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}>
              {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
            </button>
            <button className="pk-icon-btn" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
              <Menu size={19} />
            </button>
          </div>
        </div>
      </header>

      {/* ---------------- MOBILE DRAWER ---------------- */}
      <div className={`pk-overlay ${menuOpen ? "pk-open" : ""}`} onClick={() => setMenuOpen(false)} />
      <aside ref={drawerRef} className={`pk-drawer ${menuOpen ? "pk-open" : ""}`} aria-hidden={!menuOpen} inert={menuOpen ? undefined : ""} role="dialog" aria-modal="true" aria-label="Menu">
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div className="flex items-center gap-2.5">
            <LogoMark size={30} />
            <span className="pk-display" style={{ fontSize: "1.2rem" }}>Hao yangu realtors</span>
          </div>
          <button className="pk-icon-btn" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {(currentUser || account) && (
          <div className="px-6 pt-2 pb-1">
            <button className="pk-drawer-profile" title={(currentUser || account).email} onClick={goToProfile}>
              <Avatar name={(currentUser || account).name} src={(currentUser || account).avatar} size={34} />
              <span className="flex-1 truncate">{(currentUser || account).name}</span>
              <ChevronRight size={16} className="pk-ink-soft" />
            </button>
          </div>
        )}

        <div className="px-6 flex-1 overflow-y-auto mt-2">
          {NAV_LINKS.map((link) => (
            <button
              key={link.key}
              className={`pk-drawer-link w-full text-left ${currentCategory === link.key ? "pk-primary-text" : ""}`}
              onClick={() => handleNavClick(link.key)}
            >
              {link.label} <ChevronRight size={18} className="pk-ink-soft" />
            </button>
          ))}
        </div>
        <div className="px-6 pb-8 pt-4 flex flex-col gap-3">
          {currentUser ? (
            <>
              {(currentUser.isSuperAdmin || currentUser.role === "admin") && (
                <button className="pk-btn-outline justify-center" onClick={() => { setPage("admin"); setMenuOpen(false); }}>
                  <Shield size={15} /> Dashboard
                </button>
              )}
              <button className="pk-btn-outline justify-center" onClick={() => { handleLogout(); setMenuOpen(false); }}>
                <LogOut size={15} /> Log out
              </button>
            </>
          ) : account ? (
            <>
              <button className="pk-btn-outline justify-center" onClick={goToProfile}>
                <Heart size={15} /> Saved{favorites.size > 0 ? ` (${favorites.size})` : ""}
              </button>
              <button className="pk-btn-outline justify-center" onClick={handleAccountLogout}>
                <LogOut size={15} /> Log out
              </button>
            </>
          ) : (
            <>
              <button className="pk-btn-outline justify-center" onClick={goToProfile}>
                <Heart size={15} /> Saved{favorites.size > 0 ? ` (${favorites.size})` : ""}
              </button>
              {AUTH_ENABLED ? (
                <>
                  <button className="pk-btn-outline justify-center" onClick={() => openAuth("login")}>
                    Log in
                  </button>
                  <button className="pk-btn-primary justify-center" onClick={() => openAuth("signup")}>
                    <UserPlus size={15} /> Create account
                  </button>
                </>
              ) : (
                <a className="pk-btn-primary justify-center" href={`mailto:${SITE_CONFIG.contactEmail}`}>
                  <Mail size={15} /> Contact us
                </a>
              )}
            </>
          )}
        </div>
      </aside>

      <main id="main" tabIndex={-1} className="pk-main">
      {page === "home" && (
      <>
      {/* ---------------- HERO ---------------- */}
      <section ref={heroRef} className="mx-auto max-w-7xl px-4 md:px-8 pt-6 md:pt-12 pb-12 md:pb-16">
        <div className="pk-hero-grid">
          <div>
            <p className="pk-mono pk-hero-eyebrow pk-primary-text uppercase mb-4">
              Live in Nakuru · more areas coming soon
            </p>
            <h1 className="pk-display pk-hero-heading">
              Where property meets <span className="pk-accent-text">possibilities</span>.
            </h1>
            <p className="pk-ink-soft mt-5 text-base md:text-lg max-w-md">
              Search homes, offices and plots in Nakuru — filtered by real budget, not guesswork.
            </p>
          </div>
          {heroFeatured.length > 0 ? (
            <HeroCarousel items={heroFeatured} onOpen={openListing} />
          ) : (
            <div className="hidden md:block pk-primary-text opacity-80">
              <svg viewBox="0 0 320 220" width="100%" aria-hidden="true">
                <polyline points="0,150 40,150 60,110 90,150 110,80 140,150 170,120 190,150 220,60 250,150 280,150 300,100 320,150"
                  fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
                <circle cx="255" cy="42" r="20" fill="var(--accent)" opacity="0.9" />
                <rect x="30" y="150" width="26" height="34" fill="currentColor" opacity="0.35" />
                <rect x="95" y="150" width="34" height="42" fill="currentColor" opacity="0.5" />
                <rect x="200" y="150" width="30" height="30" fill="currentColor" opacity="0.3" />
              </svg>
            </div>
          )}
        </div>

        {/* Phone: shortcut icons and one big Search button that opens the search sheet */}
        <div className="md:hidden">
          <HeroShortcuts onPick={handleShortcut} />
          <button type="button" className="pk-hero-search-cta" onClick={() => setSearchSheetOpen(true)}>
            <Search size={18} /> Search Properties <ArrowRight size={18} />
          </button>
        </div>

        {/* Tablet and desktop: slim search card */}
        <div className="hidden md:block mt-8">
          <HeroSearch
            idPrefix="pk"
            activeTab={activeTab}
            onTabChange={handleTabChange}
            location={location}
            setLocation={setLocation}
            secondary={secondary}
            setSecondary={setSecondary}
            budget={budget}
            setBudget={setBudget}
            onSearch={() => goToListings(activeTab, { resetFilters: false })}
          />
        </div>
      </section>

      <SearchSheet open={searchSheetOpen} onClose={closeSearchSheet}>
        <HeroSearch
          idPrefix="pk-sheet"
          sheet
          activeTab={activeTab}
          onTabChange={handleTabChange}
          location={location}
          setLocation={setLocation}
          secondary={secondary}
          setSecondary={setSecondary}
          budget={budget}
          setBudget={setBudget}
          onSearch={() => {
            setSearchSheetOpen(false);
            goToListings(activeTab, { resetFilters: false });
          }}
        />
      </SearchSheet>

      {/* ---------------- STATS ---------------- */}
      {approvedListings.length > 0 && (
      <section className="mx-auto max-w-7xl px-4 md:px-8 pb-14 md:pb-20">
        <div className="pk-stats-band">
          <Roofline className="pk-stats-line" />
          <div className="pk-stats-grid pk-stats-grid-3">
            {liveStats.map((s) => (
              <StatItem key={s.label} stat={s} />
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ---------------- CATEGORIES ---------------- */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 pb-16 md:pb-24">
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <p className="pk-mono text-xs pk-ink-soft uppercase tracking-wide mb-2">Browse by category</p>
            <h2 className="pk-display text-2xl md:text-4xl font-semibold">Whatever you're after, start here.</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {CATEGORIES.map((cat) => {
            const CatIcon = cat.icon;
            const count = approvedListings.filter((l) => l.tag.toLowerCase() === cat.key).length;
            return (
              <button
                key={cat.key}
                onClick={() => handleNavClick(cat.key)}
                className="pk-card text-left p-5 md:p-6 flex flex-col gap-4"
              >
                <div className="pk-category-icon">
                  <CatIcon size={22} />
                </div>
                <div>
                  <h3 className="pk-display text-lg font-semibold mb-1">{cat.title}</h3>
                  <p className="pk-ink-soft text-sm">{cat.blurb}</p>
                </div>
                <div className="pk-mono text-xs pk-primary-text mt-auto pt-2 flex items-center gap-1">
                  {count} listing{count === 1 ? "" : "s"} <ArrowUpRight size={13} />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ---------------- FEATURED PROPERTIES ---------------- */}
      <section ref={featuredRef} className="mx-auto max-w-7xl px-4 md:px-8 pb-16 md:pb-24">
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <p className="pk-mono text-xs pk-ink-soft uppercase tracking-wide mb-2">{approvedListings.some(isFeatured) ? "Featured and latest" : "Latest"}</p>
            <h2 className="pk-display text-2xl md:text-4xl font-semibold">Featured listings</h2>
          </div>
          {approvedListings.length > 0 && (
            <button className="pk-btn-outline hidden md:inline-flex" onClick={() => goToListings("all")}>
              View all <ArrowRight size={15} />
            </button>
          )}
        </div>

        {approvedListings.length === 0 ? (
          <div className="pk-empty-state">
            <HomeIcon size={32} strokeWidth={1.5} className="pk-ink-soft mx-auto mb-4" />
            <h3 className="pk-display text-xl font-semibold mb-2">New listings are on the way</h3>
            <p className="pk-ink-soft text-sm max-w-sm mx-auto">
              Our team is adding properties now. Check back soon, or email us to ask about upcoming listings.
            </p>
          </div>
        ) : (
          <>
            <div className="pk-scroller md:grid md:grid-cols-4 md:gap-6">
              {homeFeatured.map((p) => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  isFavorite={favorites.has(p.id)}
                  onToggleFavorite={toggleFavorite}
                  onSelect={openListing}
                  style={{ width: "78vw", maxWidth: 300 }}
                />
              ))}
            </div>
            <button className="pk-btn-outline w-full justify-center mt-6 md:hidden" onClick={() => goToListings("all")}>
              View all listings <ArrowRight size={15} />
            </button>
            <p className="pk-ink-soft text-xs mt-4">
              Listings marked Featured are promoted by their agents.{" "}
              <button className="pk-primary-text font-semibold underline" onClick={goToAdvertise}>Promote yours</button>
            </p>
          </>
        )}
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 pb-16 md:pb-24">
        <p className="pk-mono text-xs pk-ink-soft uppercase tracking-wide mb-2">How it works</p>
        <h2 className="pk-display text-2xl md:text-4xl font-semibold mb-10">Three steps to your hao.</h2>
        <div className="grid md:grid-cols-3 gap-8 md:gap-6">
          {STEPS.map((step, i) => (
            <div key={step.n}>
              <div className="pk-step-num">{step.n}</div>
              <Roofline className="pk-primary-text my-3" style={{ maxWidth: 80, height: 12 }} />
              <h3 className="pk-display text-xl font-semibold mb-2">{step.title}</h3>
              <p className="pk-ink-soft text-sm leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- AGENTS ---------------- */}
      {verifiedAgents.length > 0 && (
      <section ref={agentsRef} className="mx-auto max-w-7xl px-4 md:px-8 pb-16 md:pb-24">
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <p className="pk-mono text-xs pk-ink-soft uppercase tracking-wide mb-2">Trusted network</p>
            <h2 className="pk-display text-2xl md:text-4xl font-semibold">Meet a few of our agents</h2>
          </div>
          <button className="pk-btn-outline hidden md:inline-flex" onClick={goToAgents}>
            <Users size={15} /> View all agents
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {verifiedAgents.map((a) => (
            <div
              key={a.id}
              className="pk-card p-5 flex flex-col items-center text-center gap-2"
              {...(locked
                ? {
                    role: "button",
                    tabIndex: 0,
                    style: { cursor: "pointer" },
                    onClick: requireAccountForAgents,
                    onKeyDown: (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        requireAccountForAgents();
                      }
                    },
                  }
                : {})}
            >
              <ImageWithFallback src={a.img} alt={a.name} className="pk-agent-photo" iconFallback={Users} />
              <h3 className="font-semibold mt-1 flex items-center gap-1">
                {a.name}
                {a.status === "verified" && <VerifiedBadge size={14} />}
              </h3>
              <p className="pk-primary-text text-xs font-semibold">{a.focus}</p>
              <p className="pk-ink-soft text-xs">{a.area}</p>
              <AgentScore rating={a.rating} reviews={a.reviews} />
            </div>
          ))}
        </div>
        <button className="pk-btn-outline w-full justify-center mt-6 md:hidden" onClick={goToAgents}>
          <Users size={15} /> View all agents
        </button>
      </section>
      )}

      {/* ---------------- CONTACT CTA ---------------- */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 pb-16 md:pb-24">
        <div ref={ctaRef} className="pk-cta-band px-6 py-12 md:px-14 md:py-16 flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="max-w-lg">
            <p className="pk-mono text-xs uppercase tracking-wide mb-3 opacity-80">For buyers & renters</p>
            <h2 className="pk-display text-2xl md:text-3xl font-semibold mb-3">Ready to buy or rent?</h2>
            <p className="opacity-85 text-sm md:text-base">
              {AUTH_ENABLED && !account && !currentUser
                ? "Create a free account to save listings and see them on any phone or computer, so you can pick up right where you left off."
                : "Browse reviewed listings across Buy, Rent, Commercial and Land, then contact the listing owner or agent directly. Not sure where to start? Email us and we'll point you in the right direction."}
            </p>
          </div>
          <button
            className="pk-mono flex items-center gap-2 font-semibold px-6 py-3 rounded-full flex-shrink-0"
            style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
            onClick={() => (AUTH_ENABLED && !account && !currentUser ? openAuth("signup") : goToListings("buy", { resetFilters: true }))}
          >
            {AUTH_ENABLED && !account && !currentUser ? (
              <>
                <UserPlus size={17} /> Create free account
              </>
            ) : (
              <>
                <Search size={17} /> Browse listings
              </>
            )}
          </button>
        </div>
      </section>
      </>
      )}

      {page === "listings" && (
        <ListingsPage
          category={listingCategory}
          onCategoryChange={switchListingCategory}
          onBackHome={goHome}
          location={location}
          setLocation={setLocation}
          secondary={secondary}
          setSecondary={setSecondary}
          secondaryLabel={listingFilterMeta.secondaryLabel}
          secondaryOptions={listingFilterMeta.secondaryOptions}
          budget={budget}
          setBudget={setBudget}
          budgetOptions={listingFilterMeta.budgetOptions}
          sortBy={sortBy}
          setSortBy={setSortBy}
          results={filteredProperties}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onSelectProperty={openListing}
          onClearFilters={handleClearFilters}
        />
      )}

      {page === "detail" && locked && authChecked && (
        <section className="mx-auto max-w-2xl px-4 pt-16 md:pt-24 pb-24 text-center">
          {selectedProperty && (
            <div className="mb-6">
              <ImageWithFallback
                src={thumbSrc(selectedProperty.img)}
                fallbackSrc={selectedProperty.img}
                alt={selectedProperty.title}
                className="pk-prop-media-img"
                iconFallback={HomeIcon}
              />
              <h2 className="pk-display text-2xl font-semibold mt-4">{selectedProperty.title}</h2>
              <p className="pk-ink-soft text-sm mt-1">{selectedProperty.location} · {selectedProperty.price}</p>
            </div>
          )}
          <h1 className="pk-display text-3xl font-semibold mb-3">Create a free account to see the full details</h1>
          <p className="pk-ink-soft text-sm mb-6">Descriptions, extra details and contact options are shown to people with an account. It takes a minute.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button className="pk-btn-primary" onClick={() => openAuth("signup", GATE_LISTING_MESSAGE)}>
              <UserPlus size={15} /> Create free account
            </button>
            <button className="pk-btn-outline" onClick={() => openAuth("login")}>
              Log in
            </button>
          </div>
        </section>
      )}

      {page === "detail" && !locked && selectedProperty && selectedProperty.detailsLoaded === false && (
        <section className="mx-auto max-w-3xl px-4 pt-28 pb-24 text-center">
          <p className="pk-ink-soft text-sm">Loading details…</p>
        </section>
      )}

      {page === "detail" && !locked && selectedProperty && selectedProperty.detailsLoaded !== false && (
        <PropertyDetailPage
          key={selectedProperty.id}
          property={selectedProperty}
          category={selectedProperty.tag.toLowerCase()}
          onBackHome={goHome}
          onBackCategory={() => goToListings(selectedProperty.tag.toLowerCase())}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          similar={similarProperties}
          onSelectProperty={openListing}
          onOpenModal={openAuth}
        />
      )}

      {page === "detail" && !locked && !selectedProperty && (
        <section className="mx-auto max-w-3xl px-4 pt-28 pb-24 text-center">
          {dataReady ? (
            <>
              <h1 className="pk-display text-3xl font-semibold mb-3">We couldn't find that listing</h1>
              <p className="pk-ink-soft text-sm mb-6">It may have been sold, rented or taken down.</p>
              <button className="pk-btn-primary" onClick={() => goToListings("all")}>
                Browse all listings
              </button>
            </>
          ) : (
            <p className="pk-ink-soft text-sm">Loading listing…</p>
          )}
        </section>
      )}

      {page === "agents" && <AgentsPage agents={agents} onBackHome={goHome} onOpenModal={openAuth} onOpenVerification={goToVerification} locked={locked} onRequireAccount={requireAccountForAgents} />}

      {page === "advertise" && <AdvertisePage onBackHome={goHome} onBrowse={() => goToListings("all")} />}

      {page === "verification" && <VerificationPage onBackHome={goHome} onOpenAgents={goToAgents} />}

      {page === "privacy" && <PrivacyPage onBackHome={goHome} onOpenTerms={goToTerms} />}

      {page === "terms" && <TermsPage onBackHome={goHome} onOpenPrivacy={goToPrivacy} onOpenVerification={goToVerification} onOpenAdvertise={goToAdvertise} />}

      {page === "profile" && (
        <ProfilePage
          currentUser={currentUser || account}
          onChangePhoto={AUTH_ENABLED && account ? () => setPhotoModalOpen(true) : undefined}
          onUpdateUser={(u) => {
            if (REMOTE || !currentUser) updateAccountName(u);
            if (currentUser) setCurrentUser(u);
          }}
          favorites={favorites}
          listings={approvedListings}
          onToggleFavorite={toggleFavorite}
          onSelectProperty={openListing}
          onBackHome={goHome}
          onLogout={currentUser ? handleLogout : handleAccountLogout}
          onGoAdmin={() => setPage("admin")}
          onOpenModal={AUTH_ENABLED ? openAuth : null}
          securitySlot={REMOTE && currentUser ? <MfaCard enabled={Boolean(currentUser.mfa)} onDone={handleMfaDone} /> : null}
        />
      )}

      </main>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="pk-footer">
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-14">
          <div className="pk-footer-grid">
            <div>
              <div className="flex items-center gap-2.5 mb-4 cursor-pointer" onClick={goHome}>
                <LogoMark size={30} />
                <span className="pk-display" style={{ fontSize: "1.2rem" }}>Hao yangu realtors</span>
              </div>
              <p className="pk-ink-soft text-sm max-w-xs">
                Buy, rent, lease or list — all in one place.
              </p>
              {Object.values(SITE_CONFIG.socials).some(Boolean) && (
                <div className="flex flex-wrap items-center gap-2 mt-5">
                  {[
                    ["facebook", "Facebook", <Facebook size={16} key="f" />],
                    ["instagram", "Instagram", <Instagram size={16} key="i" />],
                    ["twitter", "X (Twitter)", <XIcon size={15} key="x" />],
                    ["youtube", "YouTube", <Youtube size={17} key="y" />],
                    ["tiktok", "TikTok", <TikTokIcon size={16} key="t" />],
                  ].map(([key, label, icon]) =>
                    SITE_CONFIG.socials[key] ? (
                      <a key={key} href={SITE_CONFIG.socials[key]} target="_blank" rel="noopener noreferrer" aria-label={`${label} (opens in a new tab)`} title={label} className="pk-icon-btn">
                        {icon}
                      </a>
                    ) : null
                  )}
                </div>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Explore</h4>
              <ul className="flex flex-col gap-2.5 text-sm">
                <li><button className="pk-footer-link" onClick={() => goToListings("buy", { resetFilters: true })}>Buy a home</button></li>
                <li><button className="pk-footer-link" onClick={() => goToListings("rent", { resetFilters: true })}>Rent a home</button></li>
                <li><button className="pk-footer-link" onClick={() => goToListings("commercial", { resetFilters: true })}>Commercial spaces</button></li>
                <li><button className="pk-footer-link" onClick={() => goToListings("land", { resetFilters: true })}>Land</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Get in touch</h4>
              <ul className="flex flex-col gap-2.5 text-sm">
                <li><a href={`mailto:${SITE_CONFIG.contactEmail}`}>Email us</a></li>
                <li><button className="pk-footer-link" onClick={goToAgents}>Our agents</button></li>
                <li><button className="pk-footer-link" onClick={goToVerification}>What Verified means</button></li>
                <li><button className="pk-footer-link" onClick={goToAdvertise}>Promote your listing</button></li>
                <li>
                  <a href={`mailto:${SITE_CONFIG.contactEmail}?subject=${encodeURIComponent("Joining " + SITE_CONFIG.name + " as an agent")}`}>Join as an agent</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 mt-10 text-xs pk-ink-soft" style={{ borderTop: "1px solid var(--border)" }}>
            <span>© 2026 {SITE_CONFIG.name}. All rights reserved.</span>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              <a href={`mailto:${SITE_CONFIG.contactEmail}`} className="flex items-center gap-1"><Mail size={13} /> {SITE_CONFIG.contactEmail}</a>
              <button onClick={goToPrivacy} className="hover:underline">
                Privacy Policy
              </button>
              <button onClick={goToTerms} className="hover:underline">
                Terms of Use
              </button>
              <button onClick={() => { setPage("admin"); setMenuOpen(false); }} className="hover:underline">
                Staff sign in
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ---------------- PROFILE PHOTO (required after sign-up) ---------------- */}
      {AUTH_ENABLED && authChecked && account && ((!account.avatar && !authOpen) || photoModalOpen) && (
        <ProfilePhotoModal
          account={account}
          required={!account.avatar}
          onClose={() => setPhotoModalOpen(false)}
          onSaved={handlePhotoSaved}
          onLogout={currentUser ? handleLogout : handleAccountLogout}
        />
      )}

      {/* ---------------- ACCOUNT MODAL ---------------- */}
      {AUTH_ENABLED && (
        <div className={`pk-modal-backdrop ${authOpen ? "pk-open" : ""}`} onClick={closeAuth} inert={authOpen ? undefined : ""}>
          <div className="pk-modal" ref={authDialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="pk-auth-title" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <span id="pk-auth-title" className="pk-display text-lg font-semibold">
                {authTab === "forgot" ? "Reset your password" : authTab === "recovery" ? "Choose a new password" : `Welcome to ${SITE_CONFIG.name}`}
              </span>
              <button className="pk-icon-btn" aria-label="Close" onClick={closeAuth}>
                <X size={16} />
              </button>
            </div>

            {authIntro && (
              <p className="pk-admin-notice mb-4" role="status">
                {authIntro}
              </p>
            )}
            {(authTab === "login" || authTab === "signup") && (
              <div className="flex mb-5">
                <button type="button" className={`pk-modal-tab ${authTab === "login" ? "pk-modal-tab-active" : ""}`} onClick={() => switchAuthTab("login")}>
                  Log in
                </button>
                <button type="button" className={`pk-modal-tab ${authTab === "signup" ? "pk-modal-tab-active" : ""}`} onClick={() => switchAuthTab("signup")}>
                  Create account
                </button>
              </div>
            )}
            {authTab === "forgot" && <p className="pk-ink-soft text-sm mb-4">Enter your email and we'll send you a link to set a new password.</p>}

            <form className="flex flex-col gap-3" onSubmit={handleAuthSubmit} noValidate>
              {authTab === "signup" && (
                <label className="text-sm font-medium">
                  Full name
                  <input type="text" autoComplete="name" placeholder="Your full name" value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} />
                </label>
              )}
              {authTab !== "recovery" && (
                <label className="text-sm font-medium">
                  Email
                  <input type="email" autoComplete="email" placeholder="you@email.com" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} />
                </label>
              )}
              {authTab !== "forgot" && (
                <label className="text-sm font-medium">
                  {authTab === "recovery" ? "New password" : "Password"}
                  <div className="pk-input-wrap">
                    <input
                      type={showPw ? "text" : "password"}
                      autoComplete={authTab === "login" ? "current-password" : "new-password"}
                      placeholder="••••••••"
                      value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    />
                    <button
                      type="button"
                      aria-label={showPw ? "Hide password" : "Show password"}
                      onClick={() => setShowPw((v) => !v)}
                      style={{ position: "absolute", right: 10, top: 16, color: "var(--ink-soft)" }}
                    >
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </label>
              )}
              {(authTab === "signup" || authTab === "recovery") && (
                <>
                  <label className="text-sm font-medium">
                    Confirm password
                    <input type={showPw ? "text" : "password"} autoComplete="new-password" placeholder="••••••••" value={authForm.confirm} onChange={(e) => setAuthForm({ ...authForm, confirm: e.target.value })} />
                  </label>
                  <p className="pk-ink-soft text-xs">At least 8 characters, with letters and a number.</p>
                </>
              )}
              {authTab === "signup" && (
                <label className="pk-check-row text-sm">
                  <input type="checkbox" checked={authAgree} onChange={(e) => setAuthAgree(e.target.checked)} />
                  <span>
                    I am 18 or over, I agree to the{" "}
                    <button type="button" className="pk-primary-text font-semibold underline" onClick={() => { setAuthOpen(false); goToTerms(); }}>
                      Terms of Use
                    </button>{" "}
                    and I have read the{" "}
                    <button type="button" className="pk-primary-text font-semibold underline" onClick={() => { setAuthOpen(false); goToPrivacy(); }}>
                      Privacy Policy
                    </button>
                    .
                  </span>
                </label>
              )}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={authForm.website}
                onChange={(e) => setAuthForm({ ...authForm, website: e.target.value })}
                style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
              />
              {authOpen && authTab !== "recovery" && <CaptchaBox onToken={setCaptchaToken} resetSignal={captchaReset} />}
              {authError && <p className="pk-admin-error" role="alert">{authError}</p>}
              {authNotice && <div className="pk-admin-notice" role="status">{authNotice}</div>}
              <button type="submit" className="pk-btn-primary justify-center" disabled={authBusy}>
                {authBusy
                  ? "Please wait…"
                  : authTab === "login"
                  ? "Log in"
                  : authTab === "signup"
                  ? "Create account"
                  : authTab === "forgot"
                  ? "Send reset link"
                  : "Save new password"}
              </button>
            </form>

            {authTab === "login" && (
              <button type="button" className="pk-primary-text text-sm font-semibold mt-4" onClick={() => switchAuthTab("forgot")}>
                Forgot your password?
              </button>
            )}
            {authTab === "forgot" && (
              <button type="button" className="pk-primary-text text-sm font-semibold mt-4" onClick={() => switchAuthTab("login")}>
                ← Back to log in
              </button>
            )}
          </div>
        </div>
      )}

      </>
      )}
    </div>
  );
}
