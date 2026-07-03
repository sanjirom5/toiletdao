// Time-to-slot pricing curve. Price rises as the slot approaches; the
// 9:00–9:15 Rush Hour band clears at a ×5 multiplier.
export default function PricingCurve() {
  const pts = [
    { x: 48, y: 192, h: "48h", p: "$10" },
    { x: 133, y: 174, h: "24h", p: "$20" },
    { x: 302, y: 147, h: "6h", p: "$35" },
    { x: 520, y: 30, h: "1h", p: "$100" },
  ];
  const line = "M 48 192 C 120 186, 210 176, 302 147 C 402 118, 472 80, 520 30";
  const area = `${line} L 520 210 L 48 210 Z`;

  return (
    <svg
      viewBox="0 0 560 250"
      role="img"
      aria-label="Pricing curve: $10 at 48 hours out, $20 at 24 hours, $35 at 6 hours, $100 at 1 hour, with a 5x Rush Hour band."
      style={{ width: "100%", height: "auto", display: "block", minWidth: 420 }}
    >
      <defs>
        <linearGradient id="wc-curve" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="var(--teal)" />
          <stop offset="0.55" stopColor="var(--amber)" />
          <stop offset="1" stopColor="var(--vermilion)" />
        </linearGradient>
        <linearGradient id="wc-area" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--vermilion)" stopOpacity="0.16" />
          <stop offset="1" stopColor="var(--teal)" stopOpacity="0.04" />
        </linearGradient>
      </defs>

      {/* gridlines */}
      {[30, 80, 130, 180].map((y) => (
        <line key={y} x1="48" y1={y} x2="520" y2={y} stroke="var(--hair)" strokeWidth="1" />
      ))}

      {/* rush-hour band */}
      <rect x="470" y="18" width="50" height="192" fill="var(--vermilion)" opacity="0.07" />
      <line x1="470" y1="18" x2="470" y2="210" stroke="var(--vermilion)" strokeWidth="1" strokeDasharray="3 4" opacity="0.6" />
      <text x="495" y="14" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--vermilion)" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}>
        RUSH ×5
      </text>

      {/* area + curve */}
      <path d={area} fill="url(#wc-area)" />
      <path d={line} fill="none" stroke="url(#wc-curve)" strokeWidth="3" strokeLinecap="round" />

      {/* anchor points */}
      {pts.map((pt) => (
        <g key={pt.h}>
          <circle cx={pt.x} cy={pt.y} r="4.5" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
          <text x={pt.x} y={pt.y - 12} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--ink)" style={{ fontFamily: "var(--font-mono)" }}>
            {pt.p}
          </text>
          <text x={pt.x} y="230" textAnchor="middle" fontSize="10" fill="var(--muted)" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>
            {pt.h}
          </text>
        </g>
      ))}

      {/* axis labels */}
      <text x="48" y="248" fontSize="9" fill="var(--faint)" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}>
        TIME TO SLOT →
      </text>
    </svg>
  );
}
