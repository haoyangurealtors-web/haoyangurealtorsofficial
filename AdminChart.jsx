import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Tooltip: the value leads, the category follows. Names are rendered as React text (never raw HTML).
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const views = payload[0].value;
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "8px 12px",
        boxShadow: "0 6px 18px var(--shadow)",
        fontSize: 13,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 14, height: 2, borderRadius: 2, background: "var(--primary)", display: "inline-block" }} />
        <strong style={{ color: "var(--ink)", fontSize: 15 }}>{views}</strong>
        <span style={{ color: "var(--ink-soft)" }}>{views === 1 ? "view" : "views"}</span>
      </div>
      <div style={{ color: "var(--ink-soft)", marginTop: 2 }}>{label}</div>
    </div>
  );
}

// A dot that sits on a ring of the card surface so it stays crisp on the line and grid.
function Dot({ cx, cy, r = 5 }) {
  if (cx == null || cy == null) return null;
  return <circle cx={cx} cy={cy} r={r} fill="var(--primary)" stroke="var(--surface)" strokeWidth={2} />;
}

export default function AdminChart({ data }) {
  return (
    <>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 10, right: 24, bottom: 0, left: 0 }} accessibilityLayer>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="name" stroke="var(--ink-soft)" fontSize={12} tickLine={false} padding={{ left: 24, right: 24 }} />
          <YAxis stroke="var(--ink-soft)" fontSize={12} allowDecimals={false} domain={[0, (max) => Math.max(4, max)]} tickLine={false} axisLine={false} width={32} />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: "var(--ink-soft)", strokeWidth: 1, strokeDasharray: "4 4" }}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="views"
            name="Page views"
            stroke="var(--primary)"
            strokeWidth={2}
            strokeLinecap="round"
            dot={<Dot r={4} />}
            activeDot={<Dot r={7} />}
            animationDuration={700}
          />
        </LineChart>
      </ResponsiveContainer>
      {/* The same numbers as text, for screen readers and anyone who can't hover. */}
      <table className="sr-only">
        <caption>Category interest (page views)</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">Page views</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.name}>
              <th scope="row">{d.name}</th>
              <td>{d.views}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
