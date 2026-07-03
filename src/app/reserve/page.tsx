import type { Metadata } from "next";
import Platform from "@/components/Platform";

export const metadata: Metadata = {
  title: "The Terminal — WC.exit",
  description:
    "Reserve the nFactorial cabin. Sign in, price your window, and settle. Live availability, members only.",
};

export default function ReservePage() {
  return <Platform />;
}
