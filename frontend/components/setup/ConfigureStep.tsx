"use client";

import {
  Clock,
  Gauge,
  Library,
  ListChecks,
  Lock,
  Rocket,
  SlidersHorizontal,
  Sparkles,
  Timer,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { IconCapsule } from "@/components/ui/IconCapsule";
import { RangeStepper } from "@/components/ui/RangeStepper";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Skeleton } from "@/components/ui/Skeleton";
import { WizardActionBar } from "@/components/layout/WizardActionBar";
import { WizardStepper } from "@/components/layout/WizardStepper";
import { useAIEnabled } from "@/hooks/useHealth";
import { useDraftGuard, useInterviewDraft } from "@/hooks/useInterviewDraft";
import { useSubjects } from "@/hooks/useSubjects";
import { subjectLabel } from "@/lib/subjects";
import { api } from "@/services/api";
import { DIFFICULTIES, type DifficultyFilter } from "@/types/api";

const MAX_QUESTIONS = 50;

function ConfigCard({
  icon,
  title,
  description,
  aside,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  aside?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <GlassPanel tier="card" as="section" className="flex flex-col gap-5 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <IconCapsule icon={icon} tone="muted" size="sm" />
          <div className="flex flex-col gap-0.5">
            <h2 className="text-sm font-semibold tracking-tight text-slate-900">{title}</h2>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
        </div>
        {aside}
      </div>
      {children}
    </GlassPanel>
  );
}

export function ConfigureStep() {
  const router = useRouter();
  const { ready } = useDraftGuard(["name", "subjects"]);
  const { draft, update, toggleSubject } = useInterviewDraft();
  const { subjects, loading } = useSubjects();
  const aiEnabled = useAIEnabled() === true;
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chosen = subjects.filter((subject) => draft.subjects.includes(subject.code));
  const countFor = (difficulty: DifficultyFilter) =>
    chosen.reduce(
      (sum, subject) =>
        sum + (difficulty === "Mixed" ? subject.total_questions : (subject.difficulty_counts[difficulty] ?? 0)),
      0,
    );
  const available = countFor(draft.difficulty);
  const maxQuestions = aiEnabled ? MAX_QUESTIONS : Math.max(1, Math.min(MAX_QUESTIONS, available));
  const numQuestions = Math.min(draft.numQuestions, maxQuestions);
  const presets = [5, 10, 20]
    .filter((value) => value < maxQuestions)
    .map((value) => ({ label: `${value} Qs`, value }))
    .concat({ label: `All (${maxQuestions})`, value: maxQuestions });

  const startInterview = async () => {
    setStarting(true);
    setError(null);
    try {
      const session = await api.createInterview({
        student_name: draft.name.trim(),
        subjects: draft.subjects,
        num_questions: numQuestions,
        difficulty: draft.difficulty,
      });
      router.push(`/interview/${session.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Couldn't start the interview.");
      setStarting(false);
    }
  };

  if (!ready) {
    return (
      <div className="flex flex-col gap-8">
        <WizardStepper current={3} />
        <Skeleton className="h-16 rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <WizardStepper current={3} />
      <h1 className="sr-only">Configure your interview</h1>

      <GlassPanel tier="capsule" className="flex flex-col gap-3 rounded-[1.75rem] px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-sm">
          <User size={16} className="text-slate-500" aria-hidden />
          <span className="font-semibold text-slate-900">{draft.name}</span>
          <Link href="/user-details" className="text-xs text-slate-500 underline-offset-2 hover:underline">
            Edit
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {draft.subjects.map((code) => (
            <Badge
              key={code}
              tone="white"
              onRemove={draft.subjects.length > 1 ? () => toggleSubject(code) : undefined}
              removeLabel={`Remove ${subjectLabel(code)}`}
            >
              {subjectLabel(code)}
            </Badge>
          ))}
          <Link href="/subjects" className="ml-1 font-mono text-xs text-slate-500 hover:text-slate-800">
            {draft.subjects.length} selected · edit
          </Link>
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="flex flex-col gap-5 lg:col-span-7">
          <ConfigCard
            icon={ListChecks}
            title="Question count"
            description="How many questions to include in this session."
            aside={<span className="font-mono text-sm whitespace-nowrap text-slate-700">{numQuestions} Qs</span>}
          >
            {loading ? (
              <Skeleton className="h-24" />
            ) : (
              <>
                <RangeStepper
                  label="Question count"
                  value={numQuestions}
                  min={1}
                  max={maxQuestions}
                  onChange={(value) => update({ numQuestions: value })}
                  presets={presets}
                />
                <p className="text-xs text-slate-500">
                  {aiEnabled ? (
                    <>
                      Gemini writes fresh questions for every session, up to {MAX_QUESTIONS}. {available} curated
                      questions are the fallback.
                    </>
                  ) : (
                    <>
                      {available} questions match your subjects and difficulty
                      {available > MAX_QUESTIONS && `, up to ${MAX_QUESTIONS} per session`}.
                    </>
                  )}
                </p>
              </>
            )}
          </ConfigCard>

          <ConfigCard
            icon={SlidersHorizontal}
            title="Difficulty"
            description="Mixed draws from every level. Pick one to focus."
          >
            <SegmentedControl<DifficultyFilter>
              label="Difficulty"
              value={draft.difficulty}
              onChange={(difficulty) => update({ difficulty })}
              options={(["Mixed", ...DIFFICULTIES] as DifficultyFilter[]).map((level) => ({
                value: level,
                label: level,
                hint: aiEnabled ? undefined : loading ? "…" : `${countFor(level)} Qs`,
                disabled: !aiEnabled && !loading && countFor(level) === 0,
              }))}
            />
          </ConfigCard>
        </div>

        <div className="flex flex-col gap-5 lg:col-span-5">
          {aiEnabled ? (
            <ConfigCard
              icon={Sparkles}
              title="Generated by Gemini"
              description="Fresh questions written for this session. If Gemini is unavailable, they come from the curated bank instead."
              aside={
                <Badge tone="accent" mono>
                  AI
                </Badge>
              }
            />
          ) : (
            <ConfigCard
              icon={Library}
              title="Curated question bank"
              description="AI generation is off on this server, so questions come from the curated bank."
            />
          )}
          <ConfigCard
            icon={Gauge}
            title="Multiple choice"
            description="Four options per question with exactly one correct answer."
            aside={
              <Badge tone="white">
                <Lock size={11} aria-hidden /> Fixed
              </Badge>
            }
          />
          <ConfigCard
            icon={Timer}
            title="Self-paced"
            description="There's no timer. Move between questions freely and change answers until you submit."
          />
          <GlassPanel tier="inset" className="flex items-center justify-between gap-3 p-5">
            <span className="flex items-center gap-2 text-sm text-slate-600">
              <Clock size={15} aria-hidden />
              Estimated time
            </span>
            <span className="font-mono text-sm font-semibold text-slate-900">
              ~{Math.max(1, Math.round(numQuestions * 1.5))} min
            </span>
          </GlassPanel>
        </div>
      </div>

      <WizardActionBar
        summary={
          error ? (
            <span role="alert" className="text-rose-600">
              {error}
            </span>
          ) : starting && aiEnabled ? (
            <span role="status">Gemini is writing your questions. This can take 10 to 20 seconds.</span>
          ) : (
            <span>
              <span className="font-medium text-slate-900">{numQuestions} questions</span> · {draft.difficulty} ·{" "}
              {draft.subjects.map(subjectLabel).join(", ")}
            </span>
          )
        }
        back={{ href: "/subjects", label: "Back" }}
        next={{
          label: starting && aiEnabled ? "Generating questions…" : "Start interview",
          icon: aiEnabled ? Sparkles : Rocket,
          loading: starting,
          disabled: loading || (!aiEnabled && available === 0),
          onClick: startInterview,
        }}
      />
    </div>
  );
}
