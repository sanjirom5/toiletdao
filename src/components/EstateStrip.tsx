"use client";

import { useEffect, useState } from "react";
import { CABINS, deriveStatus } from "@/lib/booking";

const STATUS_LABEL: Record<string, string> = {
  available: "Available",
  occupied: "Occupied",
  reserved: "Reserved",
};

export default function EstateStrip() {
  const [now, setNow] = useState(0);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 3500);
    return () => clearInterval(id);
  }, []);

  const mounted = now > 0;

  return (
    <div className="estate">
      {CABINS.map((c) => {
        const st = deriveStatus(c.id, now);
        return (
          <div className="estate-cabin" key={c.id}>
            <div>
              <div className="estate-name">{c.name}</div>
              <div className="estate-desig">
                {c.designation} · {c.liquidity}
              </div>
            </div>
            <div className={`estate-status st-${st}`} aria-live="polite">
              <span className="status-dot" />
              {mounted ? STATUS_LABEL[st] : "—"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
