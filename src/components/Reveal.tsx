import type { ReactNode, CSSProperties } from "react";

// Structural section wrapper. Content is always visible (no scroll-gated
// opacity) so the page is robust for live demos and screenshots; the
// distinctive motion lives in the terminal, ticker, and occupancy map.
export default function Reveal({
  children,
  className = "",
  as: Tag = "div",
  style,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section";
  style?: CSSProperties;
}) {
  return (
    <Tag className={className} style={style}>
      {children}
    </Tag>
  );
}
