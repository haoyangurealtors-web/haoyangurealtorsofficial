// Hao yangu realtors: small helpers for the AI support chat (SupportChat.jsx).
// Plain JavaScript with no React in it, so it is easy to test and to read.

export const CHAT_STORAGE_KEY = "hy-realtors:chat";
export const MAX_INPUT = 800; // characters a visitor can type in one message
const HISTORY_LIMIT = 12; // how many earlier messages are sent along with a new one
const STORED_LIMIT = 30; // how many messages are kept for the rest of the browser session

export function newId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/* ---------------------------------------------------------------- */
/* Links: only a few kinds are ever turned into real links           */
/* ---------------------------------------------------------------- */

// Returns { kind: "auth", tab } | { kind: "internal" | "external" | "mailto", href } | null.
// Anything else (javascript:, data:, odd characters, protocol-relative //) becomes plain text.
export function safeHref(raw) {
  const href = String(raw || "").trim();
  if (!href || href.length > 300) return null;
  if (href === "#signup") return { kind: "auth", tab: "signup" };
  if (href === "#login") return { kind: "auth", tab: "login" };
  if (/^\/(?!\/)[A-Za-z0-9/_\-.?=&%+#]*$/.test(href)) return { kind: "internal", href };
  if (/^mailto:[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}(\?[A-Za-z0-9._%+\-=&]*)?$/.test(href)) return { kind: "mailto", href };
  if (/^https:\/\/[A-Za-z0-9.\-]+(:\d+)?(\/[^\s<>"']*)?$/.test(href)) return { kind: "external", href };
  return null;
}

/* ---------------------------------------------------------------- */
/* A tiny, safe markdown reader: **bold**, [links](...), and lists    */
/* It builds plain data that React turns into elements. It never      */
/* produces HTML text, so nothing a model or a listing says can run.  */
/* ---------------------------------------------------------------- */

const INLINE_PATTERN = "(\\*\\*[^*\\n]+\\*\\*)|(\\[[^\\]\\n]+\\]\\([^)\\s]+\\))";

export function parseInline(text) {
  const out = [];
  const src = String(text || "");
  let last = 0;
  let m;
  // A new regular expression on every call: bold text calls this function again for what is inside it, and a
  // shared one would lose its place and loop forever.
  const re = new RegExp(INLINE_PATTERN, "g");
  while ((m = re.exec(src))) {
    if (m.index > last) out.push({ t: "text", v: src.slice(last, m.index) });
    if (m[1]) {
      out.push({ t: "b", c: parseInline(m[1].slice(2, -2)) });
    } else {
      const close = m[2].indexOf("](");
      out.push({ t: "link", text: m[2].slice(1, close), href: m[2].slice(close + 2, -1) });
    }
    last = m.index + m[0].length;
  }
  if (last < src.length) out.push({ t: "text", v: src.slice(last) });
  return out;
}

const UL_RE = /^\s*[-*\u2022]\s+(.*)$/;
const OL_RE = /^\s*\d+[.)]\s+(.*)$/;

export function parseMarkdown(text) {
  const lines = String(text || "").replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let para = null;
  let list = null;
  const flush = () => {
    if (para && para.length) blocks.push({ type: "p", lines: para.map(parseInline) });
    if (list && list.items.length) blocks.push({ type: list.type, items: list.items.map(parseInline) });
    para = null;
    list = null;
  };
  lines.forEach((raw) => {
    const line = raw.replace(/\s+$/, "");
    if (!line.trim()) return flush();
    if (/^\s*([-*_])\1{2,}\s*$/.test(line)) return flush(); // horizontal rule: drop it
    const ul = line.match(UL_RE);
    const ol = !ul && line.match(OL_RE);
    if (ul || ol) {
      const type = ul ? "ul" : "ol";
      if (para) {
        blocks.push({ type: "p", lines: para.map(parseInline) });
        para = null;
      }
      if (list && list.type !== type) flush();
      if (!list) list = { type, items: [] };
      list.items.push((ul || ol)[1]);
      return;
    }
    const heading = line.match(/^#{1,6}\s+(.*)$/);
    const body = heading ? "**" + heading[1].replace(/\*+/g, "") + "**" : line;
    if (list) flush();
    if (!para) para = [];
    para.push(body);
  });
  flush();
  return blocks;
}

/* ---------------------------------------------------------------- */
/* Reading the server-sent events that /api/chat streams back         */
/* ---------------------------------------------------------------- */

export async function readSse(body, onEvent) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf = (buf + decoder.decode(value, { stream: true })).replace(/\r\n/g, "\n");
    let i;
    while ((i = buf.indexOf("\n\n")) !== -1) {
      const chunk = buf.slice(0, i);
      buf = buf.slice(i + 2);
      const data = chunk
        .split("\n")
        .filter((l) => l.startsWith("data:"))
        .map((l) => l.slice(5).trimStart())
        .join("\n");
      if (!data) continue;
      let ev = null;
      try {
        ev = JSON.parse(data);
      } catch (e) {
        ev = null; // ignore one broken event, keep reading
      }
      if (ev) onEvent(ev);
    }
  }
}

/* ---------------------------------------------------------------- */
/* What gets sent to the server, and what is kept in the browser      */
/* ---------------------------------------------------------------- */

const cardsNote = (cards) =>
  "\n\n[Listing cards already shown to the visitor: " +
  cards.map((c) => `#${c.id} "${c.title}" (${c.price}, ${c.location})`).join("; ") +
  "]";

// The server only needs plain text turns. Listing cards are summarised in one line so the assistant can
// still answer "tell me more about the second one".
export function buildHistory(messages) {
  const turns = (messages || [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && !m.error && String(m.text || "").trim())
    .map((m) => ({
      role: m.role,
      content: (String(m.text).trim() + (m.role === "assistant" && m.cards && m.cards.length ? cardsNote(m.cards) : "")).slice(0, 3000),
    }));
  while (turns.length && turns[0].role !== "user") turns.shift();
  return turns.slice(-HISTORY_LIMIT);
}

export function loadChat() {
  try {
    const raw = window.sessionStorage.getItem(CHAT_STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return [];
    return list
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.text === "string")
      .map((m) => ({
        id: String(m.id || newId()),
        role: m.role,
        text: m.text.slice(0, 4000),
        cards: Array.isArray(m.cards) ? m.cards.slice(0, 6) : undefined,
        error: m.error ? String(m.error).slice(0, 300) : undefined,
      }))
      .slice(-STORED_LIMIT);
  } catch (e) {
    return [];
  }
}

export function saveChat(messages) {
  try {
    const keep = (messages || [])
      .filter((m) => !m.pending)
      .slice(-STORED_LIMIT)
      .map(({ id, role, text, cards, error }) => ({ id, role, text, cards, error }));
    if (keep.length) window.sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(keep));
    else window.sessionStorage.removeItem(CHAT_STORAGE_KEY);
  } catch (e) {
    /* private browsing or storage full: the chat simply isn't remembered */
  }
}

/* ---------------------------------------------------------------- */
/* "Email our team": a prefilled message the visitor can edit & send  */
/* ---------------------------------------------------------------- */

export function emailHandoff(messages, email, page) {
  const subject = "Question from the website chat";
  const head = "Hello,\n\nI was chatting with Agent Hommie on the website and would like to speak to a person.\n\nMy question: \n\n";
  const lines = (messages || [])
    .filter((m) => !m.error && String(m.text || "").trim())
    .map((m) => (m.role === "user" ? "Me: " : "Agent Hommie: ") + String(m.text).trim().replace(/\s+/g, " ").slice(0, 400));
  // A mailto link has a practical length limit, so keep the newest lines that fit.
  const room = 1500;
  const kept = [];
  let used = 0;
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    if (used + lines[i].length + 1 > room) break;
    kept.unshift(lines[i]);
    used += lines[i].length + 1;
  }
  const body = head + (kept.length ? "--- Our chat ---\n" + kept.join("\n") + "\n" : "") + (page ? "\nPage: " + page : "");
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/* ---------------------------------------------------------------- */
/* Friendly wording for things that can go wrong                      */
/* ---------------------------------------------------------------- */

export function friendlyChatError(status) {
  if (status === 429) return "You have sent a lot of messages in a short time. Please wait a few minutes and try again.";
  if (status === 503) return "Agent Hommie isn't available right now.";
  if (status === 0) return "I couldn't reach Agent Hommie. Please check your connection and try again.";
  return "Something went wrong on our side. Please try again in a moment.";
}
