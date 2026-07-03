"use client";

import { usePlatform } from "@/lib/usePlatform";
import { money } from "@/lib/market";
import MarketBoard from "./market/MarketBoard";

export default function Platform() {
  const p = usePlatform();

  return (
    <div className="platform">
      <PlatformHeader
        name={p.mounted ? p.name : undefined}
        spend={p.mounted ? p.spend : undefined}
        canChange={p.mounted && !p.occupancy}
        onChangeName={p.changeName}
      />
      <div className="pf-shell">
        <MarketBoard />
      </div>
    </div>
  );
}

function PlatformHeader({
  name,
  spend,
  canChange,
  onChangeName,
}: {
  name?: string | null;
  spend?: number;
  canChange?: boolean;
  onChangeName?: () => void;
}) {
  return (
    <header className="pf-header">
      <div className="container pf-header-inner">
        <a className="wordmark" href="/" aria-label="WC.exit home">
          WC<b>.exit</b>
          <span className="pf-tag">Terminal</span>
        </a>
        <div className="pf-header-right">
          {typeof spend === "number" && (
            <span className="score-chip">
              <span className="rank-dot rank-Gold" />
              Spend · {money(spend)}
            </span>
          )}
          {name ? (
            <>
              <span className="pf-member mono">{name}</span>
              {canChange && (
                <button className="ulink" onClick={onChangeName}>
                  Not you?
                </button>
              )}
            </>
          ) : (
            <a className="ulink" href="/">
              Return to the institution
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
