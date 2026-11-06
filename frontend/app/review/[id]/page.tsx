import type { Metadata } from "next";
import { Suspense } from "react";
import { SessionSkeleton } from "@/components/interview/SessionStates";
import { ReviewView } from "@/components/results/ReviewView";

export const metadata: Metadata = { title: "Answer review" };

export default function ReviewPage() {
  return (
    <Suspense fallback={<SessionSkeleton />}>
      <ReviewView />
    </Suspense>
  );
}
