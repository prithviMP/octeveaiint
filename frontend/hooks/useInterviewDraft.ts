"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPersistentStore, useHydrated } from "@/lib/persistentStore";
import type { DifficultyFilter } from "@/types/api";

export const NAME_MAX_LENGTH = 100;
export const DEFAULT_QUESTION_COUNT = 10;

export interface InterviewDraft {
  name: string;
  subjects: string[];
  numQuestions: number;
  difficulty: DifficultyFilter;
}

const DEFAULT_DRAFT: InterviewDraft = {
  name: "",
  subjects: [],
  numQuestions: DEFAULT_QUESTION_COUNT,
  difficulty: "Mixed",
};

const draftStore = createPersistentStore<InterviewDraft>("aic:draft", DEFAULT_DRAFT);

export function validateName(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Please enter your name to continue.";
  if (trimmed.length > NAME_MAX_LENGTH) return `Keep it under ${NAME_MAX_LENGTH} characters.`;
  return null;
}

export function useInterviewDraft() {
  const draft = draftStore.useValue();
  const hydrated = useHydrated();

  return {
    draft,
    hydrated,
    update: (patch: Partial<InterviewDraft>) => draftStore.set((previous) => ({ ...previous, ...patch })),
    toggleSubject: (code: string) =>
      draftStore.set((previous) => ({
        ...previous,
        subjects: previous.subjects.includes(code)
          ? previous.subjects.filter((item) => item !== code)
          : [...previous.subjects, code],
      })),
  };
}

type DraftRequirement = "name" | "subjects";

/** Sends the user back to the earliest setup step whose data is missing. */
export function useDraftGuard(requires: DraftRequirement[]) {
  const { draft, hydrated } = useInterviewDraft();
  const router = useRouter();
  const missingName = requires.includes("name") && !draft.name.trim();
  const missingSubjects = requires.includes("subjects") && draft.subjects.length === 0;

  useEffect(() => {
    if (!hydrated) return;
    if (missingName) router.replace("/user-details");
    else if (missingSubjects) router.replace("/subjects");
  }, [hydrated, missingName, missingSubjects, router]);

  return { ready: hydrated && !missingName && !missingSubjects };
}
