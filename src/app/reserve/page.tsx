import type { Metadata } from "next";
import Platform from "@/components/Platform";

export const metadata: Metadata = {
  title: "The Terminal — FlushPass",
  description:
    "The live access market for the nFactorial Bathroom. Two stalls, live per-minute pricing, metered settlement.",
};

export default function ReservePage() {
  return <Platform />;
}
