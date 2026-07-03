import { surgeTape } from "@/lib/copy";

export default function SurgeTape() {
  const items = [...surgeTape.quotes, ...surgeTape.quotes];
  return (
    <div className="tape" role="marquee" aria-label="Live market ticker">
      <div className="tape-track">
        {items.map((q, i) => (
          <span className="tape-item" key={i}>
            <span className="tape-sym">{q.sym}</span>
            <span>{q.px}</span>
            <span className={q.up ? "tape-up" : "tape-down"}>
              {q.up ? "▲" : "▼"} {q.chg}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
