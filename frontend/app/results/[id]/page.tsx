import type { Metadata } from "next";
import { Suspense } from "react";
import { SessionSkeleton } from "@/components/interview/SessionStates";
import { ResultsView } from "@/components/results/ResultsView";

export const metadata: Metadata = { title: "Results" };

export default function ResultsPage() {
  return (
    <Suspense fallback={<SessionSkeleton />}>
      <ResultsView />
    </Suspense>
  );
}
