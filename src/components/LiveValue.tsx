"use client";

import { useEffect, useState } from "react";

// A number that ticks upward live (e.g. treasury balance), formatted with
// thousands separators and tabular figures. Frozen under reduced motion.
export default function LiveValue({
  start,
  prefix = "",
  suffix = "",
  minStep = 3,
  maxStep = 90,
  intervalMs = 1400,
}: {
  start: number;
  prefix?: string;
  suffix?: string;
  minStep?: number;
  maxStep?: number;
  intervalMs?: number;
}) {
  const [value, setValue] = useState(start);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    let n = start;
    const id = setInterval(() => {
      n += minStep + Math.floor(Math.random() * (maxStep - minStep));
      setValue(n);
    }, intervalMs);
    return () => clearInterval(id);
  }, [start, minStep, maxStep, intervalMs]);

  return (
    <span className="mono" aria-live="off">
      {prefix}
      {value.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}
