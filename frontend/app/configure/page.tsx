import type { Metadata } from "next";
import { ConfigureStep } from "@/components/setup/ConfigureStep";

export const metadata: Metadata = { title: "Configure interview" };

export default function ConfigurePage() {
  return <ConfigureStep />;
}
