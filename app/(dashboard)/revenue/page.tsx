import type { Metadata } from "next";

import { RevenuePage } from "@/components/revenue/revenue-page";

export const metadata: Metadata = {
  title: "Revenue",
};

export default function Page() {
  return <RevenuePage />;
}
