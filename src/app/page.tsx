import SurgeTape from "@/components/SurgeTape";
import SiteNav from "@/components/SiteNav";
import ToiletTerminal from "@/components/ToiletTerminal";
import OccupancyMap from "@/components/OccupancyMap";
import PricingCurve from "@/components/PricingCurve";
import Reveal from "@/components/Reveal";
import {
  brand,
  hero,
  featuredIn,
  metrics,
  problem,
  howItWorks,
  occupancy,
  derivatives,
  economics,
  pricing,
  testimonials,
  status,
  faq,
  footer,
} from "@/lib/copy";

export default function Home() {
  return (
    <>
      <SurgeTape />
      <SiteNav />

      <main id="top">
        {/* ---------------- HERO ---------------- */}
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="hero-eyebrow mono">
                <span className="dot" />
                {hero.eyebrow}
              </span>
              <h1>{hero.headline}</h1>
              <p className="hero-sub">{hero.subhead}</p>
              <div className="hero-cta">
                <a className="btn btn-primary" href="#pricing">
                  {hero.primaryCta}
                </a>
                <a className="btn btn-ghost" href="#how">
                  {hero.secondaryCta}
                </a>
              </div>
              <span className="hero-note mono">
                <span className="dot" />
                {hero.ticker}
              </span>
            </div>
            <div className="hero-terminal-wrap">
              <ToiletTerminal />
            </div>
          </div>
        </section>

        {/* ---------------- FEATURED IN ---------------- */}
        <div className="featured">
          <div className="container featured-inner">
            <span className="featured-label">As featured in</span>
            {featuredIn.map((f) => (
              <span className="featured-logo" key={f}>
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* ---------------- METRICS ---------------- */}
        <section className="section" style={{ paddingBlock: "clamp(48px,7vw,88px)" }}>
          <div className="container">
            <Reveal className="metrics">
              {metrics.map((m) => (
                <div className="metric" key={m.label}>
                  <div className={`metric-value ${m.value.startsWith("+") ? "metric-up" : ""}`}>
                    {m.value}
                    {m.unit && <span className="unit">{m.unit}</span>}
                  </div>
                  <div className="metric-label">{m.label}</div>
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        {/* ---------------- PROBLEM ---------------- */}
        <section className="section" style={{ background: "var(--surface)", borderBlock: "1px solid var(--hair)" }}>
          <div className="container problem-grid">
            <Reveal>
              <span className="eyebrow">{problem.eyebrow}</span>
              <h2 className="problem-heading">{problem.heading}</h2>
              <p className="problem-body" style={{ marginTop: 20 }}>
                {problem.body}
              </p>
            </Reveal>
            <Reveal delay={80}>
              <div className="problem-aside">
                <span className="eyebrow" style={{ marginBottom: 14 }}>
                  Market structure
                </span>
                <div className="problem-aside-row">
                  <span className="problem-aside-k">Legacy allocation</span>
                  <span className="problem-aside-v pav-bad">A hallway line</span>
                </div>
                <div className="problem-aside-row">
                  <span className="problem-aside-k">ToiletDAO allocation</span>
                  <span className="problem-aside-v pav-good">An order book</span>
                </div>
                <div className="problem-aside-row">
                  <span className="problem-aside-k">Price discovery</span>
                  <span className="problem-aside-v pav-good">Real-time</span>
                </div>
                <div className="problem-aside-row">
                  <span className="problem-aside-k">Hedging</span>
                  <span className="problem-aside-v pav-good">Futures + Shorts</span>
                </div>
                <div className="problem-aside-row">
                  <span className="problem-aside-k">Settlement</span>
                  <span className="problem-aside-v pav-good">T+0 on-chain</span>
                </div>
                <div className="problem-aside-row">
                  <span className="problem-aside-k">Liquidity events / day</span>
                  <span className="problem-aside-v">6 per capita</span>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------------- HOW IT WORKS ---------------- */}
        <section className="section" id="how">
          <div className="container">
            <Reveal className="section-head">
              <span className="eyebrow">{howItWorks.eyebrow}</span>
              <h2 className="section-title">{howItWorks.heading}</h2>
            </Reveal>
            <Reveal className="steps">
              {howItWorks.steps.map((s) => (
                <div className="step" key={s.n}>
                  <span className="step-n mono">{s.n}</span>
                  <h3 className="step-title">{s.title}</h3>
                  <p className="step-desc">{s.desc}</p>
                </div>
              ))}
            </Reveal>
            <Reveal>
              <div className="curve-card">
                <div className="curve-copy">
                  <span className="eyebrow">{howItWorks.curve.eyebrow}</span>
                  <h3>Price is a function of proximity</h3>
                  <p>{howItWorks.curve.caption}</p>
                  <div className="curve-anchors">
                    {howItWorks.curve.anchors.map((a) => (
                      <span className="chip mono" key={a.label}>
                        {a.label} · ${a.price}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="curve-svg-wrap">
                  <PricingCurve />
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------------- OCCUPANCY MAP ---------------- */}
        <section className="section" id="markets" style={{ background: "var(--bg-tint)", borderBlock: "1px solid var(--hair)" }}>
          <div className="container occ-wrap">
            <Reveal>
              <span className="eyebrow">{occupancy.eyebrow}</span>
              <h2 className="section-title">{occupancy.heading}</h2>
              <p className="lede">{occupancy.body}</p>
            </Reveal>
            <Reveal delay={80}>
              <OccupancyMap />
            </Reveal>
          </div>
        </section>

        {/* ---------------- DERIVATIVES ---------------- */}
        <section className="section" id="derivatives">
          <div className="container">
            <Reveal className="section-head">
              <span className="eyebrow">{derivatives.eyebrow}</span>
              <h2 className="section-title">{derivatives.heading}</h2>
            </Reveal>
            <Reveal className="deriv-grid">
              {derivatives.cards.map((c) => (
                <div className="deriv-card" key={c.title}>
                  <span className={`deriv-tag ${c.tone}`}>{c.tag}</span>
                  <h3 className="deriv-title">{c.title}</h3>
                  <p className="deriv-desc">{c.desc}</p>
                  <div className="deriv-chip">{c.chip}</div>
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        {/* ---------------- UNIT ECONOMICS ---------------- */}
        <section className="section" style={{ background: "var(--surface)", borderBlock: "1px solid var(--hair)" }}>
          <div className="container">
            <Reveal className="section-head">
              <span className="eyebrow">{economics.eyebrow}</span>
              <h2 className="section-title">{economics.heading}</h2>
            </Reveal>
            <div className="econ-wrap">
              <Reveal>
                <div className="econ-take">
                  <div className="econ-take-value mono">{economics.takeRate}</div>
                  <div className="econ-take-label">{economics.takeRateLabel}</div>
                  <div className="econ-take-note">
                    We are not the toilet. We are the exchange the toilet clears on.
                    Asset-light by construction.
                  </div>
                </div>
              </Reveal>
              <Reveal delay={80}>
                <div className="econ-table-wrap">
                  <table className="econ-table">
                    <thead>
                      <tr>
                        <th>Line item</th>
                        <th>Value</th>
                        <th>Basis</th>
                      </tr>
                    </thead>
                    <tbody>
                      {economics.rows.map((r) => (
                        <tr key={r.k}>
                          <td className="econ-k">{r.k}</td>
                          <td className="econ-v">{r.v}</td>
                          <td className="econ-note">{r.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------------- PRICING ---------------- */}
        <section className="section" id="pricing">
          <div className="container">
            <Reveal className="section-head" style={{ marginInline: "auto", textAlign: "center" }}>
              <span className="eyebrow" style={{ justifyContent: "center" }}>
                {pricing.eyebrow}
              </span>
              <h2 className="section-title">{pricing.heading}</h2>
            </Reveal>
            <Reveal className="price-grid">
              {pricing.tiers.map((t) => (
                <div className={`price-card ${t.featured ? "featured" : ""}`} key={t.tier}>
                  {t.featured && <span className="price-badge">Most liquid</span>}
                  <span className="price-tier">{t.tier}</span>
                  <div className="price-amount">
                    <span className="amt mono">{t.price}</span>
                    {t.period && <span className="per">{t.period}</span>}
                  </div>
                  <p className="price-tagline">{t.tagline}</p>
                  <ul className="price-features">
                    {t.features.map((f) => (
                      <li key={f}>
                        <span className="tick" aria-hidden="true">
                          ✓
                        </span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <a className={`btn ${t.featured ? "btn-primary" : "btn-ghost"}`} href="#top">
                    {t.cta}
                  </a>
                </div>
              ))}
            </Reveal>
            <p className="price-klarna">
              <b>Toilet Klarna</b> available at checkout — buy now, pay later on urgent slots.
              Financing subject to Toilet Score.
            </p>
          </div>
        </section>

        {/* ---------------- TESTIMONIALS ---------------- */}
        <section className="section" style={{ background: "var(--bg-tint)", borderBlock: "1px solid var(--hair)" }}>
          <div className="container">
            <Reveal className="section-head">
              <span className="eyebrow">{testimonials.eyebrow}</span>
              <h2 className="section-title">{testimonials.heading}</h2>
            </Reveal>
            <Reveal className="testi-grid">
              {testimonials.quotes.map((q) => (
                <figure className="testi-card" key={q.name}>
                  <div className="testi-mark" aria-hidden="true">
                    &ldquo;
                  </div>
                  <blockquote className="testi-quote">{q.quote}</blockquote>
                  <figcaption className="testi-who">
                    <span className="testi-avatar mono" aria-hidden="true">
                      {q.initials}
                    </span>
                    <span>
                      <span className="testi-name">{q.name}</span>
                      <br />
                      <span className="testi-title">{q.title}</span>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </Reveal>
          </div>
        </section>

        {/* ---------------- STATUS + CAREERS ---------------- */}
        <section className="section">
          <div className="container">
            <Reveal className="section-head">
              <span className="eyebrow">{status.eyebrow}</span>
              <h2 className="section-title">{status.heading}</h2>
            </Reveal>
            <Reveal className="trust-grid">
              <div className="status-card">
                <div className="status-top">
                  <span className="status-dot" aria-hidden="true" />
                  <span className="status-title">{status.systems}</span>
                </div>
                <p className="status-line mono">{status.line}</p>
                <div className="status-uptime" aria-hidden="true">
                  {Array.from({ length: 44 }, (_, i) => (
                    <span className={`status-bar ${i === 29 ? "down" : ""}`} key={i} />
                  ))}
                </div>
              </div>
              <div className="careers-card">
                <span className="careers-eyebrow">We&rsquo;re hiring</span>
                <h3 className="careers-role">{status.careers.role}</h3>
                <p className="careers-detail">{status.careers.detail}</p>
                <a className="btn btn-ghost btn-sm" href="#top">
                  View open roles
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------------- FAQ ---------------- */}
        <section className="section" id="faq" style={{ background: "var(--surface)", borderTop: "1px solid var(--hair)" }}>
          <div className="container">
            <Reveal className="section-head">
              <span className="eyebrow">{faq.eyebrow}</span>
              <h2 className="section-title">{faq.heading}</h2>
            </Reveal>
            <Reveal>
              <div className="faq-list">
                {faq.items.map((item) => (
                  <details className="faq-item" key={item.q}>
                    <summary className="faq-summary">
                      {item.q}
                      <span className="faq-icon" aria-hidden="true">
                        +
                      </span>
                    </summary>
                    <p className="faq-answer">{item.a}</p>
                  </details>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <span className="brand">
                <span className="brand-mark" aria-hidden="true">
                  W
                </span>
                {brand.wordmark}
              </span>
              <p className="footer-tagline">{footer.tagline}</p>
            </div>
            {footer.columns.map((col) => (
              <div className="footer-col" key={col.title}>
                <h4>{col.title}</h4>
                <ul>
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#top">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="footer-fine">
            <p>
              <span className="footer-status">
                <span className="status-dot" aria-hidden="true" />
                {footer.statusLine}
              </span>
            </p>
            <p>{footer.privacyLine}</p>
            <p>{footer.careersLine}</p>
          </div>

          <div className="footer-fine" style={{ paddingTop: 0 }}>
            <p>{footer.disclosure}</p>
          </div>

          <div className="footer-legal">
            <span>
              © 2026 {brand.name} Labs, Inc. · {brand.ticker} · Not a bank. Not a toilet.
            </span>
            <span className="mono">Settlement T+0 · Uptime 99.97%</span>
          </div>
        </div>
      </footer>
    </>
  );
}
