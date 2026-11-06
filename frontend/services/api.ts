import type {
  AnswerIn,
  Health,
  InterviewCreate,
  InterviewEvaluation,
  InterviewResult,
  InterviewReview,
  InterviewSession,
  SubjectList,
} from "@/types/api";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isNetworkError() {
    return this.status === 0;
  }
}

interface RequestOptions {
  method?: "GET" | "POST";
  body?: unknown;
  signal?: AbortSignal;
}

function extractDetail(payload: unknown): string | null {
  if (!payload || typeof payload !== "object" || !("detail" in payload)) return null;
  const { detail } = payload as { detail: unknown };
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => (item && typeof item === "object" && "msg" in item ? String(item.msg) : null))
      .filter(Boolean);
    if (messages.length) return messages.join(". ");
  }
  return null;
}

async function request<T>(path: string, { method = "GET", body, signal }: RequestOptions = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api${path}`, {
      method,
      signal,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError("Could not reach the server. It may be waking up, so try again in a few seconds.", 0);
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(extractDetail(payload) ?? `Request failed with status ${response.status}`, response.status);
  }
  return payload as T;
}

export const api = {
  health: (signal?: AbortSignal) => request<Health>("/health", { signal }),
  subjects: (signal?: AbortSignal) => request<SubjectList>("/subjects", { signal }),
  createInterview: (payload: InterviewCreate) =>
    request<InterviewSession>("/interviews", { method: "POST", body: payload }),
  getInterview: (id: string, signal?: AbortSignal) =>
    request<InterviewSession>(`/interviews/${encodeURIComponent(id)}`, { signal }),
  submitInterview: (id: string, answers: AnswerIn[]) =>
    request<InterviewResult>(`/interviews/${encodeURIComponent(id)}/submit`, {
      method: "POST",
      body: { answers },
    }),
  getResults: (id: string, signal?: AbortSignal) =>
    request<InterviewResult>(`/interviews/${encodeURIComponent(id)}/results`, { signal }),
  getReview: (id: string, signal?: AbortSignal) =>
    request<InterviewReview>(`/interviews/${encodeURIComponent(id)}/review`, { signal }),
  getEvaluation: (id: string, signal?: AbortSignal) =>
    request<InterviewEvaluation>(`/interviews/${encodeURIComponent(id)}/evaluation`, { signal }),
};
