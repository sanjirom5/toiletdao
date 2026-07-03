"use client";

import { useState } from "react";
import { rankFor } from "@/lib/booking";
import { useWallet } from "@/lib/useWallet";

const LINKS = [
  { label: "The Market", href: "#market" },
  { label: "Doctrine", href: "#doctrine" },
  { label: "Membership", href: "#membership" },
  { label: "Terminal", href: "/reserve" },
];

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const { wallet, mounted } = useWallet();
  const rank = rankFor(wallet.score).rank;

  return (
    <header className="nav">
      <div className="container nav-inner">
        <a className="wordmark" href="#top" aria-label="FlushPass home">
          FlushP<span className="wm-a">a</span>ss
        </a>

        <nav className="nav-links" aria-label="Primary">
          {LINKS.map((l) => (
            <a className="nav-link" href={l.href} key={l.href}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="nav-right">
          <span className="score-chip nav-score-desktop" aria-live="polite">
            <span className={`rank-dot rank-${mounted ? rank : "Gold"}`} />
            {mounted ? `${rank} · ${wallet.score}` : "Member"}
          </span>
          <a className="btn btn-sm nav-cta-desktop" href="/reserve">
            Enter terminal
          </a>
          <button
            className="nav-toggle"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 7h18M3 12h18M3 17h18" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="nav-mobile" aria-label="Mobile">
          {LINKS.map((l) => (
            <a href={l.href} key={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <a href="/reserve" onClick={() => setOpen(false)}>
            Enter terminal
          </a>
        </nav>
      )}
    </header>
  );
}
