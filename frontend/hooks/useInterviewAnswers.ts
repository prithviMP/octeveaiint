"use client";

import { createPersistentStore, type PersistentStore } from "@/lib/persistentStore";
import type { AnswerOption } from "@/types/api";

type AnswerMap = Record<string, AnswerOption>;

const stores = new Map<string, PersistentStore<AnswerMap>>();

function storeFor(sessionId: string) {
  let store = stores.get(sessionId);
  if (!store) {
    store = createPersistentStore<AnswerMap>(`aic:answers:${sessionId}`, {});
    stores.set(sessionId, store);
  }
  return store;
}

/** Answers for one interview session, persisted so a refresh keeps progress. */
export function useInterviewAnswers(sessionId: string) {
  const store = storeFor(sessionId);
  const answers = store.useValue();

  return {
    answers,
    select: (questionId: number, option: AnswerOption) =>
      store.set((previous) => ({ ...previous, [questionId]: option })),
    clear: () => store.clear(),
  };
}
