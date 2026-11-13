import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, X, Send, Square, RotateCcw, Mail, MapPin, Bed, Bath, Home as HomeIcon, Sparkles } from "lucide-react";
import { MAX_INPUT, buildHistory, emailHandoff, friendlyChatError, loadChat, newId, parseMarkdown, readSse, safeHref, saveChat } from "./chatUtils.js";

// The AI support assistant: a round button in the corner that opens a chat window.
// It talks to /api/chat (see _worker.js). Styles are the "pk-chat" block at the end of index.css.

const TAG_LABELS = { Buy: "For sale", Rent: "For rent", Commercial: "Commercial", Land: "Land" };
const GREETING =
  "Hi, I'm the Hao yangu realtors assistant. I'm an AI, so I can make mistakes, but I can help you find a home, plot or space and answer questions about how the site works. What are you looking for?";
const SUGGESTIONS = ["Find a place to rent", "Homes for sale in Nakuru", "How do I contact an agent?", "How do I list my property?"];

const isSmallScreen = () => typeof window !== "undefined" && Boolean(window.matchMedia) && window.matchMedia("(max-width: 640px)").matches;

// The site has its own page router that listens for "popstate", so this moves to a page without reloading.
function goTo(href) {
  window.history.pushState(null, "", href);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function mergeCards(existing, incoming) {
  const seen = new Set((existing || []).map((c) => c.id));
  return [...(existing || []), ...incoming.filter((c) => c && !seen.has(c.id))].slice(0, 12);
}

/* ---------------- Message text ---------------- */

function Inline({ nodes, onLink }) {
  return nodes.map((n, i) => {
    if (n.t === "text") return <React.Fragment key={i}>{n.v}</React.Fragment>;
    if (n.t === "b") {
      return (
        <strong key={i}>
          <Inline nodes={n.c} onLink={onLink} />
        </strong>
      );
    }
    if (n.t === "link") {
      const target = safeHref(n.href);
      if (!target) return <React.Fragment key={i}>{n.text}</React.Fragment>;
      if (target.kind === "auth") {
        if (!onLink.auth) return <React.Fragment key={i}>{n.text}</React.Fragment>;
        return (
          <button key={i} type="button" className="pk-chat-link" onClick={() => onLink.auth(target.tab)}>
            {n.text}
          </button>
        );
      }
      if (target.kind === "internal") {
        return (
          <a key={i} className="pk-chat-link" href={target.href} onClick={(e) => onLink.internal(e, target.href)}>
            {n.text}
          </a>
        );
      }
      return (
        <a key={i} className="pk-chat-link" href={target.href} {...(target.kind === "external" ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {n.text}
        </a>
      );
    }
    return null;
  });
}

function Markdown({ text, onLink }) {
  const blocks = useMemo(() => parseMarkdown(text), [text]);
  return blocks.map((b, i) => {
    if (b.type === "p") {
      return (
        <p key={i}>
          {b.lines.map((nodes, j) => (
            <React.Fragment key={j}>
              {j > 0 && <br />}
              <Inline nodes={nodes} onLink={onLink} />
            </React.Fragment>
          ))}
        </p>
      );
    }
    const Tag = b.type === "ol" ? "ol" : "ul";
    return (
      <Tag key={i}>
        {b.items.map((nodes, j) => (
          <li key={j}>
            <Inline nodes={nodes} onLink={onLink} />
          </li>
        ))}
      </Tag>
    );
  });
}

/* ---------------- Listing cards ---------------- */

function ListingCard({ item, onGo }) {
  const href = `/listing/${item.id}`;
  const [imgOk, setImgOk] = useState(typeof item.img === "string" && /^https:\/\//i.test(item.img));
  return (
    <a className="pk-chat-card" href={href} onClick={(e) => onGo(e, href)}>
      <span className="pk-chat-card-img" aria-hidden="true">
        {imgOk ? <img src={item.img} alt="" loading="lazy" onError={() => setImgOk(false)} /> : <HomeIcon size={22} strokeWidth={1.6} />}
      </span>
      <span className="pk-chat-card-body">
        <span className="pk-chat-card-tag">
          {TAG_LABELS[item.tag] || item.tag}
          {item.featured ? " · Featured" : ""}
        </span>
        <span className="pk-chat-card-title">{item.title}</span>
        <span className="pk-chat-card-price">{item.price}</span>
        <span className="pk-chat-card-meta">
          <span>
            <MapPin size={11} aria-hidden="true" /> {item.location}
          </span>
          {item.beds != null && (
            <span>
              <Bed size={11} aria-hidden="true" /> {item.beds}
            </span>
          )}
          {item.baths != null && (
            <span>
              <Bath size={11} aria-hidden="true" /> {item.baths}
            </span>
          )}
          {item.size && <span>{item.size}</span>}
        </span>
      </span>
    </a>
  );
}

/* ---------------- One message ---------------- */

function Message({ m, isLast, busy, onLink, onGo, onRetry }) {
  const showTyping = m.role === "assistant" && m.pending && !m.text;
  return (
    <div className="pk-chat-msg" data-role={m.role}>
      {(m.text || showTyping) && (
        <div className="pk-chat-bubble">
          {m.role === "user" ? (
            m.text
          ) : showTyping ? (
            <span className="pk-chat-typing" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          ) : (
            <Markdown text={m.text} onLink={onLink} />
          )}
        </div>
      )}
      {m.cards && m.cards.length > 0 && (
        <div className="pk-chat-cards">
          {m.cards.map((c) => (
            <ListingCard key={c.id} item={c} onGo={onGo} />
          ))}
        </div>
      )}
      {m.error && (
        <p className="pk-chat-error" role="alert">
          {m.error}{" "}
          {isLast && !busy && (
            <button type="button" className="pk-chat-link" onClick={onRetry}>
              Try again
            </button>
          )}
        </p>
      )}
    </div>
  );
}

/* ---------------- The widget ---------------- */

export default function SupportChat({ signedIn = false, onOpenAuth = null, contactEmail = "", raised = false, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState(() => (typeof window === "undefined" ? [] : loadChat()));
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [announce, setAnnounce] = useState("");
  const abortRef = useRef(null);
  const listRef = useRef(null);
  const stickRef = useRef(true);
  const inputRef = useRef(null);
  const launcherRef = useRef(null);
  const panelRef = useRef(null);
  const wasOpen = useRef(defaultOpen);
  const restoreFocus = useRef(false);

  // Keep the conversation for the rest of this browser session (it is cleared when the tab is closed).
  useEffect(() => {
    if (!busy) saveChat(messages);
  }, [messages, busy]);

  // Stay scrolled to the newest text unless the visitor scrolled up to read.
  useEffect(() => {
    const el = listRef.current;
    if (el && stickRef.current) el.scrollTop = el.scrollHeight;
  }, [messages, open]);
  const onScroll = () => {
    const el = listRef.current;
    if (el) stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
  };

  // Focus: into the message box when the window opens (not on phones, where that would pop up the keyboard
  // over the greeting), and back to the round button when it closes.
  useEffect(() => {
    const was = wasOpen.current;
    wasOpen.current = open;
    if (open) {
      stickRef.current = true;
      if (!isSmallScreen()) {
        const t = setTimeout(() => inputRef.current && inputRef.current.focus(), 60);
        return () => clearTimeout(t);
      }
      return undefined;
    }
    // Only when the visitor closed it with Escape or the X. After tapping a listing card the page itself takes focus.
    if (was && restoreFocus.current && launcherRef.current) launcherRef.current.focus();
    restoreFocus.current = false;
    return undefined;
  }, [open]);

  // On a phone the window fills the screen: follow the visible area (so the on-screen keyboard doesn't hide the
  // message box) and stop the page behind from scrolling.
  useEffect(() => {
    if (!open || !isSmallScreen()) return undefined;
    const panel = panelRef.current;
    const vv = window.visualViewport;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const fit = () => {
      if (!panel || !vv) return;
      panel.style.setProperty("--pk-chat-vh", `${vv.height}px`);
      panel.style.setProperty("--pk-chat-top", `${vv.offsetTop}px`);
    };
    fit();
    if (vv) {
      vv.addEventListener("resize", fit);
      vv.addEventListener("scroll", fit);
    }
    return () => {
      document.body.style.overflow = previousOverflow;
      if (vv) {
        vv.removeEventListener("resize", fit);
        vv.removeEventListener("scroll", fit);
      }
    };
  }, [open]);

  const onLink = useMemo(
    () => ({
      internal: (e, href) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; // let "open in new tab" work
        e.preventDefault();
        goTo(href);
        if (isSmallScreen()) setOpen(false); // on a phone the chat covers the page, so reveal it
      },
      auth: onOpenAuth ? (tab) => onOpenAuth(tab) : null,
    }),
    [onOpenAuth]
  );

  const send = useCallback(
    async (raw, base) => {
      const text = String(raw || "").trim().slice(0, MAX_INPUT);
      if (!text || busy) return;
      const prior = base || messages;
      const userMsg = { id: newId(), role: "user", text };
      const botId = newId();
      const history = buildHistory([...prior, userMsg]);
      setMessages([...prior, userMsg, { id: botId, role: "assistant", text: "", pending: true }]);
      setInput("");
      setBusy(true);
      setAnnounce("The assistant is replying.");
      stickRef.current = true;
      const controller = new AbortController();
      abortRef.current = controller;
      const patch = (fn) => setMessages((list) => list.map((m) => (m.id === botId ? fn(m) : m)));
      let reply = "";
      let failed = "";
      let stopped = false;
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history, context: { signedIn: Boolean(signedIn), path: window.location.pathname } }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) {
          failed = friendlyChatError(res.status);
        } else {
          await readSse(res.body, (ev) => {
            if (ev.t === "text" && typeof ev.d === "string") {
              reply += ev.d;
              patch((m) => ({ ...m, text: m.text + ev.d }));
            } else if (ev.t === "cards" && Array.isArray(ev.items)) {
              patch((m) => ({ ...m, cards: mergeCards(m.cards, ev.items) }));
            } else if (ev.t === "error") {
              failed = String(ev.message || friendlyChatError(500));
            }
          });
        }
      } catch (e) {
        if (e && e.name === "AbortError") stopped = true;
        else failed = friendlyChatError(0);
      }
      setMessages((list) =>
        list
          .filter((m) => !(m.id === botId && stopped && !m.text && !(m.cards && m.cards.length)))
          .map((m) => (m.id === botId ? { ...m, pending: false, error: failed || undefined } : m))
      );
      abortRef.current = null;
      setBusy(false);
      setAnnounce(failed || reply.slice(0, 600));
    },
    [busy, messages, signedIn]
  );

  const stop = () => {
    if (abortRef.current) abortRef.current.abort();
  };
  const retry = () => {
    let i = messages.length - 1;
    while (i >= 0 && messages[i].role !== "user") i -= 1;
    if (i >= 0) send(messages[i].text, messages.slice(0, i));
  };
  const reset = () => {
    stop();
    setMessages([]);
    setInput("");
    setAnnounce("");
  };
  const close = () => {
    restoreFocus.current = true;
    setOpen(false);
  };

  // Escape closes the chat from anywhere inside it, including the round button.
  const onKeyDown = (e) => {
    if (open && e.key === "Escape") {
      e.stopPropagation();
      close();
    }
  };
  const onInputKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send(input);
    }
  };
  const onInput = (e) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };
  useEffect(() => {
    if (!input && inputRef.current) inputRef.current.style.height = "auto";
  }, [input]);

  const pagePath = typeof window === "undefined" ? "" : window.location.pathname;

  return (
    <div className="pk-chat" data-open={open ? "true" : "false"} data-raised={raised ? "true" : "false"} onKeyDown={onKeyDown}>
      {open && (
        <section id="pk-chat-panel" ref={panelRef} className="pk-chat-panel" role="dialog" aria-label="Chat with the Hao yangu realtors assistant">
          <header className="pk-chat-head">
            <span className="pk-chat-avatar" aria-hidden="true">
              <Sparkles size={17} />
            </span>
            <span className="pk-chat-head-text">
              <span className="pk-chat-title">Hao yangu assistant</span>
              <span className="pk-chat-sub">AI assistant · property help</span>
            </span>
            {messages.length > 0 && (
              <button type="button" className="pk-chat-head-btn" onClick={reset} aria-label="Start a new chat" title="Start a new chat">
                <RotateCcw size={16} />
              </button>
            )}
            <button type="button" className="pk-chat-head-btn" onClick={close} aria-label="Close chat" title="Close">
              <X size={18} />
            </button>
          </header>

          <div className="pk-chat-list" ref={listRef} onScroll={onScroll} tabIndex={0} role="region" aria-label="Conversation">
            <div className="pk-chat-msg" data-role="assistant">
              <div className="pk-chat-bubble">
                <p>{GREETING}</p>
              </div>
              {messages.length === 0 && (
                <div className="pk-chat-chips">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} type="button" className="pk-chat-chip" onClick={() => send(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {messages.map((m, i) => (
              <Message key={m.id} m={m} isLast={i === messages.length - 1} busy={busy} onLink={onLink} onGo={onLink.internal} onRetry={retry} />
            ))}
          </div>

          <div className="pk-chat-sr" role="status" aria-live="polite">
            {announce}
          </div>

          <div className="pk-chat-composer">
            <textarea
              ref={inputRef}
              className="pk-chat-input"
              rows={1}
              maxLength={MAX_INPUT}
              value={input}
              onChange={onInput}
              onKeyDown={onInputKeyDown}
              placeholder="Ask about homes, rent, land…"
              aria-label="Your message"
              enterKeyHint="send"
            />
            {busy ? (
              <button type="button" className="pk-chat-send" onClick={stop} aria-label="Stop the reply" title="Stop">
                <Square size={15} fill="currentColor" />
              </button>
            ) : (
              <button type="button" className="pk-chat-send" onClick={() => send(input)} disabled={!input.trim()} aria-label="Send message" title="Send">
                <Send size={17} />
              </button>
            )}
          </div>

          <div className="pk-chat-foot">
            <span>AI can make mistakes. Don't share passwords or payment details.</span>
            {contactEmail && (
              <a href={emailHandoff(messages, contactEmail, pagePath)}>
                <Mail size={12} aria-hidden="true" /> Email our team
              </a>
            )}
          </div>
        </section>
      )}

      <button
        ref={launcherRef}
        type="button"
        className="pk-chat-launcher"
        aria-expanded={open}
        aria-controls="pk-chat-panel"
        aria-label={open ? "Close chat" : "Open the chat assistant"}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X size={22} aria-hidden="true" /> : <MessageCircle size={22} aria-hidden="true" />}
        <span className="pk-chat-launcher-label" aria-hidden="true">
          {open ? "Close" : "Ask us"}
        </span>
      </button>
    </div>
  );
}
