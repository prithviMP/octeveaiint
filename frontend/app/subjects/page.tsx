import type { Metadata } from "next";
import { SubjectsStep } from "@/components/setup/SubjectsStep";

export const metadata: Metadata = { title: "Choose subjects" };

export default function SubjectsPage() {
  return <SubjectsStep />;
}
