"use client";

import { useRouter } from "next/navigation";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { StateMessage } from "@/components/ui/StateMessage";
import { WizardActionBar } from "@/components/layout/WizardActionBar";
import { WizardStepper } from "@/components/layout/WizardStepper";
import { SubjectCardSkeleton } from "@/components/subjects/SubjectCard";
import { SubjectCategorySection } from "@/components/subjects/SubjectCategorySection";
import { useDraftGuard, useInterviewDraft } from "@/hooks/useInterviewDraft";
import { useSubjects } from "@/hooks/useSubjects";
import { subjectLabel } from "@/lib/subjects";

export function SubjectsStep() {
  const router = useRouter();
  const { ready } = useDraftGuard(["name"]);
  const { draft, update, toggleSubject } = useInterviewDraft();
  const { data, subjects, loading, error, reload } = useSubjects();

  const selected = ready ? draft.subjects.filter((code) => subjects.some((subject) => subject.code === code)) : [];
  const poolSize = subjects
    .filter((subject) => selected.includes(subject.code))
    .reduce((sum, subject) => sum + subject.total_questions, 0);
  const allSelected = subjects.length > 0 && selected.length === subjects.length;

  return (
    <div className="flex flex-col gap-8">
      <WizardStepper current={2} />
      <GlassPanel tier="deck" className="flex flex-col gap-10 p-6 md:p-10">
        <SectionHeader
          as="h1"
          size="lg"
          eyebrow="Curriculum"
          eyebrowDot="accent"
          title="Choose your subjects"
          description="Select one or more tracks. Your interview draws questions evenly from each one."
          action={
            subjects.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => update({ subjects: allSelected ? [] : subjects.map((subject) => subject.code) })}
              >
                {allSelected ? "Clear selection" : "Select all"}
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
        ) : loading || !data ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-4 w-48" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <SubjectCardSkeleton key={index} />
              ))}
            </div>
          </div>
        ) : (
          data.categories.map((category) => (
            <SubjectCategorySection
              key={category.category}
              category={category}
              selected={selected}
              onToggle={toggleSubject}
            />
          ))
        )}
      </GlassPanel>

      <WizardActionBar
        summary={
          selected.length ? (
            <span>
              <span className="font-medium text-slate-900">
                {selected.length} {selected.length === 1 ? "subject" : "subjects"} selected
              </span>{" "}
              ({selected.map(subjectLabel).join(", ")}) · {poolSize} questions available
            </span>
          ) : (
            "Select at least one subject to continue."
          )
        }
        back={{ href: "/user-details", label: "Back" }}
        next={{
          label: selected.length ? `Continue to configure (${selected.length})` : "Continue to configure",
          disabled: selected.length === 0,
          onClick: () => {
            update({ subjects: selected });
            router.push("/configure");
          },
        }}
      />
    </div>
  );
}
