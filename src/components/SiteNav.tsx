"use client";

import { useEffect, useState } from "react";
import { brand, nav } from "@/lib/copy";

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

export default function SiteNav() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "dark" || attr === "light") {
      setTheme(attr);
    } else {
      setTheme(
        window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      );
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("wc-theme", next);
    } catch {}
  };

  return (
    <header className="nav">
      <div className="container nav-inner">
        <a className="brand" href="#top" aria-label={`${brand.name} home`}>
          <span className="brand-mark" aria-hidden="true">
            W
          </span>
          {brand.wordmark}
        </a>

        <nav className="nav-links" aria-label="Primary">
          {nav.links.map((l) => (
            <a className="nav-link" href={l.href} key={l.href}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="nav-right">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
          <a className="btn btn-dark btn-sm nav-cta-desktop" href="#top">
            {nav.cta}
          </a>
          <button
            className="nav-toggle"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="nav-mobile" aria-label="Mobile">
          {nav.links.map((l) => (
            <a href={l.href} key={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <a href="#top" onClick={() => setOpen(false)}>
            {nav.cta}
          </a>
        </nav>
      )}
    </header>
  );
}
