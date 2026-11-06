"use client";

import { ArrowLeft, ArrowRight, Keyboard, Send } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { subjectLabel } from "@/lib/subjects";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { OptionList } from "@/components/interview/OptionRow";
import { QuestionCard } from "@/components/interview/QuestionCard";
import { QuestionNavigator } from "@/components/interview/QuestionNavigator";
import { SessionErrorState, SessionSkeleton } from "@/components/interview/SessionStates";
import { SubmitConfirmModal } from "@/components/interview/SubmitConfirmModal";
import { useAsync } from "@/hooks/useAsync";
import { useInterviewAnswers } from "@/hooks/useInterviewAnswers";
import { api } from "@/services/api";
import { ANSWER_OPTIONS, type InterviewSession } from "@/types/api";

export function InterviewView() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, error, loading, reload } = useAsync((signal) => api.getInterview(id, signal), id);

  useEffect(() => {
    if (session?.status === "completed") router.replace(`/results/${id}`);
  }, [session?.status, id, router]);

  if (error) return <SessionErrorState error={error} sessionId={id} onRetry={reload} />;
  if (loading || !session || session.status === "completed") return <SessionSkeleton />;
  return <InterviewSessionPanel session={session} />;
}

function InterviewSessionPanel({ session }: { session: InterviewSession }) {
  const router = useRouter();
  const { answers, select, clear } = useInterviewAnswers(session.id);
  const [index, setIndex] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const total = session.questions.length;
  const question = session.questions[index];
  const selected = answers[question.id] ?? null;
  const answeredCount = session.questions.filter((item) => answers[item.id]).length;
  const allAnswered = answeredCount === total;
  const isLast = index === total - 1;
  const firstUnanswered = session.questions.findIndex((item) => !answers[item.id]);

  const goTo = (next: number) => setIndex(Math.min(total - 1, Math.max(0, next)));

  const openConfirm = () => {
    setElapsedMs(Date.now() - Date.parse(session.created_at));
    setSubmitError(null);
    setConfirming(true);
  };

  const submit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await api.submitInterview(
        session.id,
        session.questions.map((item) => ({ question_id: item.id, selected_answer: answers[item.id] })),
      );
      router.push(`/results/${session.id}`);
      clear();
    } catch (cause) {
      setSubmitError(cause instanceof Error ? cause.message : "Submission failed. Please try again.");
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (confirming) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.target instanceof HTMLElement && event.target.closest("input, textarea, select, button")) {
        if (event.key === "Enter") return;
      }
      const key = event.key.toUpperCase();
      const letterIndex = ANSWER_OPTIONS.indexOf(key as (typeof ANSWER_OPTIONS)[number]);
      const digitIndex = ["1", "2", "3", "4"].indexOf(event.key);
      const optionIndex = letterIndex >= 0 ? letterIndex : digitIndex;
      if (optionIndex >= 0 && optionIndex < question.options.length) {
        event.preventDefault();
        select(question.id, ANSWER_OPTIONS[optionIndex]);
      } else if (event.key === "ArrowRight" || (event.key === "Enter" && selected)) {
        event.preventDefault();
        if (isLast && allAnswered && event.key === "Enter") openConfirm();
        else goTo(index + 1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(index - 1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <div className="flex flex-col gap-6">
      <GlassPanel tier="capsule" className="flex flex-col gap-3 rounded-[1.75rem] px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-sm font-semibold text-slate-900">{session.student_name}&apos;s interview</h1>
            {session.selected_subjects.map((code) => (
              <Badge key={code} tone="white">
                {subjectLabel(code)}
              </Badge>
            ))}
            <Badge mono>{session.difficulty}</Badge>
          </div>
          <span className="font-mono text-xs text-slate-500">
            {answeredCount} of {total} answered
          </span>
        </div>
        <ProgressBar value={answeredCount / total} label="Questions answered" />
      </GlassPanel>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <GlassPanel tier="deck" className="flex flex-col gap-6 p-6 md:p-8 lg:col-span-8">
          <div key={question.id} className="animate-fade-up">
            <QuestionCard
              subject={question.subject}
              topic={question.topic}
              difficulty={question.difficulty}
              question={question.question}
              position={index + 1}
              total={total}
              headingId="question-heading"
            >
              <OptionList
                options={question.options}
                label={`Answers for question ${index + 1}`}
                stateFor={(letter) => (letter === selected ? "selected" : "idle")}
                onSelect={(letter) => select(question.id, letter)}
              />
            </QuestionCard>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-slate-200/60 pt-5">
            <Button variant="ghost" icon={ArrowLeft} onClick={() => goTo(index - 1)} disabled={index === 0}>
              Previous
            </Button>
            {isLast ? (
              <Button trailingIcon={Send} onClick={openConfirm} disabled={!allAnswered}>
                Submit interview
              </Button>
            ) : (
              <Button trailingIcon={ArrowRight} onClick={() => goTo(index + 1)}>
                Next question
              </Button>
            )}
          </div>
        </GlassPanel>

        <aside className="flex flex-col gap-4 lg:col-span-4">
          <GlassPanel tier="card" className="flex flex-col gap-5 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-tight text-slate-900">Questions</h2>
              <span className="flex items-center gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="size-2.5 rounded-sm bg-obsidian" aria-hidden /> Answered
                </span>
                <span className="flex items-center gap-1">
                  <span className="size-2.5 rounded-sm border border-slate-300 bg-white" aria-hidden /> Open
                </span>
              </span>
            </div>
            <QuestionNavigator
              total={total}
              currentIndex={index}
              isAnswered={(position) => Boolean(answers[session.questions[position].id])}
              onJump={goTo}
            />
            <div className="flex flex-col gap-2 border-t border-slate-200/60 pt-4">
              <Button fullWidth trailingIcon={Send} onClick={openConfirm} disabled={!allAnswered}>
                Submit interview
              </Button>
              {!allAnswered && (
                <button
                  type="button"
                  onClick={() => goTo(firstUnanswered)}
                  className="text-center text-xs text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline"
                >
                  {total - answeredCount} unanswered. Go to question {firstUnanswered + 1}
                </button>
              )}
            </div>
          </GlassPanel>
          <GlassPanel tier="inset" className="hidden items-start gap-3 p-4 text-xs text-slate-500 md:flex">
            <Keyboard size={15} className="mt-0.5 shrink-0" aria-hidden />
            <span>
              Press <kbd className="font-mono text-slate-700">A</kbd>–<kbd className="font-mono text-slate-700">D</kbd> to
              answer, <kbd className="font-mono text-slate-700">Enter</kbd> for the next question, and the arrow keys to
              move back and forth.
            </span>
          </GlassPanel>
        </aside>
      </div>

      <SubmitConfirmModal
        open={confirming}
        answered={answeredCount}
        total={total}
        elapsedMs={elapsedMs}
        submitting={submitting}
        error={submitError}
        onClose={() => setConfirming(false)}
        onConfirm={submit}
      />
    </div>
  );
}
