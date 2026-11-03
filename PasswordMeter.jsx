import React from "react";
import { Check } from "lucide-react";

// The strength bar and the short list of password rules shown under a "new password" box.
// `result` comes from checkPassword() in authRules.js.
export default function PasswordMeter({ result, id }) {
  const visible = result.checks.filter((c) => !c.hidden);
  return (
    <div id={id} className="pk-pw">
      <div className="pk-pw-bar-row">
        <div className="pk-pw-meter" data-score={result.score} aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        <span className="pk-pw-label">{result.label ? `Strength: ${result.label}` : "Strength"}</span>
      </div>
      <ul className="pk-pw-rules">
        {visible.map((c) => (
          <li key={c.id} className="pk-pw-rule" data-ok={c.ok ? "true" : "false"}>
            <span className="pk-pw-mark" aria-hidden="true">
              {c.ok ? <Check size={11} strokeWidth={3} /> : null}
            </span>
            <span className="sr-only">{c.ok ? "Met: " : "Not met yet: "}</span>
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
