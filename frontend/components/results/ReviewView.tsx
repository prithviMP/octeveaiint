"use client";

import { ArrowLeft, PartyPopper, SearchCheck } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { formatPercent } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { StateMessage } from "@/components/ui/StateMessage";
import { SessionErrorState, SessionSkeleton } from "@/components/interview/SessionStates";
import { ReviewItemCard } from "@/components/results/ReviewItemCard";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/services/api";
import type { InterviewReview } from "@/types/api";

type ReviewFilter = "all" | "correct" | "incorrect";

export function ReviewView() {
  const { id } = useParams<{ id: string }>();
  const { data: review, error, loading, reload } = useAsync((signal) => api.getReview(id, signal), id);

  if (error) return <SessionErrorState error={error} sessionId={id} onRetry={reload} />;
  if (loading || !review) return <SessionSkeleton />;
  return <ReviewPanel review={review} />;
}

function ReviewPanel({ review }: { review: InterviewReview }) {
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const correct = review.items.filter((item) => item.is_correct).length;
  const incorrect = review.items.length - correct;
  const visible = review.items.filter(
    (item) => filter === "all" || (filter === "correct" ? item.is_correct : !item.is_correct),
  );

  return (
    <div className="flex flex-col gap-6">
      <GlassPanel tier="deck" className="flex flex-col gap-6 p-6 md:p-8">
        <SectionHeader
          as="h1"
          size="lg"
          eyebrow="Answer review"
          eyebrowIcon={SearchCheck}
          title={`${review.student_name}'s answers`}
          description={`${review.correct_answers} of ${review.total_questions} correct (${formatPercent(review.percentage)}). Read the explanation under each question to see why the right answer is right.`}
          action={
            <Button variant="ghost" href={`/results/${review.session_id}`} icon={ArrowLeft}>
              Back to results
            </Button>
          }
        />
        <SegmentedControl<ReviewFilter>
          label="Filter questions"
          value={filter}
          onChange={setFilter}
          activeStyle="dark"
          className="sm:max-w-md"
          options={[
            { value: "all", label: `All (${review.items.length})` },
            { value: "correct", label: `Correct (${correct})` },
            { value: "incorrect", label: `Incorrect (${incorrect})` },
          ]}
        />
      </GlassPanel>

      {visible.length === 0 ? (
        <StateMessage
          icon={PartyPopper}
          title={filter === "incorrect" ? "No incorrect answers" : "No correct answers yet"}
          description={
            filter === "incorrect"
              ? "You got every question right. Try a harder difficulty next time."
              : "Read through the explanations and give it another go."
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {visible.map((item) => (
            <ReviewItemCard key={item.question_id} item={item} total={review.total_questions} />
          ))}
        </div>
      )}
    </div>
  );
}
