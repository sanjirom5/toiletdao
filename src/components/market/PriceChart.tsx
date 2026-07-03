"use client";

// A tiny live line chart drawn as an SVG polyline over a rolling price buffer.
// No chart library — just maths and paths. Stroke stays crisp under stretch via
// non-scaling-stroke (see globals.css).

export default function PriceChart({ data, up }: { data: number[]; up: boolean }) {
  const w = 300;
  const h = 72;
  const pad = 5;

  if (data.length < 2) {
    return <svg className="chart" viewBox={`0 0 ${w} ${h}`} aria-hidden="true" />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - 2 * pad);
    const y = pad + (1 - (v - min) / range) * (h - 2 * pad);
    return [x, y] as const;
  });

  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const [fx] = pts[0];
  const [lx, ly] = pts[pts.length - 1];
  const area = `${line} L${lx.toFixed(1)},${h - pad} L${fx.toFixed(1)},${h - pad} Z`;
  const cls = up ? "up" : "down";

  return (
    <svg
      className={`chart chart-${cls}`}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path className="chart-area" d={area} />
      <path className="chart-line" d={line} />
      <circle className="chart-dot" cx={lx} cy={ly} r={2.8} />
    </svg>
  );
}
