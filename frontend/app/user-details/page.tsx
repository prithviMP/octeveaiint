import type { Metadata } from "next";
import { NameStep } from "@/components/setup/NameStep";

export const metadata: Metadata = { title: "Your name" };

export default function UserDetailsPage() {
  return <NameStep />;
}
