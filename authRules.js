// Sign-up / login rules for Hao yangu realtors.
// Pure functions with no React in them, so the same rules are used by the sign-up form,
// the password-reset form and the staff sign-in, and are easy to test.
//
// IMPORTANT: browser checks only guide people. Anyone can call the sign-up service directly,
// so the SAME minimums must also be set in Supabase (see "Sign-up and login security" in README.md).

export const PASSWORD_MIN = 10;
export const PASSWORD_MAX = 72; // the password-hashing method used by Supabase ignores or rejects anything longer
export const EMAIL_MAX = 254;
export const NAME_MIN = 2;
export const NAME_MAX = 60;

/* ------------------------------------------------------------------ email */

export const normalizeEmail = (raw) => String(raw || "").trim().toLowerCase();

const LOCAL_CHARS = /^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+$/;
const LABEL_CHARS = /^[a-z0-9-]+$/;

// Returns { ok, email, message }. "email" is always the trimmed, lower-case form.
export function validateEmail(raw) {
  const email = normalizeEmail(raw);
  const bad = (message) => ({ ok: false, email, message });
  if (!email) return bad("Enter your email address.");
  const generic = "Enter a valid email address, like you@email.com.";
  if (email.length > EMAIL_MAX) return bad("That email address is too long.");
  const parts = email.split("@");
  if (parts.length !== 2) return bad(generic);
  const [local, domain] = parts;
  if (!local || local.length > 64 || !LOCAL_CHARS.test(local)) return bad(generic);
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) return bad(generic);
  const labels = domain.split(".");
  if (labels.length < 2) return bad(generic);
  for (const label of labels) {
    if (!label || label.length > 63 || !LABEL_CHARS.test(label)) return bad(generic);
    if (label.startsWith("-") || label.endsWith("-")) return bad(generic);
  }
  const tld = labels[labels.length - 1];
  if (!(/^[a-z]{2,}$/.test(tld) || /^xn--[a-z0-9-]+$/.test(tld))) return bad(generic);
  return { ok: true, email, message: "" };
}

const COMMON_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "live.com",
  "protonmail.com",
  "me.com",
];

function editDistance(a, b) {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const temp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = temp;
    }
  }
  return prev[b.length];
}

// A gentle "did you mean" for typos like gmail.con. Never blocks anything. Returns a full address or null.
export function suggestEmailFix(raw) {
  const email = normalizeEmail(raw);
  const at = email.lastIndexOf("@");
  if (at < 1) return null;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  // Only plain two-part domains (name.com). Longer ones such as name.co.ke are usually genuine, so leave them alone.
  if (domain.length < 6 || domain.split(".").length !== 2 || COMMON_DOMAINS.includes(domain)) return null;
  let best = null;
  let bestDistance = 3;
  for (const candidate of COMMON_DOMAINS) {
    const d = editDistance(domain, candidate);
    if (d < bestDistance) {
      best = candidate;
      bestDistance = d;
    }
  }
  return best && bestDistance <= 2 ? `${local}@${best}` : null;
}

/* ------------------------------------------------------------------- name */

// Returns { ok, name, message }. "name" has stray spaces tidied.
export function validateName(raw) {
  const name = String(raw || "").replace(/\s+/g, " ").trim();
  const bad = (message) => ({ ok: false, name, message });
  if (!name) return bad("Please enter your name.");
  if (name.length < NAME_MIN) return bad("Please enter your full name.");
  if (name.length > NAME_MAX) return bad(`Keep your name to ${NAME_MAX} characters or fewer.`);
  if (!/\p{L}/u.test(name)) return bad("Your name needs to include letters.");
  if (/[<>]/.test(name) || /[\u0000-\u001f\u007f]/.test(name)) return bad("Your name can't include < or > symbols.");
  return { ok: true, name, message: "" };
}

/* --------------------------------------------------------------- password */

// Words people pick far too often. Compared after removing digits, symbols and common look-alike swaps
// (p@ssw0rd123! -> password), so one entry covers many variations.
const COMMON_WORDS = [
  "password", "passcode", "passphrase", "mypassword", "yourpassword", "newpassword", "changeme", "letmein", "welcome",
  "login", "admin", "administrator", "root", "user", "guest", "test", "testing", "default", "secret", "master",
  "qwerty", "qwertyuiop", "qwertyui", "asdfghjkl", "asdfgh", "zxcvbnm", "qazwsx", "azerty", "abcdefgh", "abcdefghij",
  "iloveyou", "ilovemyself", "iloveu", "loveyou", "lovelove", "sunshine", "princess", "monkey", "dragon", "shadow",
  "superman", "batman", "football", "baseball", "basketball", "liverpool", "arsenal", "chelsea", "manutd", "barcelona",
  "freedom", "whatever", "trustno", "hello", "hellohello", "football", "charlie", "michael", "jordan", "jennifer",
  "computer", "internet", "google", "facebook", "whatsapp", "mpesa", "safaricom", "equity", "jambo", "asante",
  "hakuna", "matata", "harambee", "kenya", "kenyan", "nairobi", "mombasa", "nakuru", "kisumu", "eldoret", "thika",
  "realtor", "realtors", "realestate", "property", "house", "home", "haoyangu", "haoyangurealtors",
];

const COMMON_EXACT = new Set([
  "1234567890", "12345678910", "0123456789", "9876543210", "0987654321", "1111111111", "0000000000", "1234512345",
  "1q2w3e4r5t", "1qaz2wsx3edc", "1q2w3e4r5t6y", "qwerty1234", "qwerty12345", "qwerty123456", "123qweasdzxc",
  "password1", "password12", "password123", "password1234", "passw0rd123", "iloveyou123", "welcome123", "abc1234567",
]);

const LEET = { "@": "a", "4": "a", "3": "e", "1": "i", "!": "i", "0": "o", "$": "s", "5": "s", "7": "t", "8": "b" };

function letterSkeletons(password) {
  const lower = password.toLowerCase();
  const plain = lower.replace(/[^a-z]/g, "");
  // Trim digits/symbols from both ends (the usual "Password2024!" habit), then undo look-alike swaps inside.
  const trimmed = lower.replace(/^[^a-z]+/, "").replace(/[^a-z]+$/, "");
  const swapped = trimmed
    .split("")
    .map((ch) => LEET[ch] || ch)
    .join("")
    .replace(/[^a-z]/g, "");
  return [plain, swapped].filter(Boolean);
}

const SEQUENCES = ["0123456789", "abcdefghijklmnopqrstuvwxyz", "qwertyuiop", "asdfghjkl", "zxcvbnm"];

function isPredictable(password) {
  const lower = password.toLowerCase();
  if (COMMON_EXACT.has(lower)) return true;
  if (/^(.)\1+$/.test(lower)) return true; // aaaaaaaaaa
  if (/^(.{1,4})\1+$/.test(lower)) return true; // 12341234, abab...
  if (new Set(lower).size <= 3) return true; // aaaaaaaaaa1, 1212121212a: almost no variety at all
  if (/^[a-z0-9]+$/.test(lower)) {
    const reversed = lower.split("").reverse().join("");
    if (SEQUENCES.some((s) => s.includes(lower) || s.includes(reversed))) return true; // 234567890, qwertyuiop
  }
  for (const skeleton of letterSkeletons(password)) {
    for (const word of COMMON_WORDS) {
      if (skeleton === word) return true;
      // the same common word typed twice or three times
      if (skeleton.length > word.length && skeleton.length % word.length === 0 && word.repeat(skeleton.length / word.length) === skeleton) return true;
    }
  }
  return false;
}

// Names and email pieces (4+ letters) that must not appear inside the password.
function identityPieces(email, name) {
  const pieces = new Set();
  const local = normalizeEmail(email).split("@")[0] || "";
  const add = (text) => {
    String(text || "")
      .toLowerCase()
      .split(/[^a-z]+/)
      .filter((p) => p.length >= 4)
      .forEach((p) => pieces.add(p));
  };
  add(local);
  add(name);
  if (local.replace(/[^a-z0-9]/g, "").length >= 4) pieces.add(local.replace(/[^a-z0-9]/g, ""));
  return [...pieces];
}

function containsIdentity(password, email, name) {
  const flat = password.toLowerCase().replace(/[^a-z0-9]/g, "");
  return identityPieces(email, name).some((piece) => flat.includes(piece));
}

/**
 * Checks a new password.
 * Returns { ok, problem, checks, score, label } where
 *   checks  = the list shown under the password box ({ id, label, ok, hidden })
 *   problem = the first thing to fix, as a sentence (empty when ok)
 *   score   = 0..4 for the strength bar, label = its words ("" while the box is empty)
 * Rules: at least PASSWORD_MIN characters, at most PASSWORD_MAX, a letter, a number,
 * not a very common or predictable password, and not built from your own name or email.
 * (Long beats complicated, so there is no "must have a capital and a symbol" rule.)
 */
export function checkPassword(password, { email = "", name = "" } = {}) {
  const pw = String(password || "");
  const lengthOk = pw.length >= PASSWORD_MIN;
  const maxOk = pw.length <= PASSWORD_MAX;
  const letterOk = /[A-Za-z]/.test(pw);
  const numberOk = /[0-9]/.test(pw);
  const predictable = pw.length > 0 && isPredictable(pw);
  const identity = pw.length > 0 && containsIdentity(pw, email, name);
  const uniqueOk = pw.length > 0 && !predictable && !identity;

  const checks = [
    { id: "length", label: `At least ${PASSWORD_MIN} characters`, ok: lengthOk },
    { id: "letter", label: "Has a letter", ok: letterOk },
    { id: "number", label: "Has a number", ok: numberOk },
    { id: "unique", label: "Not easy to guess", ok: uniqueOk },
    { id: "max", label: `${PASSWORD_MAX} characters or fewer`, ok: maxOk, hidden: maxOk },
  ];

  let problem = "";
  if (!pw) problem = "Enter a password.";
  else if (!lengthOk) problem = `Use at least ${PASSWORD_MIN} characters.`;
  else if (!maxOk) problem = `Use ${PASSWORD_MAX} characters or fewer.`;
  else if (!letterOk || !numberOk) problem = "Include at least one letter and one number.";
  else if (identity) problem = "Don't build your password from your name or email address.";
  else if (predictable) problem = "That password is too easy to guess. Try a few unrelated words with a number.";

  // Strength bar: a rough guide, driven mostly by length.
  let score = 0;
  if (pw.length >= 6) score = 1;
  if (lengthOk) score = 2;
  if (pw.length >= 14) score = 3;
  const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((re) => re.test(pw)).length;
  if (pw.length >= 12 && classes >= 3 && score >= 2) score = Math.max(score, 3);
  if (pw.length >= 16 && classes >= 3) score = 4;
  if (!letterOk || !numberOk || !maxOk) score = Math.min(score, 1);
  if (predictable || identity) score = Math.min(score, 1);
  if (!pw) score = 0;
  const label = !pw ? "" : ["Too weak", "Weak", "Okay", "Strong", "Very strong"][score];

  return { ok: !problem, problem, checks, score, label };
}

/* ------------------------------------------------- failed-login cooldown */

// A small cooldown after repeated wrong passwords. It only slows down a person (or a simple script) at the
// form; the real protection is the rate limiting and security check on the server.
export const THROTTLE_MAX_FAILS = 5;
export const THROTTLE_MS = 60 * 1000;

function readJson(key) {
  try {
    return JSON.parse(window.sessionStorage.getItem(key) || "null") || { fails: 0, until: 0 };
  } catch (e) {
    return { fails: 0, until: 0 };
  }
}
function writeJson(key, value) {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    /* storage can be switched off; the cooldown then simply doesn't persist */
  }
}

// Seconds left on the cooldown (0 = free to try).
export function throttleSecondsLeft(key, now = Date.now()) {
  const { until } = readJson(key);
  return until > now ? Math.ceil((until - now) / 1000) : 0;
}

// Call after a wrong password. Returns the seconds the form is now locked for (0 = not locked yet).
export function recordFailure(key, now = Date.now()) {
  const state = readJson(key);
  const fresh = state.until && state.until <= now ? { fails: 0, until: 0 } : state;
  const fails = fresh.fails + 1;
  if (fails >= THROTTLE_MAX_FAILS) {
    writeJson(key, { fails: 0, until: now + THROTTLE_MS });
    return Math.ceil(THROTTLE_MS / 1000);
  }
  writeJson(key, { fails, until: 0 });
  return 0;
}

export function clearThrottle(key) {
  try {
    window.sessionStorage.removeItem(key);
  } catch (e) {
    /* ignore */
  }
}
