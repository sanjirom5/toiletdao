import ToiletIntro from "@/components/three/ToiletIntro";
import Ticker from "@/components/Ticker";
import SiteNav from "@/components/SiteNav";
import { Logos3 } from "@/components/ui/logos3";

// Brand marks tinted to the house gold via the simpleicons color path.
const pressLogos = [
  { id: "logo-1", description: "Google", image: "https://cdn.simpleicons.org/google/C9A24B", className: "h-7 w-auto" },
  { id: "logo-2", description: "Meta", image: "https://cdn.simpleicons.org/meta/C9A24B", className: "h-7 w-auto" },
  { id: "logo-3", description: "Uber", image: "https://cdn.simpleicons.org/uber/C9A24B", className: "h-7 w-auto" },
  { id: "logo-4", description: "Apple", image: "https://cdn.simpleicons.org/apple/C9A24B", className: "h-7 w-auto" },
  { id: "logo-5", description: "Netflix", image: "https://cdn.simpleicons.org/netflix/C9A24B", className: "h-7 w-auto" },
];
import EstateStrip from "@/components/EstateStrip";
import BookingDesk from "@/components/BookingDesk";
import MemberLedger from "@/components/MemberLedger";
import { hero, estate, desk, doctrine, membership, faq, footer, brand } from "@/lib/copy";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#top">
        Skip to content
      </a>
      <ToiletIntro />
      <div id="enter" />
      <Ticker />
      <SiteNav />

      <main id="top">
        {/* ---------------- HERO ---------------- */}
        <section className="hero">
          <div className="container hero-inner">
            <span className="eyebrow centered">{hero.eyebrow}</span>
            <h1>
              {hero.headlineLead}
              <em>{hero.headlineEm}</em>.
            </h1>
            <p className="hero-tag">{hero.tag}</p>
            <div className="hero-cta">
              <a className="btn btn-solid" href="/reserve">
                {hero.primary}
              </a>
              <a className="btn btn-quiet" href="#membership">
                {hero.secondary}
              </a>
            </div>
            <div className="hero-assurances">
              {hero.assurances.map((a) => (
                <span key={a}>{a}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- PRESS / LOGOS ---------------- */}
        <div className="logos-wrap">
          <Logos3
            heading="We breathe the same air as Google, Meta, Uber, Apple & Netflix"
            logos={pressLogos}
          />
        </div>

        {/* ---------------- ESTATE ---------------- */}
        <section className="section" id="estate" style={{ paddingBlock: "clamp(56px,8vw,96px)" }}>
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">{estate.eyebrow}</span>
              <h2 className="display-title">{estate.heading}</h2>
              <p className="lede">{estate.lede}</p>
            </div>
          </div>
          <EstateStrip />
        </section>

        {/* ---------------- THE DESK ---------------- */}
        <section className="section" id="desk" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">{desk.eyebrow}</span>
              <h2 className="display-title">{desk.heading}</h2>
              <p className="lede">{desk.lede}</p>
            </div>
            <BookingDesk />
            <div style={{ height: 20 }} />
            <MemberLedger />
          </div>
        </section>

        {/* ---------------- DOCTRINE ---------------- */}
        <section className="section" id="doctrine" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">{doctrine.eyebrow}</span>
              <h2 className="display-title">{doctrine.heading}</h2>
            </div>
          </div>
          <div className="container">
            <div className="doctrine">
              {doctrine.columns.map((c) => (
                <div className="doctrine-col" key={c.n}>
                  <div className="doctrine-n">{c.n}</div>
                  <h3 className="doctrine-h">{c.h}</h3>
                  <p className="doctrine-p">{c.p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- MEMBERSHIP ---------------- */}
        <section className="section" id="membership" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">{membership.eyebrow}</span>
              <h2 className="display-title">{membership.heading}</h2>
              <p className="lede">{membership.lede}</p>
            </div>
          </div>
          <div className="container">
            <div className="tiers">
              {membership.tiers.map((t) => (
                <div className={`tier ${t.featured ? "feature" : ""}`} key={t.name}>
                  <div className="tier-rank">{t.rank}</div>
                  <div className="tier-name">{t.name}</div>
                  <div className="tier-price">
                    <b>{t.price}</b>
                    {t.priceNote ? ` · ${t.priceNote}` : ""}
                  </div>
                  <p className="tier-desc">{t.desc}</p>
                  <ul className="tier-list">
                    {t.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <a className={`btn ${t.featured ? "btn-solid" : "btn-quiet"}`} href="#desk">
                    {t.cta}
                  </a>
                </div>
              ))}
            </div>
            <p
              className="mono"
              style={{
                textAlign: "center",
                marginTop: 26,
                fontSize: "0.72rem",
                letterSpacing: "0.06em",
                color: "var(--stone)",
              }}
            >
              {membership.note}
            </p>
          </div>
        </section>

        {/* ---------------- FAQ ---------------- */}
        <section className="section" id="faq" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">{faq.eyebrow}</span>
              <h2 className="display-title">{faq.heading}</h2>
            </div>
            <div className="faq-list">
              {faq.items.map((item, i) => (
                <details className="faq-item" key={item.q}>
                  <summary className="faq-summary">
                    <span className="faq-q-n mono">{String(i + 1).padStart(2, "0")}</span>
                    {item.q}
                    <span className="faq-icon" aria-hidden="true">
                      +
                    </span>
                  </summary>
                  <p className="faq-answer">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <span className="wordmark">
                WC<b>.exit</b>
              </span>
              <p className="footer-tag">{footer.tagline}</p>
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
            <p>{footer.statusLine}</p>
            <p>{footer.privacyLine}</p>
            <p>{footer.careersLine}</p>
          </div>

          <div className="footer-fine" style={{ paddingTop: 0, borderTop: "none" }}>
            <p>{footer.disclosure}</p>
          </div>

          <div className="footer-legal">
            <span>{footer.legal}</span>
            <span>{brand.name} · Uptime 99.97%</span>
          </div>
        </div>
      </footer>
    </>
  );
}
