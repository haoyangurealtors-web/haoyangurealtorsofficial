import React, { useEffect, useMemo, useRef, useState, lazy, Suspense } from "react";
import {
  Home as HomeIcon,
  KeyRound,
  Building2,
  TreePine,
  Eye,
  Search,
  Heart,
  ClipboardList,
  BadgeCheck,
  UserCog,
  Check,
  Pause,
  ArrowRight,
  Plus,
  Sparkles,
  Inbox,
  AlertTriangle,
} from "lucide-react";

const AdminChart = lazy(() => import("./AdminChart.jsx"));

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

const CATEGORIES = [
  { tag: "Buy", key: "buyViews", icon: HomeIcon },
  { tag: "Rent", key: "rentViews", icon: KeyRound },
  { tag: "Commercial", key: "commercialViews", icon: Building2 },
  { tag: "Land", key: "landViews", icon: TreePine },
];

const STATUS_LABEL = { approved: "Live", pending: "Pending", held: "On hold", revoked: "Revoked" };

const fmt = (n) => Number(n || 0).toLocaleString("en-KE");

// A ratio as a percentage with at most one decimal, or null when there is nothing to divide by.
const ratio = (part, whole) => (whole > 0 ? Math.round((part / whole) * 1000) / 10 : null);

function useTween(target) {
  const [shown, setShown] = useState(0);
  const fromRef = useRef(0);
  useEffect(() => {
    const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = fromRef.current;
    if (reduce || from === target) {
      fromRef.current = target;
      setShown(target);
      return undefined;
    }
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 600);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = Math.round(from + (target - from) * eased);
      fromRef.current = v;
      setShown(v);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return shown;
}

function Counter({ value }) {
  return <span>{fmt(useTween(value))}</span>;
}

/* Date ranges (visitor activity is recorded per day in Nakuru time) */
const SITE_TIMEZONE = "Africa/Nairobi";
const dayKey = (offsetDays = 0) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: SITE_TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(Date.now() - offsetDays * 86400000));
const RANGES = [
  { key: "today", label: "Today", days: 1, text: "today" },
  { key: "7d", label: "7 days", days: 7, text: "last 7 days" },
  { key: "30d", label: "30 days", days: 30, text: "last 30 days" },
  { key: "all", label: "All time", days: null, text: "all time" },
];
const prettyDay = (key) => new Date(`${key}T12:00:00`).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });

function timeAgo(ts, now) {
  if (!ts) return "waiting for data";
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  return `${m} min ago`;
}

function useNow(ms = 5000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

function Kpi({ icon: Icon, label, value, children, onClick }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag className={`pk-ov-kpi ${onClick ? "pk-ov-kpi-link" : ""}`} onClick={onClick} type={onClick ? "button" : undefined}>
      <span className="pk-ov-kpi-icon" aria-hidden="true">
        <Icon size={18} />
      </span>
      <span className="pk-ov-kpi-label">{label}</span>
      <span className="pk-ov-kpi-value pk-mono">
        <Counter value={value} />
      </span>
      <span className="pk-ov-kpi-sub">{children}</span>
    </Tag>
  );
}

function Card({ title, hint, action, children, className = "" }) {
  return (
    <section className={`pk-ov-card ${className}`}>
      <header className="pk-ov-card-head">
        <div>
          <h3 className="pk-ov-card-title">{title}</h3>
          {hint && <p className="pk-ov-card-hint">{hint}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

function StatusPill({ status }) {
  return <span className={`pk-ov-pill pk-ov-pill-${status}`}>{STATUS_LABEL[status] || status}</span>;
}

/* ------------------------------------------------------------------ */
/* Overview                                                            */
/* ------------------------------------------------------------------ */

export default function AdminOverview({ listings, agents, agencies, stats, daily = null, lastUpdated, adminName, onNavigate, onUpdateListings, onToast }) {
  const now = useNow();
  const [range, setRange] = useState("7d");
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const todayLabel = new Date().toLocaleDateString("en-KE", { weekday: "long", month: "long", day: "numeric" });

  // All time comes from the running totals; the other ranges add up the per-day records.
  const perDay = Array.isArray(daily);
  const activeRange = perDay ? range : "all";
  const rangeInfo = RANGES.find((r) => r.key === activeRange) || RANGES[3];
  const s = useMemo(() => {
    if (activeRange === "all") return stats || {};
    const from = dayKey(rangeInfo.days - 1);
    const out = {};
    daily.forEach((r) => {
      if (r.day >= from) out[r.key] = (out[r.key] || 0) + r.count;
    });
    return out;
  }, [activeRange, stats, daily, Math.floor(now / 60000)]); // eslint-disable-line react-hooks/exhaustive-deps
  let rangeNote = "";
  if (!perDay) rangeNote = "Date ranges switch on once supabase-usage-by-day.sql has been run.";
  else if (activeRange !== "all") {
    const earliest = daily.length ? daily.reduce((m, r) => (r.day < m ? r.day : m), daily[0].day) : null;
    if (!earliest) rangeNote = "Recording by day has just started, so this fills in as visitors arrive. Earlier visits are in All time.";
    else if (earliest > dayKey(rangeInfo.days - 1)) rangeNote = `Recorded by day since ${prettyDay(earliest)}. Earlier visits are in All time.`;
  }
  const pageViews = s.pageViews || 0;
  const searches = s.searches || 0;
  const propertyViews = s.propertyDetailViews || 0;
  const saves = s.favorites || 0;

  const data = useMemo(() => {
    const live = listings.filter((l) => l.status === "approved");
    const pending = listings.filter((l) => l.status === "pending");
    const offMarket = listings.filter((l) => l.status === "held" || l.status === "revoked");
    const verified = agents.filter((a) => a.status === "verified");
    const banned = agents.filter((a) => a.status === "banned");
    const unverified = agents.filter((a) => a.status !== "verified" && a.status !== "banned");
    const byCategory = CATEGORIES.map((c) => {
      const liveCount = live.filter((l) => l.tag === c.tag).length;
      const views = s[c.key] || 0;
      return { ...c, live: liveCount, views, perListing: liveCount > 0 ? Math.round((views / liveCount) * 10) / 10 : null };
    });
    return {
      live,
      pending: [...pending].sort((a, b) => b.id - a.id),
      offMarket,
      featured: live.filter((l) => l.featured).length,
      verified,
      banned,
      unverified,
      byCategory,
      recent: [...listings].sort((a, b) => b.id - a.id).slice(0, 6),
    };
  }, [listings, agents, s]); // eslint-disable-line react-hooks/exhaustive-deps

  const chartData = data.byCategory.map((c) => ({ name: c.tag, views: c.views }));

  const decide = (listing, status) => {
    onUpdateListings(listings.map((l) => (l.id === listing.id ? { ...l, status } : l)));
    if (status === "approved") onToast?.(`"${listing.title}" is now live`, "success");
    else onToast?.(`"${listing.title}" put on hold`, "warning");
  };

  const queueCount = data.pending.length + data.unverified.length;
  const funnel = [
    { label: "Page views", value: pageViews, icon: Eye, note: null },
    { label: "Searches run", value: searches, icon: Search, note: ratio(searches, pageViews) },
    { label: "Property views", value: propertyViews, icon: HomeIcon, note: ratio(propertyViews, pageViews) },
    { label: "Listings saved", value: saves, icon: Heart, note: ratio(saves, pageViews) },
  ];
  const funnelMax = Math.max(1, ...funnel.map((f) => f.value));
  const demandGap = data.byCategory.filter((c) => c.live === 0 && c.views > 0);

  return (
    <div className="pk-ov">
      {/* Header */}
      <div className="pk-ov-header">
        <div>
          <h2 className="pk-display pk-ov-greeting">
            {greeting}, {adminName && !/^super ?admin$/i.test(adminName) ? adminName : "Superadmin"} <Sparkles size={18} className="pk-accent-text" aria-hidden="true" />
          </h2>
          <p className="pk-ov-date">{todayLabel} · counts reflect real visits to this site</p>
        </div>
        <div className="pk-ov-header-right">
          <span className="pk-live-badge">
            <span className="pk-live-dot" /> Live
          </span>
          <span className="pk-ov-updated" aria-live="polite">
            Updated {timeAgo(lastUpdated, now)}
          </span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="pk-ov-actions" role="group" aria-label="Quick actions">
        <button type="button" className="pk-btn-primary pk-ov-action" onClick={() => onNavigate("listings", { openForm: true })}>
          <Plus size={15} /> New listing
        </button>
        <button type="button" className="pk-btn-outline pk-ov-action" onClick={() => onNavigate("agencies")}>
          <UserCog size={15} /> Add agency
        </button>
        <button type="button" className="pk-btn-outline pk-ov-action" onClick={() => onNavigate("agents")}>
          <BadgeCheck size={15} /> Manage agents
        </button>
      </div>

      {/* Date range for the visitor numbers below */}
      <div className="pk-ov-range-row">
        <span className="pk-ov-range-label">Visitor activity</span>
        <div className="pk-range" role="group" aria-label="Date range">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              className={activeRange === r.key ? "pk-range-active" : ""}
              aria-pressed={activeRange === r.key}
              disabled={!perDay && r.key !== "all"}
              onClick={() => setRange(r.key)}
            >
              {r.label}
            </button>
          ))}
        </div>
        {rangeNote && <span className="pk-ov-range-note">{rangeNote}</span>}
      </div>

      {/* KPIs */}
      <div className="pk-ov-kpis">
        <Kpi icon={ClipboardList} label="Live listings" value={data.live.length} onClick={() => onNavigate("listings")}>
          {data.pending.length} pending · {data.offMarket.length} off-market · {data.featured} featured
        </Kpi>
        <Kpi icon={Eye} label="Page views" value={pageViews}>
          {fmt(searches)} searches run
        </Kpi>
        <Kpi icon={HomeIcon} label="Property views" value={propertyViews}>
          {ratio(propertyViews, pageViews) === null ? "No traffic yet" : `${ratio(propertyViews, pageViews)}% of page views`}
        </Kpi>
        <Kpi icon={Heart} label="Listings saved" value={saves}>
          {ratio(saves, propertyViews) === null ? "No property views yet" : `${ratio(saves, propertyViews)}% of property views`}
        </Kpi>
      </div>

      {/* Needs attention + Engagement */}
      <div className="pk-ov-grid pk-ov-grid-2">
        <Card
          title="Needs your attention"
          hint={queueCount ? `${queueCount} item${queueCount === 1 ? "" : "s"} waiting` : undefined}
          action={
            data.pending.length > 5 ? (
              <button type="button" className="pk-ov-link" onClick={() => onNavigate("listings")}>
                View all {data.pending.length} <ArrowRight size={14} />
              </button>
            ) : null
          }
        >
          {queueCount === 0 ? (
            <div className="pk-ov-empty">
              <span className="pk-ov-empty-icon" aria-hidden="true">
                <Inbox size={20} />
              </span>
              <strong>You're all caught up</strong>
              <span>New listings and agents waiting for review will show up here.</span>
            </div>
          ) : (
            <ul className="pk-ov-queue">
              {data.pending.slice(0, 5).map((l) => (
                <li key={`l${l.id}`} className="pk-ov-queue-row">
                  <div className="pk-ov-queue-main">
                    <span className="pk-ov-queue-title">{l.title}</span>
                    <span className="pk-ov-queue-meta">
                      {l.tag} · {l.price || "—"}
                      {l.agency ? ` · ${l.agency}` : ""}
                    </span>
                  </div>
                  <div className="pk-ov-queue-actions">
                    <button type="button" className="pk-ov-iconbtn pk-ov-iconbtn-ok" onClick={() => decide(l, "approved")} aria-label={`Approve ${l.title}`} title="Approve">
                      <Check size={15} /> <span>Approve</span>
                    </button>
                    <button type="button" className="pk-ov-iconbtn" onClick={() => decide(l, "held")} aria-label={`Put ${l.title} on hold`} title="Hold">
                      <Pause size={15} />
                    </button>
                  </div>
                </li>
              ))}
              {data.unverified.length > 0 && (
                <li className="pk-ov-queue-row">
                  <div className="pk-ov-queue-main">
                    <span className="pk-ov-queue-title">
                      {data.unverified.length} agent{data.unverified.length === 1 ? "" : "s"} awaiting verification
                    </span>
                    <span className="pk-ov-queue-meta">
                      {data.unverified
                        .slice(0, 3)
                        .map((a) => a.name)
                        .join(", ")}
                      {data.unverified.length > 3 ? "…" : ""}
                    </span>
                  </div>
                  <div className="pk-ov-queue-actions">
                    <button type="button" className="pk-ov-iconbtn" onClick={() => onNavigate("agents")}>
                      Review <ArrowRight size={14} />
                    </button>
                  </div>
                </li>
              )}
            </ul>
          )}
        </Card>

        <Card title="Visitor engagement" hint={`Per 100 page views, what visitors go on to do · ${rangeInfo.text}`}>
          <ul className="pk-ov-funnel">
            {funnel.map((f) => {
              const Icon = f.icon;
              return (
                <li key={f.label} className="pk-ov-funnel-row">
                  <div className="pk-ov-funnel-top">
                    <span className="pk-ov-funnel-label">
                      <Icon size={14} aria-hidden="true" /> {f.label}
                    </span>
                    <span className="pk-ov-funnel-value">
                      <strong className="pk-mono">{fmt(f.value)}</strong>
                      {f.note !== null && <em>{f.note}%</em>}
                    </span>
                  </div>
                  <div className="pk-ov-bar" role="presentation">
                    <div className="pk-ov-bar-fill" style={{ width: `${Math.max(f.value > 0 ? 2 : 0, (f.value / funnelMax) * 100)}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      {/* Category interest + supply vs demand */}
      <div className="pk-ov-grid pk-ov-grid-chart">
        <Card title="Category interest" hint="Page views by property category. Hover or focus a point for the exact count.">
          <Suspense fallback={<p className="pk-ov-card-hint">Loading chart…</p>}>
            <AdminChart data={chartData} />
          </Suspense>
        </Card>

        <Card title="Supply vs demand" hint="Live listings against views, per category">
          <ul className="pk-ov-supply">
            {data.byCategory.map((c) => {
              const Icon = c.icon;
              const gap = c.live === 0 && c.views > 0;
              return (
                <li key={c.tag} className="pk-ov-supply-row">
                  <span className="pk-ov-supply-name">
                    <span className="pk-ov-supply-icon" aria-hidden="true">
                      <Icon size={15} />
                    </span>
                    {c.tag}
                  </span>
                  <span className="pk-ov-supply-nums">
                    <span>
                      <strong className="pk-mono">{c.live}</strong> live
                    </span>
                    <span>
                      <strong className="pk-mono">{fmt(c.views)}</strong> views
                    </span>
                    <span className={gap ? "pk-ov-warn" : ""}>
                      {gap ? (
                        <>
                          <AlertTriangle size={12} aria-hidden="true" /> No listings
                        </>
                      ) : c.perListing === null ? (
                        "—"
                      ) : (
                        <>
                          <strong className="pk-mono">{c.perListing}</strong> / listing
                        </>
                      )}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
          {demandGap.length > 0 && (
            <p className="pk-ov-insight">
              <AlertTriangle size={14} aria-hidden="true" /> Visitors are looking at {demandGap.map((c) => c.tag).join(" and ")} but there are no live listings there yet.
            </p>
          )}
        </Card>
      </div>

      {/* Recent listings + team */}
      <div className="pk-ov-grid pk-ov-grid-2">
        <Card
          title="Recent listings"
          action={
            <button type="button" className="pk-ov-link" onClick={() => onNavigate("listings")}>
              All listings <ArrowRight size={14} />
            </button>
          }
        >
          {data.recent.length === 0 ? (
            <div className="pk-ov-empty">
              <strong>No listings yet</strong>
              <button type="button" className="pk-btn-primary" onClick={() => onNavigate("listings", { openForm: true })}>
                <Plus size={15} /> Add the first one
              </button>
            </div>
          ) : (
            <ul className="pk-ov-recent">
              {data.recent.map((l) => (
                <li key={l.id}>
                  <button type="button" className="pk-ov-recent-row" onClick={() => onNavigate("listings")}>
                    <span className="pk-ov-recent-main">
                      <span className="pk-ov-queue-title">{l.title}</span>
                      <span className="pk-ov-queue-meta">
                        {l.tag} · {l.location}
                      </span>
                    </span>
                    <span className="pk-ov-recent-price pk-mono">{l.price || "—"}</span>
                    <StatusPill status={l.status} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Team" hint="Agencies and agents on the platform">
          <div className="pk-ov-team">
            <button type="button" className="pk-ov-team-stat" onClick={() => onNavigate("agencies")}>
              <strong className="pk-mono">{agencies.length}</strong>
              <span>Agencies</span>
            </button>
            <button type="button" className="pk-ov-team-stat" onClick={() => onNavigate("agents")}>
              <strong className="pk-mono">{data.verified.length}</strong>
              <span>Verified agents</span>
            </button>
            <button type="button" className="pk-ov-team-stat" onClick={() => onNavigate("agents")}>
              <strong className="pk-mono">{data.unverified.length}</strong>
              <span>Awaiting verification</span>
            </button>
            <button type="button" className="pk-ov-team-stat" onClick={() => onNavigate("agents")}>
              <strong className="pk-mono">{data.banned.length}</strong>
              <span>Banned</span>
            </button>
          </div>
          {agencies.length > 0 && (
            <ul className="pk-ov-admins">
              {agencies.slice(0, 4).map((a) => (
                <li key={a.id}>
                  <span className="pk-ov-avatar" aria-hidden="true">
                    {(a.name || a.email || "?").trim().charAt(0).toUpperCase()}
                  </span>
                  <span className="pk-ov-admin-text">
                    <span className="pk-ov-queue-title">{a.name || a.email}</span>
                    <span className="pk-ov-queue-meta">{a.agency || "No agency"}</span>
                  </span>
                  <span className={`pk-ov-pill ${a.status === "active" ? "pk-ov-pill-approved" : "pk-ov-pill-held"}`}>{a.status === "active" ? "Active" : a.status}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <p className="pk-ov-foot">Counts are aggregated from real visits to this site and refresh every few seconds while this tab is open.</p>
    </div>
  );
}
