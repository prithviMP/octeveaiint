"use client";

import { useAsync } from "@/hooks/useAsync";
import { api } from "@/services/api";
import type { Subject, SubjectList } from "@/types/api";

let cached: Promise<SubjectList> | null = null;

function loadSubjects() {
  cached ??= api.subjects().catch((error) => {
    cached = null;
    throw error;
  });
  return cached;
}

/** The subject catalog, fetched once per page load and shared by every consumer. */
export function useSubjects() {
  const state = useAsync(loadSubjects, "subjects");
  const subjects: Subject[] = state.data?.categories.flatMap((category) => category.subjects) ?? [];
  return { ...state, subjects };
}
