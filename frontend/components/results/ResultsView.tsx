"use client";

import { BookOpen, CircleCheck, CircleX, House, ListChecks, RotateCcw, Trophy } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { subjectLabel } from "@/lib/subjects";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SessionErrorState, SessionSkeleton } from "@/components/interview/SessionStates";
import { AICoachReport } from "@/components/results/AICoachReport";
import { PerformanceBadge } from "@/components/results/PerformanceBadge";
import { ScoreRing } from "@/components/results/ScoreRing";
import { StatTile } from "@/components/results/StatTile";
import { SubjectBreakdownList } from "@/components/results/SubjectBreakdownList";
import { useAsync } from "@/hooks/useAsync";
import { useInterviewDraft } from "@/hooks/useInterviewDraft";
import { api } from "@/services/api";
import type { InterviewResult } from "@/types/api";

export function ResultsView() {
  const { id } = useParams<{ id: string }>();
  const { data: result, error, loading, reload } = useAsync((signal) => api.getResults(id, signal), id);

  if (error) return <SessionErrorState error={error} sessionId={id} onRetry={reload} />;
  if (loading || !result) return <SessionSkeleton />;
  return <ResultsPanel result={result} />;
}

function ResultsPanel({ result }: { result: InterviewResult }) {
  const router = useRouter();
  const { update } = useInterviewDraft();
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const firstName = result.student_name.split(" ")[0];

  const retry = async () => {
    setRetrying(true);
    setRetryError(null);
    const config = {
      student_name: result.student_name,
      subjects: result.selected_subjects,
      num_questions: result.total_questions,
      difficulty: result.difficulty,
    };
    update({
      name: config.student_name,
      subjects: config.subjects,
      numQuestions: config.num_questions,
      difficulty: config.difficulty,
    });
    try {
      const session = await api.createInterview(config);
      router.push(`/interview/${session.id}`);
    } catch (cause) {
      setRetryError(cause instanceof Error ? cause.message : "Couldn't start a new interview.");
      setRetrying(false);
    }
  };

  return (
    <GlassPanel tier="deck" className="flex flex-col gap-8 p-6 md:p-10">
      <SectionHeader
        as="h1"
        size="lg"
        eyebrow="Interview results"
        eyebrowIcon={Trophy}
        title={`Here's how you did, ${firstName}`}
        description={result.feedback}
        action={<PerformanceBadge level={result.performance_level} percentage={result.percentage} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <GlassPanel tier="card" className="flex flex-col items-center justify-center gap-5 p-6 lg:col-span-5">
          <ScoreRing percentage={result.percentage} caption={`${result.score_display} correct`} />
          <div className="flex flex-wrap justify-center gap-1.5">
            {result.selected_subjects.map((code) => (
              <Badge key={code} tone="white">
                {subjectLabel(code)}
              </Badge>
            ))}
            <Badge mono>{result.difficulty}</Badge>
          </div>
        </GlassPanel>

        <div className="flex flex-col gap-6 lg:col-span-7">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatTile label="Total questions" value={result.total_questions} icon={ListChecks} />
            <StatTile label="Correct" value={result.correct_answers} icon={CircleCheck} tone="success" />
            <StatTile label="Incorrect" value={result.incorrect_answers} icon={CircleX} tone="danger" />
            <StatTile label="Score" value={result.score_display} icon={Trophy} tone="accent" />
          </div>
          <GlassPanel tier="card" as="section" className="flex flex-col gap-5 p-5 sm:p-6">
            <h2 className="text-sm font-semibold tracking-tight text-slate-900">By subject</h2>
            <SubjectBreakdownList items={result.subject_breakdown} />
          </GlassPanel>
        </div>
      </div>

      <AICoachReport sessionId={result.session_id} />

      <div className="flex flex-col gap-3 border-t border-slate-200/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="text" href="/" icon={House}>
          Return to home
        </Button>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {retryError && (
            <span role="alert" className="text-sm text-rose-600">
              {retryError}
            </span>
          )}
          <Button variant="ghost" icon={RotateCcw} onClick={retry} loading={retrying}>
            Retry interview
          </Button>
          <Button href={`/review/${result.session_id}`} icon={BookOpen} size="lg">
            Review answers
          </Button>
        </div>
      </div>
    </GlassPanel>
  );
}
