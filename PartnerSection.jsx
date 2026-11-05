import React from "react";
import { PARTNER } from "./partner.js";

// "In partnership with ..." panel on the home page. Details come from partner.js.
export default function PartnerSection() {
  if (!PARTNER.enabled || !PARTNER.name) return null;
  const initials = PARTNER.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const site = /^https:\/\//i.test(PARTNER.website || "") ? PARTNER.website : "";
  return (
    <section className="mx-auto max-w-7xl px-4 md:px-8 pb-12 md:pb-16" aria-labelledby="pk-partner-title">
      <div className="pk-glass pk-partner">
        <div className="pk-partner-logo">
          {PARTNER.logo ? <img src={PARTNER.logo} alt={`${PARTNER.name} logo`} loading="lazy" /> : <span className="pk-display" aria-hidden="true">{initials}</span>}
        </div>
        <div>
          <h2 id="pk-partner-title" className="pk-display pk-partner-title">In partnership with {PARTNER.name}</h2>
          {PARTNER.description && <p className="pk-ink-soft mt-2 max-w-2xl">{PARTNER.description}</p>}
        </div>
        {site && (
          <a className="pk-btn-primary justify-center" href={site} target="_blank" rel="noopener noreferrer">
            Visit {PARTNER.name}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
      </div>
    </section>
  );
}
