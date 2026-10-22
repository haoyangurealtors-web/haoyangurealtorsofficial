import React, { useState, useEffect, useRef, useMemo } from "react";
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
  MessageCircle,
} from "lucide-react";
import AdminOverview from "./AdminOverview.jsx";

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

// The chosen look (light or dark) is remembered on this device between visits and refreshes.
const THEME_KEY = "hy-realtors:theme";
function readStoredTheme() {
  try {
    const t = window.localStorage.getItem(THEME_KEY);
    return t === "dark" ? "dark" : "light";
  } catch (e) {
    return "light";
  }
}
// Show the animated welcome screen in full once per browser session; after a refresh it is much shorter.
const SPLASH_KEY = "hy-realtors:splash-seen";
function splashSeen() {
  try {
    return window.sessionStorage.getItem(SPLASH_KEY) === "1";
  } catch (e) {
    return false;
  }
}

const STORAGE_KEYS = {
  listings: "hy-realtors:listings",
  agents: "hy-realtors:agents",
  agencies: "hy-realtors:admins", // same stored key as before, so nothing saved in a browser is lost
  stats: "hy-realtors:usage-stats",
  favorites: "hy-realtors:favorites",
  ratings: "hy-realtors:agent-ratings",
  raterId: "hy-realtors:rater-id",
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
// True once the database has the agents.phone column (see supabase-agent-ratings-and-phone.sql). Until then the
// phone is simply left out of what we save, so the site keeps working before that file has been run.
let agentPhoneColumnReady = false;
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
    phone: typeof r.phone === "string" ? r.phone : "",
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
    ...(a.phone ? { phone: String(a.phone).trim() } : agentPhoneColumnReady && typeof a.phone === "string" ? { phone: "" } : {}),
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
// An agency is a "staff" row with the database role "admin". The database value stays "admin" so existing
// rules keep working; everything the person sees (and the role name used in this file) says "agency".
function staffToRow(a) {
  return { email: String(a.email).toLowerCase(), name: a.name, agency: a.agency, status: a.status, role: "admin" };
}
// An agent login lets one agent sign in to add and remove their own listings. It lives in its own table
// (agent_logins, see supabase-agents-and-agencies.sql) and is matched to the agent by agency + name.
function agentLoginFromRow(r) {
  return {
    id: Number(r.id),
    email: r.email,
    agentName: r.agent_name,
    agency: r.agency || "",
    status: r.status,
  };
}
function agentLoginToRow(a) {
  return { email: String(a.email).toLowerCase(), agent_name: a.agentName, agency: a.agency, status: a.status };
}
const isStaffUser = (u) => Boolean(u) && (u.isSuperAdmin || u.role === "superadmin" || u.role === "agency" || u.role === "agent");
const sameText = (a, b) => String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();

// ---------- Agent ratings and "properties in charge" ----------
const RATING_WORDS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];
function ratingFromRow(r) {
  return {
    id: r.id,
    agentId: Number(r.agent_id),
    userId: r.user_id || "",
    stars: Number(r.stars) || 0,
    comment: r.comment || "",
    raterName: r.rater_name || "",
    createdAt: r.created_at || "",
    updatedAt: r.updated_at || r.created_at || "",
  };
}
// Averages for every rated agent, readable by any signed-in visitor (the database returns no names here).
async function fetchRatingSummary(token) {
  const rows = await sbRequest("/rest/v1/rpc/agent_rating_summary", { method: "POST", token, body: {} });
  const out = {};
  (Array.isArray(rows) ? rows : []).forEach((r) => {
    const count = Number(r.rating_count) || 0;
    if (!count) return;
    out[Number(r.agent_id)] = { count, avg: Number(r.avg_stars) || 0, counts: [r.c1, r.c2, r.c3, r.c4, r.c5].map((n) => Number(n) || 0) };
  });
  return out;
}
const firstNameOf = (name) => String(name || "").trim().split(/\s+/)[0] || "A visitor";
function ratingStats(ratings, agentId) {
  const list = (ratings || []).filter((r) => r.agentId === agentId && r.stars >= 1 && r.stars <= 5);
  const counts = [0, 0, 0, 0, 0];
  list.forEach((r) => {
    counts[r.stars - 1] += 1;
  });
  const count = list.length;
  const sum = counts.reduce((total, c, i) => total + c * (i + 1), 0);
  return { count, avg: count ? sum / count : null, counts, list };
}
// An agent is in charge of the live listings they posted, or that name them as the contact, under their agency.
function agentListings(agent, listings) {
  return (listings || []).filter(
    (l) =>
      l.status === "approved" &&
      sameText(l.agency, agent.agency) &&
      (sameText(l.submittedBy, agent.name) || sameText(l.contact && l.contact.name, agent.name))
  );
}
function phoneProblem(p) {
  const value = String(p || "").trim();
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  if (!/^[+\d][\d\s()+-]*$/.test(value) || digits.length < 9 || digits.length > 15) return "Enter a valid phone number, for example 0712 345 678.";
  return "";
}
function getLocalRaterId() {
  try {
    let id = window.localStorage.getItem(STORAGE_KEYS.raterId);
    if (!id) {
      id = "r" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      window.localStorage.setItem(STORAGE_KEYS.raterId, id);
    }
    return id;
  } catch (e) {
    return "r-session";
  }
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

// Signed-in visitors also get each agent's phone number. If the database hasn't had that column added yet,
// fall back to the public columns so nothing breaks.
async function fetchAgentRows(token) {
  if (token) {
    try {
      const rows = await sbRequest(`/rest/v1/agents?select=${PUBLIC_AGENT_COLUMNS},phone&order=id.asc`, { token });
      agentPhoneColumnReady = true;
      return rows;
    } catch (e) {
      /* the phone column isn't there yet */
    }
  }
  return sbRequest(`/rest/v1/agents?select=${PUBLIC_AGENT_COLUMNS}&order=id.asc`, { token });
}

async function fetchRemoteData(isSuperadmin, isStaff = isSuperadmin) {
  const session = await getValidSession();
  const token = session ? session.access_token : undefined;
  const listingColumns = token ? "*" : PUBLIC_LISTING_COLUMNS;
  const requests = [
    sbRequest(`/rest/v1/listings?select=${listingColumns}&order=id.desc&limit=500`, { token }),
    fetchAgentRows(token),
  ];
  if (token && isSuperadmin) requests.push(sbRequest("/rest/v1/staff?select=*&order=id.asc", { token }));
  const [listingRows, agentRows, staffRows] = await Promise.all(requests);
  // Agencies and the superadmin also see the agent logins they manage (the database only returns their own).
  // Before the database update is applied this table doesn't exist, so a failure here is not an error.
  let loginRows = null;
  if (token && isStaff) {
    try {
      loginRows = await sbRequest("/rest/v1/agent_logins?select=*&order=id.asc", { token });
    } catch (e) {
      loginRows = null;
    }
  }
  // Ratings: the database returns everything to the superadmin, an agency's own agents' ratings to that agency,
  // and only the person's own ratings to anyone else. Before the ratings table exists this is not an error.
  let ratingRows = null;
  if (token) {
    try {
      ratingRows = await sbRequest("/rest/v1/agent_ratings?select=*&order=created_at.desc&limit=3000", { token });
    } catch (e) {
      ratingRows = null;
    }
  }
  let ratingSummary = null;
  if (token) {
    try {
      ratingSummary = await fetchRatingSummary(token);
    } catch (e) {
      ratingSummary = null; // supabase-agent-ratings-visible.sql hasn't been run yet
    }
  }
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
  if (staffRows) data.agencies = staffRows.filter((r) => r.role === "admin").map(staffFromRow);
  if (Array.isArray(loginRows)) data.agentLogins = loginRows.map(agentLoginFromRow);
  if (Array.isArray(ratingRows)) data.ratings = ratingRows.map(ratingFromRow);
  if (ratingSummary) data.ratingSummary = ratingSummary;
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

// Agents are added by the superadmin or agencies from the dashboard. None are pre-loaded.
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
      <div className="pk-stat-label">{stat.label}</div>
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
      className={`pk-card overflow-hidden ${isFeatured(property) ? "pk-card-featured" : ""}`}
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
        {isFeatured(property) ? (
          <span className="pk-prop-tag pk-prop-tag-featured">
            <Star size={12} fill="currentColor" aria-hidden="true" />
            <span>Featured · {TAG_LABELS[property.tag] || property.tag}</span>
          </span>
        ) : (
          <span className="pk-prop-tag">{TAG_LABELS[property.tag] || property.tag}</span>
        )}
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
      <div className="p-3 md:p-4">
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
        <div className="flex items-center gap-3 mt-2 pt-2 text-sm pk-ink-soft" style={{ borderTop: "1px solid var(--border)" }}>
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

const TAG_LABELS = { Buy: "For sale", Rent: "For rent", Commercial: "Commercial", Land: "Land" };

// Builds a WhatsApp chat link from a phone number. Kenyan numbers like 0712 345 678 become 254712345678.
function whatsappLink(phone, text) {
  let d = String(phone || "").replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  else if (d.startsWith("0")) d = "254" + d.slice(1);
  else if (/^[17]\d{8}$/.test(d)) d = "254" + d;
  if (d.length < 10 || d.length > 15) return null;
  return `https://wa.me/${d}?text=${encodeURIComponent(text)}`;
}
const telHref = (phone) => `tel:${String(phone || "").replace(/[^\d+]/g, "")}`;

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
  const contact = property.contact || {};
  const phone = String(contact.phone || "").trim();
  const agentPhone = String(contact.agentPhone || "").trim();
  const email = String(contact.email || "").trim();
  const ref = `HY-${String(property.id).padStart(4, "0")}`;
  const askText = `Hello, I'm interested in "${property.title}" (${property.location}, Ref ${ref}) on ${SITE_CONFIG.name}.`;
  const whatsapp = whatsappLink(phone, askText);
  const agentWhatsapp = whatsappLink(agentPhone, askText);
  const amenities = Array.isArray(property.amenities) ? property.amenities : [];
  const description = String(property.description || "").trim();

  const facts = [];
  if (property.beds != null) facts.push({ icon: Bed, label: "Bedrooms", value: property.beds });
  if (property.baths != null) facts.push({ icon: Bath, label: "Bathrooms", value: property.baths });
  if (property.size && property.size !== "—") facts.push({ icon: Ruler, label: property.tag === "Land" ? "Plot size" : "Size", value: property.size });
  if (property.spaceType) facts.push({ icon: Building2, label: "Space type", value: property.spaceType });

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-8 pt-5 md:pt-10 pb-28 lg:pb-20">
      <p className="pk-mono text-xs uppercase tracking-wide pk-breadcrumb">
        <button onClick={onBackHome} className="pk-primary-text font-semibold">Home</button>
        <span className="pk-ink-soft"> / </span>
        <button onClick={onBackCategory} className="pk-primary-text font-semibold">{LISTING_META[category].label}</button>
        <span className="pk-ink-soft"> / {property.title}</span>
      </p>

      <div className="pk-detail-grid">
        <div className="pk-detail-head">
          <div className="pk-detail-media">
            <ImageWithFallback src={property.img} alt={property.title} className="pk-detail-media-img" iconFallback={HomeIcon} eager />
          </div>

          <div className="flex items-start justify-between gap-3 mt-4">
            <div className="min-w-0">
              <h1 className="pk-display text-xl md:text-3xl font-semibold leading-tight mb-1">{property.title}</h1>
              <p className="pk-ink-soft text-sm flex items-center gap-1">
                <MapPin size={14} className="flex-shrink-0" /> {property.location}
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

          <div className="pk-detail-pricebar">
            <span className="pk-mono pk-primary-text pk-detail-price lg:hidden">
              {property.price}
              <span className="text-sm pk-ink-soft font-normal">{property.period}</span>
            </span>
            <span className="pk-chip-tag">{TAG_LABELS[property.tag] || property.tag}</span>
            {isFeatured(property) && (
              <span className="pk-chip-tag pk-chip-tag-featured">
                <Star size={11} fill="currentColor" aria-hidden="true" /> Featured
              </span>
            )}
          </div>

          {facts.length > 0 && (
            <div className="pk-facts-grid">
              {facts.map((f) => {
                const FactIcon = f.icon;
                return (
                  <div key={f.label} className="pk-fact">
                    <FactIcon size={18} />
                    <div className="min-w-0">
                      <strong>{f.value}</strong>
                      <small>{f.label}</small>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <aside className="pk-detail-sidebar" aria-label="Contact details">
          <div className="pk-contact-card">
            <div className="pk-mono pk-primary-text hidden lg:block mb-3" style={{ fontSize: "1.7rem", fontWeight: 600 }}>
              {property.price}
              <span className="text-sm pk-ink-soft font-normal">{property.period}</span>
            </div>

            <p className="pk-contact-kicker">Listed by</p>
            <div className="pk-contact-person">
              {contact.avatar ? (
                <ImageWithFallback src={contact.avatar} alt={contact.name} className="pk-agent-photo" iconFallback={Users} />
              ) : (
                <InitialsAvatar name={contact.name} size={48} />
              )}
              <div className="min-w-0">
                <div className="font-semibold leading-tight">{contact.name}</div>
                {contact.role && <div className="pk-contact-role">{contact.role}</div>}
                {property.agency && <div className="pk-ink-soft text-xs">{property.agency}</div>}
              </div>
            </div>

            {/* Phones: the numbers as tap-to-call lines (the Call and WhatsApp buttons live in the bar at the bottom of the screen) */}
            <div className="pk-contact-lines lg:hidden">
              {phone ? (
                <a href={telHref(phone)}>
                  <Phone size={15} />
                  <span>{phone}</span>
                  <em>Call</em>
                </a>
              ) : (
                <p className="pk-ink-soft text-sm">No phone number was added for this property. Please use email.</p>
              )}
              {agentPhone && (
                <a href={telHref(agentPhone)}>
                  <Users size={15} />
                  <span>{agentPhone}</span>
                  <em>Agent</em>
                </a>
              )}
              {email && (
                <a href={`mailto:${email}?subject=${encodeURIComponent(`Enquiry: ${property.title} (Ref ${ref})`)}`}>
                  <Mail size={15} />
                  <span>{email}</span>
                  <em>Email</em>
                </a>
              )}
            </div>

            {/* Larger screens: full-width buttons */}
            <div className="pk-contact-actions hidden lg:flex">
              {phone ? (
                <a className="pk-btn-primary justify-center" href={telHref(phone)}>
                  <Phone size={15} /> Call {phone}
                </a>
              ) : (
                <p className="pk-ink-soft text-sm">No phone number was added for this property. Please use email.</p>
              )}
              {whatsapp && (
                <a className="pk-btn-wa justify-center" href={whatsapp} target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={15} /> WhatsApp
                </a>
              )}
              {agentPhone && (
                <a className="pk-btn-outline justify-center" href={agentWhatsapp || telHref(agentPhone)} {...(agentWhatsapp ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                  <Users size={15} /> Agent number: {agentPhone}
                </a>
              )}
              {email && (
                <a className="pk-btn-outline justify-center" href={`mailto:${email}?subject=${encodeURIComponent(`Enquiry: ${property.title} (Ref ${ref})`)}`}>
                  <Mail size={15} /> Email
                </a>
              )}
            </div>

            <p className="pk-ink-soft text-xs mt-3 text-center leading-relaxed">
              <ShieldCheck size={13} className="inline-block mr-1" style={{ verticalAlign: "-2px" }} />
              Always view a property in person before making any payment.
            </p>
            <p className="pk-contact-ref pk-mono">Ref {ref}</p>
          </div>
        </aside>

        <div className="pk-detail-body">
          {description && (
            <div className="pk-detail-section" style={{ marginTop: 6 }}>
              <h2 className="pk-display text-lg md:text-xl font-semibold mb-2">About this property</h2>
              <p className="pk-ink-soft leading-relaxed text-sm md:text-base">{description}</p>
            </div>
          )}

          {amenities.length > 0 && (
            <div className="pk-detail-section">
              <h2 className="pk-display text-lg md:text-xl font-semibold mb-2">Features</h2>
              <ul className="pk-amenity-list">
                {amenities.map((a) => (
                  <li key={a}>
                    <Check size={15} className="pk-primary-text" /> {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {similar.length > 0 && (
            <div className="pk-detail-section">
              <h2 className="pk-display text-lg md:text-xl font-semibold mb-3">Similar listings</h2>
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
      </div>

      {(phone || whatsapp) && (
        <div className="pk-contact-bar">
          {phone && (
            <a className="pk-btn-primary" href={telHref(phone)}>
              <Phone size={16} /> Call
            </a>
          )}
          {whatsapp && (
            <a className="pk-btn-wa" href={whatsapp} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={16} /> WhatsApp
            </a>
          )}
        </div>
      )}
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
              {currentUser.role === "agency" && (
                <span className="pk-status-badge" style={{ "--badge-color": "var(--accent)" }}>Agency · {currentUser.agency}</span>
              )}
              {currentUser.role === "agent" && (
                <span className="pk-status-badge" style={{ "--badge-color": "var(--accent)" }}>Agent · {currentUser.agency}</span>
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
        {isStaffUser(currentUser) && (
          <button className="pk-btn-outline" onClick={onGoAdmin}>
            <Shield size={15} /> {currentUser.role === "superadmin" ? "Superadmin dashboard" : currentUser.role === "agent" ? "Agent console" : "Agency console"}
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

/* ---------------------------------------------------------------- */
/* Agent cards, agent profile and ratings                             */
/* ---------------------------------------------------------------- */

function StarsRow({ value, size = 14 }) {
  const rounded = Math.round(value || 0);
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} className="pk-accent-text" fill={n <= rounded ? "var(--accent-text)" : "none"} strokeWidth={1.75} />
      ))}
    </span>
  );
}

// Staff-only score line: stars, the average and how many people rated.
function StaffScore({ stats }) {
  if (!stats || stats.count === 0) return <span className="pk-ink-soft text-xs">No ratings yet</span>;
  return (
    <span className="pk-agent-score" title={`${stats.count} rating${stats.count === 1 ? "" : "s"}`}>
      <StarsRow value={stats.avg} size={13} />
      <span className="pk-mono font-semibold">{stats.avg.toFixed(1)}</span>
      <span className="pk-ink-soft">({stats.count})</span>
    </span>
  );
}

// The card used on the home page and the Agents page. The whole card opens the agent's profile.
function AgentCard({ agent, onOpen, propertyCount, summary }) {
  const open = () => onOpen(agent.id);
  return (
    <div
      className="pk-card pk-agent-card"
      role="button"
      tabIndex={0}
      aria-label={`View ${agent.name}'s profile`}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
    >
      <ImageWithFallback src={agent.img} alt={agent.name} className="pk-agent-card-photo" iconFallback={Users} />
      <h3 className="pk-agent-card-name">
        <span>{agent.name}</span>
        {agent.status === "verified" && <VerifiedBadge size={15} />}
      </h3>
      {agent.focus && <span className="pk-agent-card-focus">{agent.focus}</span>}
      {summary && summary.count > 0 && (
        <p className="pk-agent-card-score" aria-label={`Rated ${summary.avg.toFixed(1)} out of 5 from ${summary.count} rating${summary.count === 1 ? "" : "s"}`}>
          <StarsRow value={summary.avg} size={13} />
          <span className="pk-mono font-semibold">{summary.avg.toFixed(1)}</span>
          <span className="pk-ink-soft">({summary.count})</span>
        </p>
      )}
      {agent.area && (
        <p className="pk-agent-card-meta">
          <MapPin size={12} className="flex-none" /> <span>{agent.area}</span>
        </p>
      )}
      {agent.agency && (
        <p className="pk-agent-card-meta">
          <Building2 size={12} className="flex-none" /> <span>{agent.agency}</span>
        </p>
      )}
      {typeof propertyCount === "number" && (
        <p className="pk-agent-card-meta">
          <HomeIcon size={12} className="flex-none" /> <span>{propertyCount} propert{propertyCount === 1 ? "y" : "ies"}</span>
        </p>
      )}
      <span className="pk-agent-card-cta">
        View profile <ArrowRight size={13} aria-hidden="true" />
      </span>
    </div>
  );
}

function StarInput({ value, onChange, disabled }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="pk-star-input" role="radiogroup" aria-label="Your rating out of 5" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n === 1 ? "" : "s"}, ${RATING_WORDS[n]}`}
          disabled={disabled}
          className="pk-star-btn"
          onMouseEnter={() => setHover(n)}
          onFocus={() => setHover(n)}
          onBlur={() => setHover(0)}
          onClick={() => onChange(n)}
        >
          <Star size={34} className="pk-accent-text" fill={n <= shown ? "var(--accent-text)" : "none"} strokeWidth={1.5} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

function ratingErrorMessage(err) {
  if (err instanceof TypeError) return "We couldn't reach the server. Check your connection and try again.";
  const code = String((err && err.code) || "");
  if (err && (err.status === 404 || code === "PGRST205" || code === "42P01")) return "Ratings aren't switched on yet. Please try again later.";
  if (err && (err.status === 401 || err.status === 403)) return "We couldn't save your rating. Make sure you are signed in with your own account, then try again.";
  return "We couldn't save your rating. Please try again.";
}

function AgentRatePanel({ agent, mine, onSubmit, onRemove }) {
  const [stars, setStars] = useState(mine ? mine.stars : 0);
  const [comment, setComment] = useState(mine ? mine.comment : "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  useEffect(() => {
    setStars(mine ? mine.stars : 0);
    setComment(mine ? mine.comment : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mine && mine.id, mine && mine.updatedAt, agent.id]);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (!stars) {
      setError("Tap a star to choose your rating.");
      return;
    }
    setBusy(true);
    setError("");
    setDone("");
    try {
      await onSubmit(agent.id, stars, comment.trim());
      setDone(mine ? "Your rating was updated. Thank you!" : "Thanks! Your rating was saved.");
    } catch (err) {
      setError(ratingErrorMessage(err));
    }
    setBusy(false);
  };
  const remove = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    setDone("");
    try {
      await onRemove(agent.id);
      setStars(0);
      setComment("");
      setDone("Your rating was removed.");
    } catch (err) {
      setError(ratingErrorMessage(err));
    }
    setBusy(false);
  };

  return (
    <div className="pk-rate-box">
      <h2 className="pk-display text-xl font-semibold mb-1">{mine ? "Your rating" : `Rate ${agent.name}`}</h2>
      <p className="pk-ink-soft text-sm mb-4">
        How was your experience with this agent? Other signed-in visitors will see your stars and comment with your first name only. The agent can't see who rated them. Signed-out visitors can't see ratings.
      </p>
      <form onSubmit={submit}>
        <StarInput
          value={stars}
          disabled={busy}
          onChange={(n) => {
            setStars(n);
            setDone("");
            setError("");
          }}
        />
        <p className="pk-ink-soft text-sm mt-1" aria-live="polite">
          {stars ? RATING_WORDS[stars] : "Tap a star to rate"}
        </p>
        <label className="block mt-4 text-sm font-semibold" htmlFor="pk-rate-comment">
          Comment (optional)
        </label>
        <textarea
          id="pk-rate-comment"
          className="pk-rate-textarea"
          rows={4}
          maxLength={600}
          value={comment}
          disabled={busy}
          placeholder="Was the agent helpful, honest and easy to reach?"
          onChange={(e) => setComment(e.target.value)}
        />
        <p className="pk-ink-soft text-xs text-right">{comment.length}/600</p>
        {error && (
          <p className="pk-admin-error mt-2" role="alert">
            {error}
          </p>
        )}
        {done && !error && (
          <div className="pk-admin-notice mt-2" role="status">
            {done}
          </div>
        )}
        <div className="flex gap-2 flex-wrap mt-4">
          <button type="submit" className="pk-btn-primary" disabled={busy || !stars}>
            <Star size={15} /> {busy ? "Saving…" : mine ? "Update my rating" : "Submit rating"}
          </button>
          {mine && (
            <button type="button" className="pk-btn-outline" onClick={remove} disabled={busy}>
              Remove my rating
            </button>
          )}
        </div>
      </form>
      {mine && <p className="pk-ink-soft text-xs mt-3">You last rated this agent on {formatShortDate(mine.updatedAt)}.</p>}
    </div>
  );
}

// Score line used on the profile header: stars, the average and how many people rated.
function RatingScoreLine({ summary }) {
  if (!summary || summary.count === 0) return <span className="pk-ink-soft text-sm">No ratings yet</span>;
  return (
    <span className="pk-agent-score" aria-label={`Rated ${summary.avg.toFixed(1)} out of 5 from ${summary.count} rating${summary.count === 1 ? "" : "s"}`}>
      <StarsRow value={summary.avg} size={16} />
      <span className="pk-mono font-semibold">{summary.avg.toFixed(1)}</span>
      <span className="pk-ink-soft">
        ({summary.count} rating{summary.count === 1 ? "" : "s"})
      </span>
    </span>
  );
}

function ReviewsList({ reviews }) {
  if (reviews === null) return <p className="pk-ink-soft text-sm">Loading reviews…</p>;
  if (reviews.length === 0) return <p className="pk-ink-soft text-sm">No written reviews yet.</p>;
  return (
    <div className="flex flex-col gap-3">
      {reviews.map((r, i) => (
        <div key={i} className="pk-agent-comment">
          <div className="flex items-center gap-2 flex-wrap">
            <StarsRow value={r.stars} size={13} />
            <span className="font-semibold">{r.mine ? "You" : r.reviewer}</span>
            {r.updatedAt && <span className="pk-ink-soft">· {formatShortDate(r.updatedAt)}</span>}
          </div>
          <p>{r.comment}</p>
        </div>
      ))}
    </div>
  );
}

// The Ratings tab: what everyone with an account has said, plus the form to add or change your own rating.
function AgentRatingsTab({ agent, summary, reviews, myRating, onRate, onRemoveRating }) {
  const count = summary ? summary.count : 0;
  return (
    <div className="pk-rating-layout" role="tabpanel" id="pk-agent-panel-rate" aria-labelledby="pk-agent-tab-rate">
      <div className="min-w-0">
        <h2 className="pk-display text-xl font-semibold mb-4">Ratings and reviews</h2>
        {count === 0 ? (
          <p className="pk-ink-soft text-sm mb-2">No one has rated {agent.name} yet. You could be the first.</p>
        ) : (
          <div className="pk-rating-overview">
            <div className="pk-rating-big">
              <strong>{summary.avg.toFixed(1)}</strong>
              <StarsRow value={summary.avg} size={18} />
              <span className="pk-ink-soft text-sm">
                {count} rating{count === 1 ? "" : "s"}
              </span>
            </div>
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              {[5, 4, 3, 2, 1].map((n) => (
                <div key={n} className="pk-dist-row">
                  <span className="pk-mono w-8 flex-none">{n} ★</span>
                  <span className="pk-rating-bar" aria-hidden="true">
                    <span style={{ width: `${((summary.counts[n - 1] || 0) / count) * 100}%` }} />
                  </span>
                  <span className="pk-ink-soft w-6 text-right flex-none">{summary.counts[n - 1] || 0}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <h3 className="font-semibold mt-6 mb-3">What people said</h3>
        <ReviewsList reviews={reviews} />
      </div>
      <AgentRatePanel agent={agent} mine={myRating} onSubmit={onRate} onRemove={onRemoveRating} />
    </div>
  );
}

function AgentDetailPage({ agent, listings, myRating, summary, loadReviews, reviewsVersion, favorites, onToggleFavorite, onOpenListing, onBackHome, onBackAgents, onRate, onRemoveRating }) {
  const [tab, setTab] = useState("properties");
  const [reviews, setReviews] = useState(null);
  const phone = String(agent.phone || "").trim();
  const whatsapp = whatsappLink(phone, `Hi ${agent.name}, I found you on ${SITE_CONFIG.name}.`);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve(loadReviews(agent.id))
      .then((rows) => {
        if (!cancelled) setReviews(rows);
      })
      .catch(() => {
        if (!cancelled) setReviews([]);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent.id, reviewsVersion]);

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-8 pt-8 md:pt-12 pb-20">
      <p className="pk-mono text-xs uppercase tracking-wide mb-3 pk-breadcrumb">
        <button onClick={onBackHome} className="pk-primary-text font-semibold">Home</button>
        <span className="pk-ink-soft"> / </span>
        <button onClick={onBackAgents} className="pk-primary-text font-semibold">Agents</button>
        <span className="pk-ink-soft"> / {agent.name}</span>
      </p>

      <div className="pk-card pk-agent-profile" style={{ transform: "none" }}>
        <ImageWithFallback src={agent.img} alt={agent.name} className="pk-agent-profile-photo" iconFallback={Users} eager />
        <div className="min-w-0">
          <h1 className="pk-display text-2xl md:text-4xl font-semibold flex items-center justify-center md:justify-start gap-2 flex-wrap">
            <span>{agent.name}</span>
            {agent.status === "verified" && <VerifiedBadge size={22} />}
          </h1>
          {agent.focus && <p className="pk-primary-text text-sm font-semibold mt-1">{agent.focus}</p>}
          <div className="mt-2 flex justify-center md:justify-start">
            <RatingScoreLine summary={summary} />
          </div>
          <div className="pk-agent-facts">
            <div>
              <Building2 size={15} className="flex-none" /> <span>{agent.agency ? agent.agency : "Independent agent"}</span>
            </div>
            {agent.area && (
              <div>
                <MapPin size={15} className="flex-none" /> <span>{agent.area}</span>
              </div>
            )}
            <div>
              <Phone size={15} className="flex-none" />
              {phone ? <a href={telHref(phone)} className="font-semibold" style={{ color: "var(--ink)" }}>{phone}</a> : <span>No phone number added yet</span>}
            </div>
            {agent.verifiedAt && (
              <div>
                <BadgeCheck size={15} className="flex-none" /> <span>Verified {formatShortDate(agent.verifiedAt)}</span>
              </div>
            )}
          </div>
          <div className="pk-agent-actions">
            {phone && (
              <a className="pk-btn-primary" href={telHref(phone)}>
                <Phone size={15} /> Call
              </a>
            )}
            {whatsapp && (
              <a className="pk-btn-wa" href={whatsapp} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={15} /> WhatsApp
              </a>
            )}
            <a className="pk-btn-outline" href={`mailto:${SITE_CONFIG.contactEmail}?subject=${encodeURIComponent("Enquiry about agent " + agent.name)}`}>
              <Mail size={15} /> Email enquiry
            </a>
          </div>
        </div>
      </div>

      <div className="pk-agent-tabs" role="tablist" aria-label="Agent sections">
        <button
          type="button"
          role="tab"
          id="pk-agent-tab-properties"
          aria-selected={tab === "properties"}
          aria-controls="pk-agent-panel-properties"
          className="pk-agent-tab"
          onClick={() => setTab("properties")}
        >
          <HomeIcon size={15} /> Properties ({listings.length})
        </button>
        <button
          type="button"
          role="tab"
          id="pk-agent-tab-rate"
          aria-selected={tab === "rate"}
          aria-controls="pk-agent-panel-rate"
          className="pk-agent-tab"
          onClick={() => setTab("rate")}
        >
          <Star size={15} /> Ratings{summary && summary.count ? ` (${summary.count})` : ""}
        </button>
      </div>

      <div className="mt-6">
        {tab === "properties" && (
          <div role="tabpanel" id="pk-agent-panel-properties" aria-labelledby="pk-agent-tab-properties">
            {listings.length === 0 ? (
              <div className="pk-empty-state" style={{ padding: "40px 20px" }}>
                <HomeIcon size={32} strokeWidth={1.5} className="pk-ink-soft mx-auto mb-4" />
                <h3 className="pk-display text-xl font-semibold mb-2">No properties right now</h3>
                <p className="pk-ink-soft text-sm max-w-sm mx-auto">{agent.name} doesn't have any live listings at the moment. Check back soon.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {listings.map((p) => (
                  <PropertyCard key={p.id} property={p} isFavorite={favorites.has(p.id)} onToggleFavorite={onToggleFavorite} onSelect={onOpenListing} />
                ))}
              </div>
            )}
          </div>
        )}
        {tab === "rate" && <AgentRatingsTab agent={agent} summary={summary} reviews={reviews} myRating={myRating} onRate={onRate} onRemoveRating={onRemoveRating} />}
      </div>
    </section>
  );
}

// Dashboard view for the superadmin (every agent) and for an agency (its own agents): the scores visitors gave.
function AgentRatingsPanel({ agents, ratings, scope = "all" }) {
  const [sort, setSort] = useState("high");
  const [openIds, setOpenIds] = useState(new Set());
  const toggle = (id) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const rows = agents.map((a) => ({ agent: a, stats: ratingStats(ratings, a.id) }));
  const latest = (r) => r.stats.list.reduce((m, x) => Math.max(m, new Date(x.updatedAt || x.createdAt || 0).getTime() || 0), 0);
  const sorters = {
    high: (x, y) => (y.stats.avg ?? -1) - (x.stats.avg ?? -1) || y.stats.count - x.stats.count,
    low: (x, y) => (x.stats.avg ?? 99) - (y.stats.avg ?? 99) || y.stats.count - x.stats.count,
    most: (x, y) => y.stats.count - x.stats.count || (y.stats.avg ?? -1) - (x.stats.avg ?? -1),
    recent: (x, y) => latest(y) - latest(x),
  };
  const sorted = [...rows].sort(sorters[sort]);
  const totalCount = rows.reduce((n, r) => n + r.stats.count, 0);
  const totalSum = rows.reduce((n, r) => n + r.stats.counts.reduce((s, c, i) => s + c * (i + 1), 0), 0);
  const agentsRated = rows.filter((r) => r.stats.count > 0).length;
  const SORTS = [
    { key: "high", label: "Highest rated" },
    { key: "low", label: "Lowest rated" },
    { key: "most", label: "Most ratings" },
    { key: "recent", label: "Latest" },
  ];

  return (
    <div>
      <h2 className="pk-display text-2xl font-semibold mb-1">Agent ratings</h2>
      <p className="pk-ink-soft text-sm mb-4">
        {scope === "agency"
          ? "What visitors with an account rated the agents under your agency, with each person's full name. Other signed-in visitors see only the averages and comments (first names). Agents and signed-out visitors see nothing."
          : "What visitors with an account rated every agent, with each person's full name. Only the superadmin and each agent's own agency see names; other signed-in visitors see only averages and comments (first names). Agents and signed-out visitors see nothing."}
      </p>

      <div className="pk-rating-summary">
        <div className="pk-rating-tile">
          <span className="pk-ink-soft text-xs uppercase tracking-wide">Average score</span>
          <strong>{totalCount ? (totalSum / totalCount).toFixed(1) : "—"}</strong>
          {totalCount > 0 && <StarsRow value={totalSum / totalCount} size={14} />}
        </div>
        <div className="pk-rating-tile">
          <span className="pk-ink-soft text-xs uppercase tracking-wide">Ratings</span>
          <strong>{totalCount}</strong>
        </div>
        <div className="pk-rating-tile">
          <span className="pk-ink-soft text-xs uppercase tracking-wide">Agents rated</span>
          <strong>
            {agentsRated}
            <span className="pk-ink-soft text-base"> / {agents.length}</span>
          </strong>
        </div>
      </div>

      {agents.length === 0 ? (
        <p className="pk-ink-soft text-sm">{scope === "agency" ? "No agents are assigned to your agency yet." : "No agents yet."}</p>
      ) : (
        <>
          <div className="pk-chip-row mb-4" role="group" aria-label="Sort ratings">
            {SORTS.map((s) => (
              <button key={s.key} type="button" className={`pk-chip ${sort === s.key ? "pk-chip-active" : ""}`} aria-pressed={sort === s.key} onClick={() => setSort(s.key)}>
                {s.label}
              </button>
            ))}
          </div>
          <div className="pk-admin-listing-list">
            {sorted.map(({ agent: a, stats }) => {
              const isOpen = openIds.has(a.id);
              const attention = stats.count >= 3 && stats.avg < 3;
              return (
                <div key={a.id} className="pk-admin-card">
                  <div className="pk-admin-listing-row">
                    <ImageWithFallback src={a.img} alt={a.name} className="pk-agent-photo" iconFallback={Users} />
                    <div className="pk-admin-listing-info">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{a.name}</span>
                        {attention && (
                          <span className="pk-status-badge" style={{ "--badge-color": "var(--brick)" }}>
                            Low score
                          </span>
                        )}
                      </div>
                      <p className="pk-ink-soft text-xs">{a.agency || "Independent"}</p>
                      <StaffScore stats={stats} />
                    </div>
                    <div className="pk-admin-listing-actions">
                      <button
                        className="pk-icon-btn"
                        title={isOpen ? "Hide ratings" : "Show ratings"}
                        aria-label={isOpen ? "Hide ratings" : "Show ratings"}
                        aria-expanded={isOpen}
                        onClick={() => toggle(a.id)}
                        disabled={stats.count === 0}
                      >
                        {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                    </div>
                  </div>
                  {isOpen && stats.count > 0 && (
                    <div className="pk-admin-expand">
                      <div className="pk-admin-expand-grid">
                        <div>
                          <div className="pk-admin-expand-label">Breakdown</div>
                          <div className="flex flex-col gap-1.5">
                            {[5, 4, 3, 2, 1].map((n) => (
                              <div key={n} className="pk-dist-row">
                                <span className="pk-mono w-8 flex-none">{n} ★</span>
                                <span className="pk-rating-bar" aria-hidden="true">
                                  <span style={{ width: `${(stats.counts[n - 1] / stats.count) * 100}%` }} />
                                </span>
                                <span className="pk-ink-soft w-6 text-right flex-none">{stats.counts[n - 1]}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="pk-admin-expand-label">What people said</div>
                          <div className="flex flex-col gap-2">
                            {[...stats.list]
                              .sort((x, y) => new Date(y.updatedAt || 0) - new Date(x.updatedAt || 0))
                              .map((r, i) => (
                                <div key={r.id || i} className="pk-agent-comment">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <StarsRow value={r.stars} size={12} />
                                    <span className="font-semibold">{r.raterName || "Visitor"}</span>
                                    <span className="pk-ink-soft">· {formatShortDate(r.updatedAt || r.createdAt)}</span>
                                  </div>
                                  {r.comment ? <p>{r.comment}</p> : <p className="italic">No comment.</p>}
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function AgentsPage({ agents, listings = [], onBackHome, onOpenVerification, locked = false, onOpenAgent, summaryFor = () => null }) {
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
        {visible.length} verified agent{visible.length === 1 ? "" : "s"}. Tap an agent to see their details and properties.{" "}
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
          <AgentCard key={a.id} agent={a} onOpen={onOpenAgent} propertyCount={locked ? undefined : agentListings(a, listings).length} summary={locked ? null : summaryFor(a.id)} />
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
        {onExit && (
          <button className="pk-admin-gate-back" onClick={onExit}>
            ← Back to site
          </button>
        )}
      </div>
    </div>
  );
}

function StaffGate({ agencies, onAuthenticate, onExit }) {
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
        const agencyRow = agencies.find((a) => a.email.toLowerCase() === normalized);
        // Always do the same amount of work so response time doesn't reveal which emails exist.
        const attempt = await pbkdf2Hex(password, agencyRow?.passSalt || SUPERADMIN_CONFIG.salt, ADMIN_HASH_ITERATIONS);
        if (agencyRow && agencyRow.status === "active" && agencyRow.passHash && attempt === agencyRow.passHash) {
          user = { name: displayNameFor(normalized, agencyRow.name), email: normalized, isSuperAdmin: false, role: "agency", agency: agencyRow.agency, staffId: agencyRow.id };
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
  contactAgentPhone: "",
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
      ...(form.contactAgentPhone.trim() ? { agentPhone: form.contactAgentPhone.trim() } : {}),
      email: form.contactEmail.trim() || SITE_CONFIG.contactEmail,
    },
  };
}

// Fill the listing form from a saved listing, so it can be edited.
function formFromListing(l) {
  const presets = AMENITY_PRESETS[l.tag] || [];
  const amenities = Array.isArray(l.amenities) ? l.amenities : [];
  const text = (v) => (v === null || v === undefined ? "" : String(v));
  return {
    title: l.title || "",
    tag: l.tag || "Buy",
    location: l.location || "",
    priceValue: l.priceValue ? String(l.priceValue) : "",
    period: l.period || "",
    beds: text(l.beds),
    baths: text(l.baths),
    size: l.tag === "Land" || l.size === "—" ? "" : text(l.size),
    spaceType: l.spaceType || "Office",
    acres: text(l.acres),
    img: l.img || "",
    description: l.description === "No description provided yet." ? "" : l.description || "",
    selectedAmenities: amenities.filter((a) => presets.includes(a)),
    customAmenities: amenities.filter((a) => !presets.includes(a)).join(", "),
    contactName: (l.contact && l.contact.name) || "",
    contactRole: (l.contact && l.contact.role) || "Property Owner",
    contactPhone: (l.contact && l.contact.phone) || "",
    contactAgentPhone: (l.contact && l.contact.agentPhone) || "",
    contactEmail: (l.contact && l.contact.email) || "",
  };
}

// An edit changes only what the form shows. Who posted it, which agency it belongs to, whether it is live,
// and whether it is featured stay exactly as they were (the database enforces this too).
function applyFormToListing(existing, form) {
  return {
    ...existing,
    ...buildListingFromForm(form, existing.id),
    featured: existing.featured,
    featuredUntil: existing.featuredUntil,
    agency: existing.agency,
    status: existing.status,
    source: existing.source,
    submittedBy: existing.submittedBy,
  };
}

const BILLING_LABELS = { "": "One-off (sale price)", "/mo": "Monthly (rent/lease)" };
const BILLING_VALUE_BY_LABEL = { "One-off (sale price)": "", "Monthly (rent/lease)": "/mo" };

function ListingForm({ onSubmit, submitLabel = "Publish listing", initial = null, onCancel = null }) {
  const editing = Boolean(initial);
  const pfx = editing ? `pk-edit-${initial.id}` : "pk-form";
  const [form, setForm] = useState(() => (initial ? formFromListing(initial) : EMPTY_LISTING_FORM));
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
    if (!editing) setForm(EMPTY_LISTING_FORM);
  };

  return (
    <form onSubmit={handleSubmit} className="pk-admin-form">
      <h3 className="pk-display text-lg font-semibold mb-4">{editing ? "Edit listing details" : "New listing details"}</h3>
      <div className="pk-admin-form-grid">
        <label>
          Title
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </label>
        <CustomSelect id={`${pfx}-category`} label="Category" value={form.tag} options={["Buy", "Rent", "Commercial", "Land"]} onChange={handleCategoryChange} />
        <label>
          Location
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="e.g. Milimani, Nakuru"
            list={`${pfx}-locations`}
            required
          />
          <datalist id={`${pfx}-locations`}>
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
          id={`${pfx}-billing`}
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
              id={`${pfx}-spacetype`}
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
          id={`${pfx}-contactrole`}
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
          Agent number (optional)
          <input
            value={form.contactAgentPhone}
            onChange={(e) => setForm({ ...form, contactAgentPhone: e.target.value })}
            placeholder="If different from the phone above"
          />
        </label>
        <label>
          Email
          <input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} required />
        </label>
      </div>
      {formError && <p className="pk-admin-error mt-4">{formError}</p>}
      <div className="flex gap-3 flex-wrap mt-5">
        <button type="submit" className="pk-btn-primary justify-center" disabled={photoBusy}>
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="pk-btn-outline justify-center" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
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

function AdminListingsPanel({ listings, onUpdateListings, onToast, adminName, openForm = false }) {
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(Boolean(openForm));
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [featureFor, setFeatureFor] = useState(null);
  const [editingId, setEditingId] = useState(null);

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

  const saveEdit = (id, form) => {
    const listing = listings.find((l) => l.id === id);
    if (!listing) return;
    onUpdateListings(listings.map((l) => (l.id === id ? applyFormToListing(l, form) : l)));
    onToast?.(`"${form.title.trim()}" updated`, "success");
    setEditingId(null);
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
            {listings.length} total · listings from agencies and agents land here as "Pending" for your review.
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
                <button className="pk-icon-btn" title="Edit" aria-label="Edit" onClick={() => setEditingId(editingId === l.id ? null : l.id)}>
                  <Pencil size={15} />
                </button>
                <button className="pk-icon-btn" title="Delete" aria-label="Delete" onClick={() => setConfirmDelete(l)}>
                  <Trash2 size={15} />
                </button>
                <button className="pk-icon-btn" title={expandedIds.has(l.id) ? "Collapse" : "Expand"} aria-label={expandedIds.has(l.id) ? "Collapse" : "Expand"} onClick={() => toggleExpand(l.id)}>
                  {expandedIds.has(l.id) ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
              </div>
            </div>
            {editingId === l.id && (
              <ListingForm initial={l} submitLabel="Save changes" onSubmit={(form) => saveEdit(l.id, form)} onCancel={() => setEditingId(null)} />
            )}
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

function AgenciesPanel({ agencies, onUpdateAgencies, onToast, listings, agents }) {
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
    if (agencies.some((a) => a.email.toLowerCase() === normalizedEmail)) {
      setFormError("An agency with that email already exists.");
      return;
    }
    setFormError("");
    const passSalt = REMOTE ? "" : randomSalt();
    const passHash = REMOTE ? "" : await pbkdf2Hex(password, passSalt, ADMIN_HASH_ITERATIONS);
    const newAgency = {
      id: agencies.length ? Math.max(...agencies.map((a) => a.id)) + 1 : 1,
      name: name.trim(),
      email: normalizedEmail,
      agency: agency.trim(),
      ...(REMOTE ? {} : { passSalt, passHash }),
      status: "active",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    onUpdateAgencies([...agencies, newAgency]);
    onToast?.(`Agency account created for ${newAgency.name}`, "success");
    setJustCreated(newAgency.email);
    setName("");
    setEmail("");
    setAgency("");
    setPassword("");
  };

  const toggleStatus = (id) => {
    const agencyRow = agencies.find((a) => a.id === id);
    const nextStatus = agencyRow?.status === "active" ? "suspended" : "active";
    onUpdateAgencies(agencies.map((a) => (a.id === id ? { ...a, status: nextStatus } : a)));
    if (agencyRow) onToast?.(`${agencyRow.name} ${nextStatus === "active" ? "reactivated" : "suspended"}`, nextStatus === "active" ? "success" : "warning");
  };

  const deleteAgency = (id) => {
    const agencyRow = agencies.find((a) => a.id === id);
    onUpdateAgencies(agencies.filter((a) => a.id !== id));
    if (agencyRow) onToast?.(`Removed ${agencyRow.name}`, "danger");
    setConfirmDelete(null);
  };

  return (
    <div>
      <h2 className="pk-display text-2xl font-semibold mb-1">Agencies</h2>
      <p className="pk-ink-soft text-sm mb-6">
        {REMOTE
          ? "Add an agency by email. They create a normal account on the site with that email, confirm it, then use Staff sign in. Each agency can add listings, see every listing its agents post, edit them, and manage its own agents."
          : "Create agency accounts here. Each agency can add listings, see every listing its agents post, edit them, and manage its own agents."}
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
            Password for this agency
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
          <UserCog size={16} /> {REMOTE ? "Add agency" : "Create agency account"}
        </button>
      </form>

      {formError && <p className="pk-admin-error mt-3">{formError}</p>}

      {justCreated && (
        <div className="pk-admin-notice">
          {REMOTE ? (
            <>
              <strong>{justCreated}</strong> now has agency access. Ask them to sign up on the site with that email, confirm it from
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
        {agencies.length === 0 && <p className="pk-ink-soft text-sm">No agencies yet.</p>}
        {agencies.map((a) => {
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
        title="Remove this agency account?"
        message={confirmDelete ? `${confirmDelete.name} will lose access immediately. This can't be undone.` : ""}
        confirmLabel="Remove"
        onConfirm={() => confirmDelete && deleteAgency(confirmDelete.id)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

const AGENT_FOCUS_OPTIONS = ["Residential Sales", "Rentals", "Commercial Leasing", "Land & Development"];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Lets an agency or the superadmin add or change an agent's phone number after the agent was created.
function AgentPhoneEditor({ agent, onSave }) {
  const [value, setValue] = useState(agent.phone || "");
  const [error, setError] = useState("");
  useEffect(() => {
    setValue(agent.phone || "");
  }, [agent.phone]);
  const dirty = value.trim() !== (agent.phone || "");
  const save = () => {
    const problem = phoneProblem(value);
    if (problem) {
      setError(problem);
      return;
    }
    setError("");
    onSave(agent, value.trim());
  };
  return (
    <div>
      <div className="flex gap-2">
        <input
          aria-label={`Phone number for ${agent.name}`}
          className="pk-note-input"
          type="tel"
          inputMode="tel"
          placeholder="e.g. 0712 345 678"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button type="button" className="pk-btn-outline" onClick={save} disabled={!dirty}>
          Save
        </button>
      </div>
      {error && <p className="pk-admin-error mt-2">{error}</p>}
    </div>
  );
}

function AgentForm({ agencyLocked, agencySuggestions = [], onSubmit, allowLogin = false }) {
  const blank = { name: "", focus: AGENT_FOCUS_OPTIONS[0], area: "", agency: agencyLocked || "", phone: "", img: "", loginEmail: "" };
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
    const badPhone = phoneProblem(form.phone);
    if (badPhone) {
      setError(badPhone);
      return;
    }
    const loginEmail = allowLogin ? form.loginEmail.trim().toLowerCase() : "";
    if (loginEmail && !EMAIL_PATTERN.test(loginEmail)) {
      setError("Enter a valid email address for the agent's login, or leave it blank.");
      return;
    }
    setError("");
    setDone("");
    // The panel may hand back a message (for example "that email is already in use"); if so, keep the form as it is.
    const problem = onSubmit({ ...form, loginEmail, agency: (agencyLocked || form.agency).trim() });
    if (typeof problem === "string" && problem) {
      setError(problem);
      return;
    }
    setForm(blank);
    setDone(
      `${form.name.trim()} added. They stay hidden from the public site until verified.` +
        (loginEmail ? ` They can now create an account with ${loginEmail}, confirm it, then use Staff sign in to add and remove their listings.` : "")
    );
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
          Phone number
          <input type="tel" inputMode="tel" autoComplete="off" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="e.g. 0712 345 678" />
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
        {allowLogin && (
          <label className="pk-admin-form-full">
            Login email (optional)
            <input
              type="email"
              value={form.loginEmail}
              onChange={(e) => setForm({ ...form, loginEmail: e.target.value })}
              placeholder="Lets this agent sign in to add and remove their own listings"
            />
          </label>
        )}
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

// The rules for agent logins, shared by the agency console and the superadmin console.
// An agent login is matched to its agent by agency + name, so that pair has to be unique.
function makeLoginActions({ allAgents, agentLogins, onUpdateAgentLogins, onToast, reservedEmails = [] }) {
  const loginFor = (agent) => agentLogins.find((l) => sameText(l.agency, agent.agency) && sameText(l.agentName, agent.name)) || null;
  const emailProblem = (email, agent) => {
    if (!EMAIL_PATTERN.test(email)) return "Enter a valid email address.";
    if (agentLogins.some((l) => sameText(l.email, email))) return "That email already has an agent login.";
    if (reservedEmails.some((e) => sameText(e, email))) return "That email already belongs to an agency account.";
    if (!agent.agency) return "An agent needs an agency before they can have a login.";
    const others = allAgents.filter((a) => a.id !== agent.id && sameText(a.agency, agent.agency) && sameText(a.name, agent.name));
    if (others.length > 0) {
      return `${agent.agency} has more than one agent called ${agent.name}. Give them different names first so their login points to the right person.`;
    }
    return "";
  };
  const newLogin = (agent, email) => ({
    id: agentLogins.length ? Math.max(...agentLogins.map((l) => l.id)) + 1 : 1,
    email,
    agentName: agent.name,
    agency: agent.agency,
    status: "active",
  });
  return {
    loginFor,
    emailProblem,
    // Returns a message if the login can't be given, otherwise an empty string.
    grant: (agent, rawEmail) => {
      const email = String(rawEmail || "").trim().toLowerCase();
      const problem = emailProblem(email, agent);
      if (problem) return problem;
      onUpdateAgentLogins([...agentLogins, newLogin(agent, email)]);
      onToast?.(`${agent.name} can now sign in with ${email}`, "success");
      return "";
    },
    setStatus: (login, status) => {
      onUpdateAgentLogins(agentLogins.map((l) => (l.id === login.id ? { ...l, status } : l)));
      onToast?.(`${login.agentName} ${status === "active" ? "can sign in again" : "can't sign in for now"}`, status === "active" ? "success" : "warning");
    },
    revoke: (login) => {
      onUpdateAgentLogins(agentLogins.filter((l) => l.id !== login.id));
      onToast?.(`Login removed for ${login.agentName}`, "danger");
    },
    newLogin,
  };
}

// Shows and manages one agent's login: whether they can sign in, and with which email.
function AgentAccess({ agent, login, onGrant, onSetStatus, onRevoke }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const submit = (e) => {
    e.preventDefault();
    const problem = onGrant(agent, email);
    if (problem) {
      setError(problem);
      return;
    }
    setError("");
    setEmail("");
  };
  return (
    <div className="mt-4">
      <div className="pk-admin-expand-label">Login access</div>
      {login ? (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm">{login.email}</span>
          <span className="pk-status-badge" style={{ "--badge-color": login.status === "active" ? "var(--primary)" : "var(--brick)" }}>
            {login.status === "active" ? "Can sign in" : "Suspended"}
          </span>
          <button type="button" className="pk-btn-outline" onClick={() => onSetStatus(login, login.status === "active" ? "suspended" : "active")}>
            {login.status === "active" ? "Suspend" : "Reactivate"}
          </button>
          <button type="button" className="pk-btn-outline" onClick={() => onRevoke(login)}>
            Remove access
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="flex gap-2 flex-wrap items-center">
          <input
            type="email"
            className="pk-note-input"
            aria-label={`Login email for ${agent.name}`}
            placeholder="Email this agent will sign in with"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="pk-btn-outline">
            Give login
          </button>
        </form>
      )}
      {error && <p className="pk-admin-error mt-2">{error}</p>}
    </div>
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

function AdminAgentsPanel({ agents, onUpdateAgents, onToast, agencies = [], agentLogins = [], onUpdateAgentLogins, ratings = [] }) {
  const loginActions = makeLoginActions({
    allAgents: agents,
    agentLogins,
    onUpdateAgentLogins,
    onToast,
    reservedEmails: agencies.map((a) => a.email),
  });
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
      phone: String(data.phone || "").trim(),
      agency: data.agency,
      status: "unverified",
      rating: null,
      reviews: 0,
      comments: [],
      img: data.img || "",
      verifiedAt: null,
      verification: {},
    };
    if (data.loginEmail) {
      const problem = loginActions.emailProblem(data.loginEmail, newAgent);
      if (problem) return problem;
    }
    onUpdateAgents([...agents, newAgent]);
    if (data.loginEmail) onUpdateAgentLogins([...agentLogins, loginActions.newLogin(newAgent, data.loginEmail)]);
    onToast?.(`${newAgent.name} added`, "success");
    return "";
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
  const savePhone = (agent, phone) => {
    onUpdateAgents(agents.map((x) => (x.id === agent.id ? { ...x, phone } : x)));
    onToast?.(phone ? `Phone saved for ${agent.name}` : `Phone removed for ${agent.name}`, "success");
  };
  const deleteAgent = (id) => {
    const agent = agents.find((a) => a.id === id);
    onUpdateAgents(agents.filter((a) => a.id !== id));
    // Removing an agent also removes their login.
    const login = agent ? loginActions.loginFor(agent) : null;
    if (login && onUpdateAgentLogins) onUpdateAgentLogins(agentLogins.filter((l) => l.id !== login.id));
    if (agent) onToast?.(`Removed ${agent.name}`, "danger");
    setConfirmAction(null);
  };

  return (
    <div>
      <h2 className="pk-display text-2xl font-semibold mb-1">Agents</h2>
      <p className="pk-ink-soft text-sm mb-6">Add agents, then verify them. Only verified agents appear on the public site; banned or unverified agents are hidden.</p>
      <AgentForm agencySuggestions={agencies.map((a) => a.agency)} onSubmit={addAgent} allowLogin={REMOTE && Boolean(onUpdateAgentLogins)} />
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
                    <StaffScore stats={ratingStats(ratings, a.id)} />
                    <div className="pk-admin-expand-label mt-4">Agency</div>
                    <p className="pk-ink-soft text-sm">{a.agency || "Independent"}</p>
                    <div className="pk-admin-expand-label mt-4">Phone number</div>
                    <AgentPhoneEditor agent={a} onSave={savePhone} />
                    {REMOTE && onUpdateAgentLogins && (
                      <AgentAccess agent={a} login={loginActions.loginFor(a)} onGrant={loginActions.grant} onSetStatus={loginActions.setStatus} onRevoke={loginActions.revoke} />
                    )}
                  </div>
                  <div>
                    <div className="pk-admin-expand-label">Notes from agencies</div>
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

// Used by agencies and by agents. An agent sees only the listings they posted and can add or remove them.
// An agency sees every listing posted under it (its own and its agents'), can filter by who posted it,
// and can edit or remove any of them.
const ALL_POSTERS = "All posters";

function AgencyListingsPanel({ role = "agency", agency, userName, listings, allListings, onUpdateListings, onToast }) {
  const isAgent = role === "agent";
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [posterFilter, setPosterFilter] = useState(ALL_POSTERS);

  const posterLabel = (name) => (sameText(name, userName) ? `${name} (you)` : name || "Unknown");
  const posters = [...new Set(listings.map((l) => l.submittedBy || ""))].filter(Boolean).sort((a, b) => a.localeCompare(b));
  const posterOptions = [ALL_POSTERS, ...posters.map(posterLabel)];
  const activePoster = posters.find((p) => posterLabel(p) === posterFilter) || null;

  const visible = listings
    .filter((l) => statusFilter === "all" || l.status === statusFilter)
    .filter((l) => !activePoster || l.submittedBy === activePoster);
  const sorted = [...visible].sort((a, b) => b.id - a.id);

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
      submittedBy: userName,
    };
    onUpdateListings([...allListings, newListing]);
    onToast?.(`"${newListing.title}" submitted for review`, "success");
  };

  const saveEdit = (id, form) => {
    onUpdateListings(allListings.map((l) => (l.id === id ? applyFormToListing(l, form) : l)));
    onToast?.(`"${form.title.trim()}" updated`, "success");
    setEditingId(null);
  };

  const deleteOwn = (id) => {
    const listing = listings.find((l) => l.id === id);
    onUpdateListings(allListings.filter((l) => l.id !== id));
    if (listing) onToast?.(`"${listing.title}" deleted`, "danger");
    setConfirmDelete(null);
  };

  return (
    <div>
      <h2 className="pk-display text-2xl font-semibold mb-1">{isAgent ? "My Listings" : "Listings"}</h2>
      <p className="pk-ink-soft text-sm mb-6">
        {isAgent
          ? `Listings you add land as "Pending" until a superadmin reviews them. You can remove your own listings; ${agency} can also edit them. ${listings.length} total so far.`
          : `Every listing posted under ${agency}, by you or by your agents. Filter by who posted it, and edit or remove any of them. New listings land as "Pending" until a superadmin reviews them. ${listings.length} total.`}
      </p>

      <ListingForm onSubmit={handleAdd} submitLabel="Submit for review" />

      <div className="pk-chip-row mt-6">
        {["all", "pending", "approved", "held", "revoked"].map((f) => (
          <button key={f} className={`pk-chip ${statusFilter === f ? "pk-chip-active" : ""}`} onClick={() => setStatusFilter(f)}>
            {f === "all" ? "All" : LISTING_STATUS_META[f].label}
          </button>
        ))}
      </div>
      {!isAgent && posters.length > 0 && (
        <div className="mt-4" style={{ maxWidth: 320 }}>
          <CustomSelect id="pk-posted-by" label="Posted by" value={activePoster ? posterLabel(activePoster) : ALL_POSTERS} options={posterOptions} onChange={setPosterFilter} />
        </div>
      )}

      <div className="pk-admin-listing-list mt-6">
        {sorted.length === 0 && (
          <p className="pk-ink-soft text-sm">
            {listings.length === 0 ? (isAgent ? "You haven't added any listings yet." : "No listings have been posted under your agency yet.") : "No listings match this view."}
          </p>
        )}
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
                {!isAgent && <p className="pk-ink-soft text-xs">Posted by {l.submittedBy || "—"}</p>}
              </div>
              <div className="pk-admin-listing-actions">
                {!isAgent && (
                  <button className="pk-icon-btn" title="Edit" aria-label="Edit" onClick={() => setEditingId(editingId === l.id ? null : l.id)}>
                    <Pencil size={15} />
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
            {!isAgent && editingId === l.id && (
              <ListingForm initial={l} submitLabel="Save changes" onSubmit={(form) => saveEdit(l.id, form)} onCancel={() => setEditingId(null)} />
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
        onConfirm={() => confirmDelete && deleteOwn(confirmDelete.id)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

function AgencyAgentsPanel({ agents, allAgents, onUpdateAgents, adminName, agency, agentLogins = [], onUpdateAgentLogins, onToast, ratings = [] }) {
  const loginActions = makeLoginActions({ allAgents, agentLogins, onUpdateAgentLogins, onToast });
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
      phone: String(data.phone || "").trim(),
      agency,
      status: "unverified",
      rating: null,
      reviews: 0,
      comments: [],
      img: data.img || "",
    };
    if (data.loginEmail) {
      const problem = loginActions.emailProblem(data.loginEmail, newAgent);
      if (problem) return problem;
    }
    onUpdateAgents([...allAgents, newAgent]);
    if (data.loginEmail) onUpdateAgentLogins([...agentLogins, loginActions.newLogin(newAgent, data.loginEmail)]);
    return "";
  };

  const savePhone = (agent, phone) => {
    onUpdateAgents(allAgents.map((x) => (x.id === agent.id ? { ...x, phone } : x)));
    onToast?.(phone ? `Phone saved for ${agent.name}` : `Phone removed for ${agent.name}`, "success");
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
      <p className="pk-ink-soft text-sm mb-6">
        Agents under your agency and your notes on them. New agents appear on the public site once the superadmin verifies them.
        {REMOTE && onUpdateAgentLogins ? " Give an agent a login so they can add and remove their own listings; you can see and edit everything they post." : ""}
      </p>
      <AgentForm agencyLocked={agency} onSubmit={addAgent} allowLogin={REMOTE && Boolean(onUpdateAgentLogins)} />

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
                <StaffScore stats={ratingStats(ratings, a.id)} />
              </div>
              <div className="pk-admin-listing-actions">
                <button className="pk-icon-btn" title={expandedIds.has(a.id) ? "Collapse" : "View notes"} aria-label={expandedIds.has(a.id) ? "Collapse" : "View notes"} onClick={() => toggleExpand(a.id)}>
                  {expandedIds.has(a.id) ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
              </div>
            </div>
            {expandedIds.has(a.id) && (
              <div className="pk-admin-expand">
                {REMOTE && onUpdateAgentLogins && (
                  <div className="mb-4">
                    <AgentAccess agent={a} login={loginActions.loginFor(a)} onGrant={loginActions.grant} onSetStatus={loginActions.setStatus} onRevoke={loginActions.revoke} />
                  </div>
                )}
                <div className="mb-4">
                  <div className="pk-admin-expand-label">Phone number</div>
                  <AgentPhoneEditor agent={a} onSave={savePhone} />
                </div>
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

// Shared page frame for the agency and agent consoles.
function StaffConsoleShell({ theme, setTheme, onExit, title, subtitle, tabs, tab, setTab, toasts, onDismissToast, children }) {
  return (
    <div className="pk-admin-shell">
      <div className="pk-admin-topbar">
        <div className="flex items-center gap-3">
          <LogoMark size={30} />
          <div>
            <div className="pk-display font-semibold" style={{ lineHeight: 1.15 }}>
              {title}
            </div>
            <div className="pk-ink-soft text-xs">{subtitle}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="pk-icon-btn" aria-label="Toggle theme" onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}>
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button className="pk-btn-outline" onClick={onExit}>
            <LogOut size={15} /> Log out
          </button>
        </div>
      </div>
      <div className="pk-admin-body">
        <nav className="pk-admin-sidebar">
          {tabs.map((t) => {
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
            {children}
          </div>
        </main>
      </div>
      <AdminToastStack toasts={toasts} onDismiss={onDismissToast} />
    </div>
  );
}

function useConsoleToasts() {
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
  return { toasts, showToast, dismissToast };
}

// An agency sees its own listings and its agents' listings, and can edit any of them.
function AgencyConsole({ theme, setTheme, onExit, currentAgency, listings, onUpdateListings, agents, onUpdateAgents, agentLogins, onUpdateAgentLogins, ratings = [] }) {
  const [tab, setTab] = useState("listings");
  const { toasts, showToast, dismissToast } = useConsoleToasts();

  const myAgents = agents.filter((a) => sameText(a.agency, currentAgency.agency));
  const myListings = listings.filter((l) => sameText(l.agency, currentAgency.agency));

  const TABS = [
    { key: "listings", label: "Listings", icon: ClipboardList },
    { key: "agents", label: "My Agents", icon: BadgeCheck },
    { key: "ratings", label: "Ratings", icon: Star },
  ];

  return (
    <StaffConsoleShell
      theme={theme}
      setTheme={setTheme}
      onExit={onExit}
      title="Hao yangu realtors agency"
      subtitle={currentAgency.agency}
      tabs={TABS}
      tab={tab}
      setTab={setTab}
      toasts={toasts}
      onDismissToast={dismissToast}
    >
      {tab === "listings" && (
        <AgencyListingsPanel
          role="agency"
          agency={currentAgency.agency}
          userName={currentAgency.name}
          listings={myListings}
          allListings={listings}
          onUpdateListings={onUpdateListings}
          onToast={showToast}
        />
      )}
      {tab === "agents" && (
        <AgencyAgentsPanel
          agents={myAgents}
          allAgents={agents}
          onUpdateAgents={onUpdateAgents}
          adminName={currentAgency.name}
          agency={currentAgency.agency}
          agentLogins={agentLogins}
          onUpdateAgentLogins={onUpdateAgentLogins}
          onToast={showToast}
          ratings={ratings}
        />
      )}
      {tab === "ratings" && <AgentRatingsPanel agents={myAgents} ratings={ratings} scope="agency" />}
    </StaffConsoleShell>
  );
}

// An agent adds listings and removes their own. They see only what they posted.
function AgentConsole({ theme, setTheme, onExit, currentAgent, listings, onUpdateListings }) {
  const [tab, setTab] = useState("listings");
  const { toasts, showToast, dismissToast } = useConsoleToasts();
  const myListings = listings.filter((l) => sameText(l.agency, currentAgent.agency) && sameText(l.submittedBy, currentAgent.name));
  const TABS = [{ key: "listings", label: "My Listings", icon: ClipboardList }];
  return (
    <StaffConsoleShell
      theme={theme}
      setTheme={setTheme}
      onExit={onExit}
      title="Hao yangu realtors agent"
      subtitle={`${currentAgent.name} · ${currentAgent.agency}`}
      tabs={TABS}
      tab={tab}
      setTab={setTab}
      toasts={toasts}
      onDismissToast={dismissToast}
    >
      <AgencyListingsPanel
        role="agent"
        agency={currentAgent.agency}
        userName={currentAgent.name}
        listings={myListings}
        allListings={listings}
        onUpdateListings={onUpdateListings}
        onToast={showToast}
      />
    </StaffConsoleShell>
  );
}

function AdminConsole({ theme, setTheme, onExit, adminName, listings, onUpdateListings, agents, onUpdateAgents, agencies, onUpdateAgencies, agentLogins, onUpdateAgentLogins, ratings = [] }) {
  const [tab, setTab] = useState("overview");
  const [tabIntent, setTabIntent] = useState(null);
  const [stats, setStats] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
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
          if (!cancelled) {
            setStats(Object.fromEntries((rows || []).map((r) => [r.key, Number(r.count)])));
            setLastUpdated(Date.now());
          }
          return;
        }
        const res = await window.storage.get(STORAGE_KEYS.stats, true);
        if (!cancelled && res && res.value) {
          setStats(JSON.parse(res.value));
          setLastUpdated(Date.now());
        }
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

  const pendingListings = listings.filter((l) => l.status === "pending").length;
  const unverifiedAgents = agents.filter((a) => a.status !== "verified" && a.status !== "banned").length;
  const TABS = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "listings", label: "Listings", icon: ClipboardList, badge: pendingListings, attention: pendingListings > 0 },
    { key: "agencies", label: "Agencies", icon: UserCog, badge: agencies.length },
    { key: "agents", label: "Agents", icon: BadgeCheck, badge: unverifiedAgents, attention: unverifiedAgents > 0 },
    { key: "ratings", label: "Ratings", icon: Star },
  ];
  const activeTab = TABS.find((t) => t.key === tab) || TABS[0];
  const navigate = (key, intent = null) => {
    setTabIntent(intent);
    setTab(key);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const initial = (adminName || "S").trim().charAt(0).toUpperCase();

  return (
    <div className="pk-admin-shell">
      <div className="pk-admin-topbar">
        <div className="flex items-center gap-3">
          <LogoMark size={30} />
          <span className="pk-display font-semibold">Hao yangu realtors admin</span>
        </div>
        <div className="pk-admin-crumb" aria-hidden="true">
          Superadmin <ChevronRight size={14} /> <strong>{activeTab.label}</strong>
        </div>
        <div className="flex items-center gap-2">
          <button className="pk-icon-btn" aria-label="Toggle theme" onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}>
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button className="pk-btn-outline" onClick={onExit}>
            <LogOut size={15} /> Log out
          </button>
        </div>
      </div>
      <div className="pk-admin-body">
        <nav className="pk-admin-sidebar" aria-label="Admin sections">
          <div className="pk-admin-nav-label">Workspace</div>
          {TABS.map((t) => {
            const TIcon = t.icon;
            return (
              <button
                key={t.key}
                className={`pk-admin-nav-item ${tab === t.key ? "pk-admin-nav-active" : ""}`}
                onClick={() => navigate(t.key)}
                aria-current={tab === t.key ? "page" : undefined}
              >
                <TIcon size={16} /> {t.label}
                {t.badge > 0 && <span className={`pk-admin-nav-badge ${t.attention && tab !== t.key ? "pk-admin-nav-attn" : ""}`}>{t.badge}</span>}
              </button>
            );
          })}
          <div className="pk-admin-user">
            <span className="pk-admin-user-avatar" aria-hidden="true">{initial}</span>
            <span className="pk-admin-user-text">
              <strong>{adminName || "Superadmin"}</strong>
              <span>Superadmin</span>
            </span>
          </div>
        </nav>
        <main className="pk-admin-main">
          <div key={tab} className="pk-admin-tab-content">
            {tab === "overview" && (
              <AdminOverview
                listings={listings}
                agents={agents}
                agencies={agencies}
                stats={stats}
                lastUpdated={lastUpdated}
                adminName={adminName}
                onNavigate={navigate}
                onUpdateListings={onUpdateListings}
                onToast={showToast}
              />
            )}
            {tab === "listings" && <AdminListingsPanel listings={listings} onUpdateListings={onUpdateListings} onToast={showToast} adminName={adminName} openForm={Boolean(tabIntent && tabIntent.openForm)} />}
            {tab === "agencies" && (
              <AgenciesPanel agencies={agencies} onUpdateAgencies={onUpdateAgencies} onToast={showToast} listings={listings} agents={agents} />
            )}
            {tab === "agents" && (
              <AdminAgentsPanel
                agents={agents}
                onUpdateAgents={onUpdateAgents}
                onToast={showToast}
                ratings={ratings}
                agencies={agencies}
                agentLogins={agentLogins}
                onUpdateAgentLogins={onUpdateAgentLogins}
              />
            )}
            {tab === "ratings" && <AgentRatingsPanel agents={agents} ratings={ratings} scope="all" />}
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
  const [theme, setTheme] = useState(readStoredTheme);
  const [appLoading, setAppLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [page, setPage] = useState("home");
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
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
  // No seed data — listings are added only by the superadmin, agencies and agents via their dashboards.
  const [listings, setListings] = useState([]);
  const [agents, setAgents] = useState(AGENTS);
  const [agencies, setAgencies] = useState([]);
  const [agentLogins, setAgentLogins] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [ratingSummary, setRatingSummary] = useState({});
  const [reviewsVersion, setReviewsVersion] = useState(0);
  const [localRaterId] = useState(getLocalRaterId);
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
  const agencyListRef = useRef([]);
  const agentLoginListRef = useRef([]);
  listingsRef.current = listings;
  agentListRef.current = agents;
  agencyListRef.current = agencies;
  agentLoginListRef.current = agentLogins;
  const refreshRemoteRef = useRef(null);

  const pendingStatsRef = useRef({});
  const statsFlushScheduled = useRef(false);

  const [searchSheetOpen, setSearchSheetOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const heroRef = useRef(null);
  const featuredRef = useRef(null);
  const agentsRef = useRef(null);
  const ctaRef = useRef(null);

  // Remember the theme, and keep the page background and phone address-bar colour in step with it.
  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      /* private browsing: the choice just lasts for this visit */
    }
    document.documentElement.setAttribute("data-theme", theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#1E1D2F" : "#FAEEEE");
  }, [theme]);
  // If the theme is changed in another tab, follow it.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === THEME_KEY && (e.newValue === "dark" || e.newValue === "light")) setTheme(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // The welcome screen stays until the listings and the sign-in check have finished (with a time limit),
  // so a refresh never flashes "0 properties found" or a logged-out header first.
  const [splashMinDone, setSplashMinDone] = useState(false);
  const [splashCapped, setSplashCapped] = useState(false);
  useEffect(() => {
    const min = setTimeout(() => setSplashMinDone(true), splashSeen() ? 250 : 900);
    const cap = setTimeout(() => setSplashCapped(true), 6000);
    return () => {
      clearTimeout(min);
      clearTimeout(cap);
    };
  }, []);
  useEffect(() => {
    const staffPending = REMOTE && Boolean(account) && staffState === "unknown";
    if (splashMinDone && ((dataReady && (authChecked || !AUTH_ENABLED) && !staffPending) || splashCapped)) {
      setAppLoading(false);
      try {
        window.sessionStorage.setItem(SPLASH_KEY, "1");
      } catch (e) {
        /* ignore */
      }
    }
  }, [splashMinDone, splashCapped, dataReady, authChecked, account, staffState]);

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
  // Starts empty on first-ever load — real listings come only from the superadmin, agencies and agents.
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

  // Without a shared database (local testing), ratings are kept in this browser.
  useEffect(() => {
    if (REMOTE) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEYS.ratings, true);
        if (!cancelled && res && res.value) setRatings(JSON.parse(res.value));
      } catch (e) {
        /* no ratings saved yet */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshRemote = async () => {
    try {
      // Agents sign in as staff too, but only agencies and the superadmin get the private agent notes and logins.
      const data = await fetchRemoteData(Boolean(currentUser && currentUser.role === "superadmin"), Boolean(currentUser && currentUser.role !== "agent"));
      setListings(data.listings);
      setAgents(data.agents);
      if (data.agencies) setAgencies(data.agencies);
      if (data.agentLogins) setAgentLogins(data.agentLogins);
      if (data.ratings) setRatings(data.ratings);
      if (data.ratingSummary) setRatingSummary(data.ratingSummary);
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

  // ---------- Rating an agent ----------
  // Remote: one rating per person per agent, kept by the database (saving again updates it).
  const myRaterId = REMOTE ? (account && account.id) || "" : localRaterId;
  const saveLocalRatings = (next) => {
    setRatings(next);
    window.storage?.set(STORAGE_KEYS.ratings, JSON.stringify(next), true).catch(() => {});
  };
  const rateAgentCore = async (agentId, stars, comment) => {
    const raterName = String((account && account.name) || (currentUser && currentUser.name) || "Visitor").trim().slice(0, 80);
    const now = new Date().toISOString();
    if (REMOTE) {
      const session = await getValidSession();
      if (!session) throw Object.assign(new Error("Not signed in"), { status: 401 });
      const rows = await sbRequest("/rest/v1/agent_ratings?on_conflict=agent_id,user_id", {
        method: "POST",
        token: session.access_token,
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: { agent_id: agentId, stars, comment, rater_name: raterName },
      });
      const saved = Array.isArray(rows) && rows[0] ? ratingFromRow(rows[0]) : { id: `${agentId}-${myRaterId}`, agentId, userId: myRaterId, stars, comment, raterName, createdAt: now, updatedAt: now };
      setRatings((prev) => [saved, ...prev.filter((r) => !(r.agentId === agentId && r.userId === myRaterId))]);
      return;
    }
    const existing = ratings.find((r) => r.agentId === agentId && r.userId === myRaterId);
    const entry = { id: existing ? existing.id : `${agentId}-${myRaterId}`, agentId, userId: myRaterId, stars, comment, raterName, createdAt: existing ? existing.createdAt : now, updatedAt: now };
    saveLocalRatings([entry, ...ratings.filter((r) => !(r.agentId === agentId && r.userId === myRaterId))]);
  };
  const removeAgentRatingCore = async (agentId) => {
    if (REMOTE) {
      const session = await getValidSession();
      if (!session) throw Object.assign(new Error("Not signed in"), { status: 401 });
      await sbRequest(`/rest/v1/agent_ratings?agent_id=eq.${encodeURIComponent(agentId)}`, { method: "DELETE", token: session.access_token });
      setRatings((prev) => prev.filter((r) => !(r.agentId === agentId && r.userId === myRaterId)));
      return;
    }
    saveLocalRatings(ratings.filter((r) => !(r.agentId === agentId && r.userId === myRaterId)));
  };

  // What signed-in visitors see: per-agent averages and written reviews (first names only).
  const summaryFor = (agentId) => {
    if (!REMOTE) {
      const st = ratingStats(ratings, agentId);
      return st.count ? st : null;
    }
    return ratingSummary[agentId] || null;
  };
  const loadReviews = async (agentId) => {
    if (!REMOTE) {
      return ratings
        .filter((r) => r.agentId === agentId && r.comment)
        .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
        .map((r) => ({ stars: r.stars, comment: r.comment, reviewer: firstNameOf(r.raterName), updatedAt: r.updatedAt, mine: r.userId === myRaterId }));
    }
    const session = await getValidSession();
    if (!session) return [];
    const rows = await sbRequest("/rest/v1/rpc/agent_reviews", { method: "POST", token: session.access_token, body: { p_agent_id: agentId } });
    return (Array.isArray(rows) ? rows : []).map((r) => ({ stars: Number(r.stars) || 0, comment: r.comment || "", reviewer: r.reviewer || "A visitor", updatedAt: r.updated_at || "", mine: Boolean(r.mine) }));
  };
  const refreshRatingSummary = async () => {
    if (!REMOTE) return;
    try {
      const session = await getValidSession();
      if (session) setRatingSummary(await fetchRatingSummary(session.access_token));
    } catch (e) {
      /* the next refresh will pick it up */
    }
  };
  const rateAgent = async (agentId, stars, comment) => {
    await rateAgentCore(agentId, stars, comment);
    await refreshRatingSummary();
    setReviewsVersion((v) => v + 1);
  };
  const removeAgentRating = async (agentId) => {
    await removeAgentRatingCore(agentId);
    await refreshRatingSummary();
    setReviewsVersion((v) => v + 1);
  };

  useEffect(() => {
    if (REMOTE) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEYS.agencies, true);
        if (!cancelled && res && res.value) setAgencies(JSON.parse(res.value));
      } catch (e) {
        /* no agencies saved yet — continue with empty list */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateAgencies = (next) => {
    if (REMOTE) {
      remoteUpdate("staff", agencyListRef, setAgencies, next, staffToRow);
      return;
    }
    setAgencies(next);
    window.storage?.set(STORAGE_KEYS.agencies, JSON.stringify(next), true).catch(() => {});
  };

  // Agent logins only exist on the live (Supabase) site.
  const updateAgentLogins = (next) => {
    if (!REMOTE) return;
    remoteUpdate("agent_logins", agentLoginListRef, setAgentLogins, next, agentLoginToRow);
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

  // Superadmins, agencies and agents live in their own dashboard. As soon as one of them is signed in (or is
  // waiting at the two-step code screen) the public site is never shown to them; they are taken straight to
  // their dashboard and stay there until they log out. Ordinary visitors and customers are not affected.
  const staffLockedIn =
    Boolean(currentUser && isStaffUser(currentUser)) ||
    (REMOTE && Boolean(account) && (staffState === "mfa-code" || staffState === "mfa-enrol"));
  // Signed in, but the database hasn't yet said who this is: show a short "signing you in" screen
  // instead of flashing the public site and then jumping to the dashboard.
  const checkingStaff = REMOTE && Boolean(account) && staffState === "unknown";
  const effectivePage = staffLockedIn ? "admin" : page;
  const staffLockedRef = useRef(false);
  staffLockedRef.current = staffLockedIn;
  useEffect(() => {
    if (staffLockedIn && page !== "admin") {
      setPage("admin");
      setScrollTarget("top");
      setMenuOpen(false);
      setAuthOpen(false);
    }
  }, [staffLockedIn, page]);

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

  const viewAgent = (id) => {
    setSelectedAgentId(id);
    logEvent("pageViews");
    setPage("agent");
    setScrollTarget("top");
    setMenuOpen(false);
  };
  const openAgent = (id) => {
    if (locked) {
      saveIntent(`/agent/${id}`);
      openAuth("signup", GATE_AGENT_MESSAGE);
      return;
    }
    viewAgent(id);
  };
  // Someone arriving straight on an agent's address sees the sign-up pop-up once.
  const gateAutoForAgent = useRef(null);
  useEffect(() => {
    if (!(page === "agent" && locked && authChecked)) return;
    if (gateAutoForAgent.current === selectedAgentId) return;
    gateAutoForAgent.current = selectedAgentId;
    saveIntent(`/agent/${selectedAgentId}`);
    setAuthIntro(GATE_AGENT_MESSAGE);
    setAuthTab("signup");
    setAuthOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, locked, authChecked, selectedAgentId]);

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
    if (page === "agent" && selectedAgentId !== null) return `/agent/${selectedAgentId}`;
    if (page === "advertise") return "/advertise";
    if (page === "privacy") return "/privacy";
    if (page === "terms") return "/terms";
    if (page === "verification") return "/verification";
    if (page === "profile") return "/saved";
    if (page === "admin") return "/admin";
    return "/";
  };
  // Search filters live in the address (?q=…&s=…&b=…&o=…) so a refresh or a shared link keeps them.
  const applyFiltersFromSearch = (category, search) => {
    const sp = new URLSearchParams(search || "");
    const meta = category === "all" ? { secondaryOptions: [], budgetOptions: TAB_META.buy.budgetOptions } : TAB_META[category];
    const q = sp.get("q");
    if (q) setLocation(q.slice(0, 80));
    const sec = sp.get("s");
    if (sec && meta.secondaryOptions.includes(sec)) setSecondary(sec);
    const bud = sp.get("b");
    if (bud && meta.budgetOptions.includes(bud)) setBudget(bud);
    const ord = sp.get("o");
    if (ord && SORT_OPTIONS.includes(ord)) setSortBy(ord);
  };
  const applyPath = (path, search = "") => {
    if (staffLockedRef.current) {
      setPage("admin");
      setScrollTarget("top");
      if (window.location.pathname !== "/admin") window.history.replaceState(null, "", "/admin");
      return;
    }
    const clean = path.replace(/\/+$/, "") || "/";
    const detail = clean.match(/^\/listing\/(\d+)$/);
    if (detail) {
      setSelectedPropertyId(Number(detail[1]));
      setPage("detail");
    } else if (clean.match(/^\/agent\/(\d+)$/)) {
      setSelectedAgentId(Number(clean.match(/^\/agent\/(\d+)$/)[1]));
      setPage("agent");
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
      applyFiltersFromSearch("all", search);
      setPage("listings");
    } else if (["/buy", "/rent", "/commercial", "/land"].includes(clean)) {
      switchListingCategory(clean.slice(1));
      setLocation("");
      applyFiltersFromSearch(clean.slice(1), search);
      setPage("listings");
    } else {
      setPage("home");
    }
    setScrollTarget("top");
  };
  useEffect(() => {
    applyPath(window.location.pathname, window.location.search);
    setRouterReady(true);
    const onPop = () => applyPath(window.location.pathname, window.location.search);
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

  const firstAddressSync = useRef(true);
  useEffect(() => {
    if (!routerReady) return;
    const path = pathForState();
    if (window.location.pathname !== path) {
      // A mistyped or old address is tidied in place, so Back doesn't land on it again.
      if (firstAddressSync.current) window.history.replaceState(null, "", path);
      else window.history.pushState(null, "", path);
    }
    firstAddressSync.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routerReady, page, listingCategory, selectedPropertyId, selectedAgentId]);

  // Keep the search filters in the address while on a listings page.
  useEffect(() => {
    if (!routerReady || page !== "listings" || window.location.pathname !== pathForState()) return;
    const meta = listingCategory === "all" ? { secondaryOptions: [], budgetOptions: TAB_META.buy.budgetOptions } : TAB_META[listingCategory];
    const sp = new URLSearchParams();
    if (location.trim()) sp.set("q", location.trim());
    if (meta.secondaryOptions.length && secondary !== meta.secondaryOptions[0]) sp.set("s", secondary);
    if (budget !== meta.budgetOptions[0]) sp.set("b", budget);
    if (sortBy !== SORT_OPTIONS[0]) sp.set("o", sortBy);
    const qs = sp.toString();
    const want = qs ? `?${qs}` : "";
    if (window.location.search !== want) window.history.replaceState(null, "", window.location.pathname + want);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routerReady, page, listingCategory, location, secondary, budget, sortBy]);

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

  // The "Featured listings" section on the home page shows featured (promoted) listings only, newest first.
  // Ordinary listings are never used to fill it; they are all under "View all" and the category pages.
  const homeFeatured = useMemo(() => approvedListings.filter(isFeatured).sort((a, b) => b.id - a.id).slice(0, 8), [approvedListings]);

  // The home carousel shows promoted (featured) listings only: newest first, at most five.
  const heroFeatured = useMemo(() => approvedListings.filter(isFeatured).sort((a, b) => b.id - a.id).slice(0, 5), [approvedListings]);

  const selectedProperty = approvedListings.find((p) => p.id === selectedPropertyId) || null;
  const selectedAgent = agents.find((a) => a.id === selectedAgentId && a.status === "verified") || null;
  const myRatingForSelected = selectedAgent ? ratings.find((r) => r.agentId === selectedAgent.id && r.userId === myRaterId) || null : null;

  useEffect(() => {
    const base = SITE_CONFIG.name;
    let title = `${base} | Where property meets possibilities`;
    let desc = "Browse homes for sale, rentals, commercial spaces and land. Hao yangu realtors: where property meets possibilities.";
    const names = { buy: "Homes for sale", rent: "Homes to rent", commercial: "Commercial spaces", land: "Land for sale", all: "All listings" };
    if (page === "listings") title = `${names[listingCategory] || "Listings"} | ${base}`;
    else if (page === "agents") title = `Our agents | ${base}`;
    else if (page === "agent") {
      const ag = agents.find((x) => x.id === selectedAgentId);
      title = ag ? `${ag.name}, agent | ${base}` : `Agent | ${base}`;
    }
    else if (page === "advertise") title = `Promote your listing | ${base}`;
    else if (page === "privacy") title = `Privacy Policy | ${base}`;
    else if (page === "terms") title = `Terms of Use | ${base}`;
    else if (page === "verification") title = `What Verified means | ${base}`;
    else if (page === "profile") title = `Saved properties | ${base}`;
    else if (page === "admin") title = currentUser && isStaffUser(currentUser) ? `Dashboard | ${base}` : `Staff sign in | ${base}`;
    else if (page === "detail" && selectedProperty) {
      title = `${selectedProperty.title}, ${selectedProperty.location} | ${base}`;
      desc = (selectedProperty.description || "").slice(0, 155) || desc;
    }
    document.title = title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", desc);
  }, [page, listingCategory, selectedProperty, selectedAgentId, agents, currentUser && currentUser.role]);
  const similarProperties = useMemo(() => {
    if (!selectedProperty) return [];
    return approvedListings.filter((p) => p.tag === selectedProperty.tag && p.id !== selectedProperty.id).slice(0, 3);
  }, [approvedListings, selectedProperty]);
  const currentCategory =
    page === "listings"
      ? listingCategory
      : page === "detail" && selectedProperty
      ? selectedProperty.tag.toLowerCase()
      : page === "agents" || page === "agent"
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
        if (!session) {
          if (!cancelled) setStaffState("none");
          return;
        }
        let profile = await sbRequest("/rest/v1/rpc/my_staff_profile", { method: "POST", token: session.access_token, body: {} });
        if (cancelled) return;
        let isAgentLogin = false;
        if (!(profile && profile.role)) {
          // Not an agency or superadmin. An agent has a login of their own; if the database doesn't know this
          // email as an agent either (or the update hasn't been applied yet), they are an ordinary account.
          try {
            const agentProfile = await sbRequest("/rest/v1/rpc/my_agent_profile", { method: "POST", token: session.access_token, body: {} });
            if (agentProfile && agentProfile.role === "agent") {
              profile = agentProfile;
              isAgentLogin = true;
            }
          } catch (e) {
            profile = null;
          }
          if (cancelled) return;
        }
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
        // The database calls an agency "admin"; on the site it is an "agency".
        setCurrentUser({
          name: displayNameFor(account.email, profile.name, account.name),
          avatar: account.avatar || "",
          email: account.email,
          isSuperAdmin: isSuper,
          role: isSuper ? "superadmin" : isAgentLogin ? "agent" : "agency",
          agency: profile.agency || "",
          staffId: profile.id,
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
    setRatings([]);
    setRatingSummary({});
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

      {checkingStaff && !showLoader && (
        <div role="status" aria-live="polite" style={{ position: "fixed", inset: 0, zIndex: 900, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, background: "var(--bg)", color: "var(--ink)" }}>
          <LogoMark size={44} />
          <p className="pk-ink-soft text-sm">Signing you in…</p>
        </div>
      )}

      {effectivePage === "admin" ? (
        currentUser?.role === "superadmin" ? (
          <AdminConsole
            theme={theme}
            setTheme={setTheme}
            adminName={currentUser?.name}
            onExit={handleLogout}
            listings={listings}
            onUpdateListings={updateListings}
            agents={agents}
            onUpdateAgents={updateAgents}
            ratings={ratings}
            agencies={agencies}
            onUpdateAgencies={updateAgencies}
            agentLogins={agentLogins}
            onUpdateAgentLogins={REMOTE ? updateAgentLogins : undefined}
          />
        ) : currentUser?.role === "agency" ? (
          <AgencyConsole
            theme={theme}
            setTheme={setTheme}
            onExit={handleLogout}
            currentAgency={currentUser}
            ratings={ratings}
            listings={listings}
            onUpdateListings={updateListings}
            agents={agents}
            onUpdateAgents={updateAgents}
            agentLogins={agentLogins}
            onUpdateAgentLogins={REMOTE ? updateAgentLogins : undefined}
          />
        ) : currentUser?.role === "agent" ? (
          <AgentConsole
            theme={theme}
            setTheme={setTheme}
            onExit={handleLogout}
            currentAgent={currentUser}
            listings={listings}
            onUpdateListings={updateListings}
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
            onExit={staffLockedIn ? undefined : goHome}
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
          <StaffGate agencies={agencies} onAuthenticate={(user) => { setCurrentUser(user); }} onExit={goHome} />
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
                {isStaffUser(currentUser) && (
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
              {isStaffUser(currentUser) && (
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
      <section className="mx-auto max-w-7xl px-4 md:px-8 pb-7 md:pb-12">
        <div className="pk-stats-band">
          {(() => {
            // A stat that is still zero (for example verified agents) is left out rather than shown as "0".
            const shown = liveStats.filter((st) => st.target > 0);
            return (
              <div className="pk-stats-grid" style={{ gridTemplateColumns: `repeat(${Math.max(shown.length, 1)}, 1fr)` }}>
                {shown.map((st) => (
                  <StatItem key={st.label} stat={st} />
                ))}
              </div>
            );
          })()}
        </div>
      </section>
      )}

      {/* ---------------- CATEGORIES ---------------- */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 pb-8 md:pb-16">
        <div className="flex items-end justify-between mb-3 md:mb-6 gap-4">
          <div>
            <p className="pk-mono text-xs pk-ink-soft uppercase tracking-wide mb-1">Browse by category</p>
            <h2 className="pk-display text-xl md:text-3xl font-semibold">Whatever you're after, start here.</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-5">
          {CATEGORIES.map((cat) => {
            const CatIcon = cat.icon;
            const count = approvedListings.filter((l) => l.tag.toLowerCase() === cat.key).length;
            return (
              <button
                key={cat.key}
                onClick={() => handleNavClick(cat.key)}
                className="pk-card pk-cat-card text-left"
              >
                <div className="pk-category-icon">
                  <CatIcon size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="pk-display text-base md:text-lg font-semibold">{cat.title}</h3>
                  <p className="pk-ink-soft text-sm mt-1 hidden md:block">{cat.blurb}</p>
                  <div className="pk-mono text-xs pk-primary-text mt-0.5 md:mt-3 flex items-center gap-1 whitespace-nowrap">
                    {count} listing{count === 1 ? "" : "s"} <ArrowUpRight size={12} className="hidden md:inline-block" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ---------------- FEATURED PROPERTIES ---------------- */}
      {(approvedListings.length === 0 || homeFeatured.length > 0) && (
      <section ref={featuredRef} className="mx-auto max-w-7xl px-4 md:px-8 pb-8 md:pb-16">
        <div className="flex items-end justify-between mb-3 md:mb-6 gap-4">
          <div>
            <p className="pk-mono text-xs pk-ink-soft uppercase tracking-wide mb-1">Promoted</p>
            <h2 className="pk-display text-xl md:text-3xl font-semibold">Featured listings</h2>
          </div>
          {approvedListings.length > 0 && (
            <button className="pk-btn-outline pk-btn-sm" onClick={() => goToListings("all")}>
              View all <ArrowRight size={14} />
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
                  style={{ width: "min(62vw, 240px)" }}
                />
              ))}
            </div>
            <div className="pk-promo-note">
              <span className="pk-promo-icon" aria-hidden="true"><Star size={16} fill="currentColor" /></span>
              <p>
                <strong>Featured</strong> listings are promoted by their agents and shown first.
              </p>
              <button type="button" className="pk-promo-btn" onClick={goToAdvertise}>
                Promote yours <ArrowRight size={14} />
              </button>
            </div>
          </>
        )}
      </section>
      )}

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 pb-8 md:pb-16">
        <p className="pk-mono text-xs pk-ink-soft uppercase tracking-wide mb-1">How it works</p>
        <h2 className="pk-display text-xl md:text-3xl font-semibold mb-3 md:mb-6">Three steps to your hao.</h2>
        <div className="grid md:grid-cols-3 gap-2.5 md:gap-5">
          {STEPS.map((step) => (
            <div key={step.n} className="pk-step">
              <span className="pk-step-badge" aria-hidden="true">{Number(step.n)}</span>
              <div className="min-w-0">
                <h3 className="pk-display text-base md:text-lg font-semibold">{step.title}</h3>
                <p className="pk-ink-soft text-sm leading-snug mt-0.5">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- AGENTS ---------------- */}
      {verifiedAgents.length > 0 && (
      <section ref={agentsRef} className="mx-auto max-w-7xl px-4 md:px-8 pb-8 md:pb-16">
        <div className="flex items-end justify-between mb-3 md:mb-6 gap-4">
          <div>
            <p className="pk-mono text-xs pk-ink-soft uppercase tracking-wide mb-1">Trusted network</p>
            <h2 className="pk-display text-xl md:text-3xl font-semibold">Meet a few of our agents</h2>
          </div>
          <button className="pk-btn-outline pk-btn-sm" onClick={goToAgents}>
            <Users size={14} /> View all
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-5">
          {verifiedAgents.map((a) => (
            <AgentCard key={a.id} agent={a} onOpen={openAgent} propertyCount={locked ? undefined : agentListings(a, approvedListings).length} summary={locked ? null : summaryFor(a.id)} />
          ))}
        </div>
      </section>
      )}

      {/* ---------------- CONTACT CTA ---------------- */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 pb-8 md:pb-16">
        <div ref={ctaRef} className="pk-cta-band px-5 py-6 md:px-12 md:py-10 flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-8 justify-between">
          <div className="max-w-lg">
            <p className="pk-mono text-xs uppercase tracking-wide mb-2 opacity-80">For buyers & renters</p>
            <h2 className="pk-display text-xl md:text-3xl font-semibold mb-2">Ready to buy or rent?</h2>
            <p className="opacity-85 text-sm md:text-base leading-snug">
              {AUTH_ENABLED && !account && !currentUser
                ? "Create a free account to save listings and see them on any phone or computer, so you can pick up right where you left off."
                : "Browse reviewed listings across Buy, Rent, Commercial and Land, then contact the listing owner or agent directly. Not sure where to start? Email us and we'll point you in the right direction."}
            </p>
          </div>
          <button
            className="pk-mono flex items-center justify-center gap-2 font-semibold px-6 py-3 rounded-full flex-shrink-0"
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

      {page === "agents" && <AgentsPage agents={agents} listings={approvedListings} onBackHome={goHome} onOpenVerification={goToVerification} locked={locked} onOpenAgent={openAgent} summaryFor={summaryFor} />}

      {page === "agent" && locked && authChecked && (
        <section className="mx-auto max-w-2xl px-4 pt-16 md:pt-24 pb-24 text-center">
          {selectedAgent && (
            <div className="mb-6 flex flex-col items-center">
              <ImageWithFallback src={selectedAgent.img} alt={selectedAgent.name} className="pk-agent-profile-photo" iconFallback={Users} eager />
              <h2 className="pk-display text-2xl font-semibold mt-4">{selectedAgent.name}</h2>
              <p className="pk-ink-soft text-sm mt-1">{[selectedAgent.focus, selectedAgent.area].filter(Boolean).join(" · ")}</p>
            </div>
          )}
          <h1 className="pk-display text-3xl font-semibold mb-3">Create a free account to see agent details</h1>
          <p className="pk-ink-soft text-sm mb-6">Phone numbers, properties and ratings are shown to people with an account. It takes a minute.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button className="pk-btn-primary" onClick={() => openAuth("signup", GATE_AGENT_MESSAGE)}>
              <UserPlus size={15} /> Create free account
            </button>
            <button className="pk-btn-outline" onClick={() => openAuth("login")}>
              Log in
            </button>
          </div>
        </section>
      )}

      {page === "agent" && !locked && selectedAgent && (
        <AgentDetailPage
          key={selectedAgent.id}
          agent={selectedAgent}
          listings={agentListings(selectedAgent, approvedListings)}
          myRating={myRatingForSelected}
          summary={summaryFor(selectedAgent.id)}
          loadReviews={loadReviews}
          reviewsVersion={reviewsVersion}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onOpenListing={openListing}
          onBackHome={goHome}
          onBackAgents={goToAgents}
          onRate={rateAgent}
          onRemoveRating={removeAgentRating}
        />
      )}

      {page === "agent" && !locked && !selectedAgent && (
        <section className="mx-auto max-w-2xl px-4 pt-28 pb-24 text-center">
          {dataReady ? (
            <>
              <h1 className="pk-display text-2xl font-semibold mb-2">This agent isn't available</h1>
              <p className="pk-ink-soft text-sm mb-6">They may have been removed, or they aren't listed on the site right now.</p>
              <button className="pk-btn-primary" style={{ margin: "0 auto" }} onClick={goToAgents}>
                <Users size={15} /> See all agents
              </button>
            </>
          ) : (
            <p className="pk-ink-soft text-sm">Loading…</p>
          )}
        </section>
      )}

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
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-8 md:py-14">
          <div className="pk-footer-grid">
            <div className="pk-footer-brand">
              <div className="flex items-center gap-2.5 mb-3 cursor-pointer" onClick={goHome}>
                <LogoMark size={30} />
                <span className="pk-display" style={{ fontSize: "1.2rem" }}>Hao yangu realtors</span>
              </div>
              <p className="pk-ink-soft text-sm max-w-xs">
                Buy, rent, lease or list — all in one place.
              </p>
              {Object.values(SITE_CONFIG.socials).some(Boolean) && (
                <div className="flex flex-wrap items-center gap-2 mt-3 md:mt-5">
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
              <h4 className="font-semibold text-sm mb-2.5">Explore</h4>
              <ul className="flex flex-col gap-2 text-sm">
                <li><button className="pk-footer-link" onClick={() => goToListings("buy", { resetFilters: true })}>Buy a home</button></li>
                <li><button className="pk-footer-link" onClick={() => goToListings("rent", { resetFilters: true })}>Rent a home</button></li>
                <li><button className="pk-footer-link" onClick={() => goToListings("commercial", { resetFilters: true })}>Commercial spaces</button></li>
                <li><button className="pk-footer-link" onClick={() => goToListings("land", { resetFilters: true })}>Land</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2.5">Get in touch</h4>
              <ul className="flex flex-col gap-2 text-sm">
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

          <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-5 mt-6 md:pt-8 md:mt-10 text-xs pk-ink-soft" style={{ borderTop: "1px solid var(--border)" }}>
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
