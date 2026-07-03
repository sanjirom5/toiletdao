"use client";

import PriceChart from "./PriceChart";
import { money } from "@/lib/market";
import type { Stall, Occupancy } from "@/lib/platform";
import type { StallView } from "@/lib/usePlatform";

function fmtElapsed(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

const STATUS_LABEL: Record<StallView["status"], string> = {
  available: "Available",
  mine: "In use · yours",
  member: "In use · member",
};

export default function StallTicker({
  cfg,
  view,
  occupancy,
  now,
  disabled,
  onReserve,
  onEnd,
}: {
  cfg: Stall;
  view: StallView;
  occupancy: Occupancy | null; // set only when this stall is mine
  now: number;
  disabled: boolean; // true when the member is holding the other stall
  onReserve: () => void;
  onEnd: () => void;
}) {
  const { status } = view;

  return (
    <div className={`stall stall-${status}`}>
      <div className="stall-top">
        <div>
          <div className="stall-name">
            {cfg.name} <span className="stall-ticker mono">{cfg.ticker}</span>
          </div>
          <div className="stall-desig mono">{cfg.designation}</div>
        </div>
        <div className="stall-badge" aria-live="polite">
          <span className="stall-dot" />
          {status === "member" && view.holderName ? `In use · ${view.holderName}` : STATUS_LABEL[status]}
        </div>
      </div>

      <div className="stall-quote">
        <span className="stall-figure mono">{money(view.price)}</span>
        <span className="stall-unit">/min</span>
        <span className={`stall-move mono ${view.up ? "up" : "down"}`}>
          {view.up ? "▲" : "▼"} {Math.abs(view.pct).toFixed(1)}%
        </span>
      </div>

      <PriceChart data={view.buffer} up={view.up} />

      <div className="stall-action">
        {status === "mine" ? (
          occupancy ? (
            <div className="meter">
              <div className="meter-row">
                <div>
                  <div className="meter-k mono">Elapsed</div>
                  <div className="meter-v mono">{fmtElapsed(now - occupancy.startedMs)}</div>
                </div>
                <div className="meter-right">
                  <div className="meter-k mono">Running</div>
                  <div className="meter-v meter-bill mono">{money(occupancy.accrued)}</div>
                </div>
              </div>
              <button className="btn btn-oxblood" onClick={onEnd} style={{ width: "100%" }}>
                End session &amp; settle
              </button>
              <div className="meter-fine mono">
                Billed live at {money(view.price)}/min — the rate floats while you sit.
              </div>
            </div>
          ) : (
            <div className="meter">
              <div className="stall-busy mono" style={{ borderTop: "none", paddingTop: 0 }}>
                In use · yours (held in another tab)
              </div>
              <button className="btn btn-oxblood" onClick={onEnd} style={{ width: "100%" }}>
                End session &amp; settle
              </button>
            </div>
          )
        ) : status === "member" ? (
          <div className="stall-busy mono">
            Occupied by {view.holderName ?? "a member"} · book suspended until release.
          </div>
        ) : (
          <button
            className="btn btn-solid"
            onClick={onReserve}
            disabled={disabled}
            style={{ width: "100%" }}
          >
            {disabled ? "You hold the other stall" : `Reserve at ${money(view.price)}/min`}
          </button>
        )}
      </div>
    </div>
  );
}
