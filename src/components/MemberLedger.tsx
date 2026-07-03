"use client";

import { CABINS, fmtClock, money, rankFor } from "@/lib/booking";
import { useWallet } from "@/lib/useWallet";

export default function MemberLedger() {
  const { wallet, mounted } = useWallet();
  const info = rankFor(wallet.score);
  const pct = mounted
    ? Math.max(2, Math.min(100, Math.round(((wallet.score - info.floor) / (info.ceil - info.floor)) * 100)))
    : 0;
  const recent = wallet.bookings.slice(0, 5);
  const dash = "—";

  return (
    <div className="ledger">
      <div className="ledger-standing">
        <div className="eyebrow">Your standing</div>
        <div className="rank-badge">
          <span className={`rank-ring rank-${mounted ? info.rank : "Gold"}`} aria-hidden="true">
            {mounted ? info.rank[0] : "·"}
          </span>
          <div>
            <div className="ledger-rank">{mounted ? info.rank : dash}</div>
            <div className="ledger-score mono">
              {mounted ? wallet.score : dash} <span>Toilet Score</span>
            </div>
          </div>
        </div>
        <div className="rank-progress">
          <div className="rank-progress-bar">
            <span style={{ width: `${pct}%` }} />
          </div>
          <div className="rank-progress-label mono">
            {mounted
              ? info.next
                ? `${info.toNext} to ${info.next}`
                : "Apex tier attained"
              : dash}
          </div>
        </div>
        <div className="ledger-lifetime mono">
          Lifetime cleared · {mounted ? money(wallet.settledValue) : dash}
        </div>
      </div>

      <div className="ledger-positions">
        <div className="eyebrow">Recent positions</div>
        {!mounted || recent.length === 0 ? (
          <div className="ledger-empty">
            No positions on record. The book awaits your first reservation.
          </div>
        ) : (
          <ul>
            {recent.map((b) => (
              <li className="position-row mono" key={b.id}>
                <span className="pid">{b.id}</span>
                <span>{CABINS.find((c) => c.id === b.cabin)?.name}</span>
                <span>{fmtClock(b.slotMs)}</span>
                <span className="pv">{money(b.price)}</span>
                <span className={`pstat pstat-${b.status}`}>{b.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
