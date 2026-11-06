"use client";

import { ArrowRight, Check, Layers3 } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StateMessage } from "@/components/ui/StateMessage";
import { SubjectCard, SubjectCardSkeleton } from "@/components/subjects/SubjectCard";
import { useInterviewDraft } from "@/hooks/useInterviewDraft";
import { useSubjects } from "@/hooks/useSubjects";

/** Live subject catalog. Picking subjects here pre-fills step 2 of the setup. */
export function SubjectGrid() {
  const { subjects, loading, error, reload } = useSubjects();
  const { draft, hydrated, update, toggleSubject } = useInterviewDraft();
  const selected = hydrated ? draft.subjects : [];
  const allSelected = subjects.length > 0 && subjects.every((subject) => selected.includes(subject.code));
  const totalQuestions = subjects.reduce((sum, subject) => sum + subject.total_questions, 0);
  const nextHref = draft.name.trim() ? "/subjects" : "/user-details";

  return (
    <section id="subjects" className="flex scroll-mt-28 flex-col gap-6">
      <SectionHeader
        eyebrow="Subjects"
        eyebrowDot="accent"
        title="Pick what you want to practice"
        description="Choose one or more tracks. Questions are spread evenly across everything you select."
        action={
          selected.length > 0 && (
            <Button href={nextHref} trailingIcon={ArrowRight}>
              Practice {selected.length} selected
            </Button>
          )
        }
      />

      {error ? (
        <StateMessage
          title="Couldn't load subjects"
          description={error.message}
          primaryAction={{ label: "Try again", onClick: reload }}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 min-[960px]:grid-cols-5">
          {loading
            ? Array.from({ length: 10 }, (_, index) => <SubjectCardSkeleton key={index} compact />)
            : subjects.map((subject) => (
                <SubjectCard
                  key={subject.code}
                  subject={subject}
                  compact
                  selected={selected.includes(subject.code)}
                  onToggle={() => toggleSubject(subject.code)}
                />
              ))}
          {!loading && subjects.length > 0 && (
            <button
              type="button"
              aria-pressed={allSelected}
              onClick={() => update({ subjects: allSelected ? [] : subjects.map((subject) => subject.code) })}
              className={cn(
                "flex flex-col justify-between gap-3 rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5",
                allSelected
                  ? "border-white/80 bg-white text-slate-900 shadow-capsule ring-1 ring-obsidian/70"
                  : "border-white/15 bg-obsidian text-white shadow-capsule",
              )}
            >
              <span className="flex items-center justify-between">
                <Layers3 size={18} strokeWidth={1.75} aria-hidden />
                {allSelected && <Check size={16} strokeWidth={2.5} aria-hidden />}
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-sm font-semibold tracking-tight">All subjects</span>
                <span className={cn("text-xs", allSelected ? "text-slate-500" : "text-white/60")}>
                  {totalQuestions} questions, mixed
                </span>
              </span>
            </button>
          )}
        </div>
      )}
    </section>
  );
}
