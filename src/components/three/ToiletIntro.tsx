"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const ToiletScene = dynamic(() => import("./ToiletScene"), { ssr: false });

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

function supports3D(): boolean {
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function ToiletIntro() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const progressRef = useRef(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEnabled(supports3D());
  }, []);

  useEffect(() => {
    if (enabled !== true) return;
    const onScroll = () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const total = wrap.offsetHeight - window.innerHeight;
      const p = clamp01(-wrap.getBoundingClientRect().top / Math.max(1, total));
      progressRef.current = p;
      if (titleRef.current) {
        const o = 1 - clamp01(p / 0.26);
        titleRef.current.style.opacity = String(o);
        titleRef.current.style.transform = `translateY(${-p * 60}px)`;
      }
      if (hintRef.current) hintRef.current.style.opacity = String(1 - clamp01(p / 0.1));
      if (veilRef.current) veilRef.current.style.opacity = String(clamp01((p - 0.88) / 0.12));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [enabled]);

  // Static, dignified fallback (SSR + reduced-motion + no-WebGL)
  if (enabled !== true) {
    return (
      <section className="intro-fallback">
        <div className="intro-fallback-inner">
          <span className="eyebrow centered">The porcelain standard</span>
          <div className="intro-fallback-emblem" aria-hidden="true">
            ⚜
          </div>
          <h2 className="intro-fallback-title">
            Behold the <span>instrument</span>.
          </h2>
          <p className="intro-fallback-sub">Cast in gold. Priced to the minute.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="intro" ref={wrapRef} aria-label="Intro: the golden cabin">
      <div className="intro-sticky">
        <div className="intro-canvas">
          <ToiletScene progressRef={progressRef} />
        </div>

        <div className="intro-title" ref={titleRef}>
          <span className="eyebrow centered">The porcelain standard</span>
          <h2 className="intro-wordmark">
            Behold the <span>instrument</span>.
          </h2>
          <p className="intro-sub">Cast in gold. Priced to the minute.</p>
        </div>

        <div className="intro-hint" ref={hintRef} aria-hidden="true">
          <span>Scroll to enter the estate</span>
          <span className="intro-hint-line" />
        </div>

        <div className="intro-veil" ref={veilRef} aria-hidden="true" />
      </div>
    </section>
  );
}
