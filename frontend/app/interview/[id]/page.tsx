import type { Metadata } from "next";
import { Suspense } from "react";
import { InterviewView } from "@/components/interview/InterviewView";
import { SessionSkeleton } from "@/components/interview/SessionStates";

export const metadata: Metadata = { title: "Interview" };

export default function InterviewPage() {
  return (
    <Suspense fallback={<SessionSkeleton />}>
      <InterviewView />
    </Suspense>
  );
}
