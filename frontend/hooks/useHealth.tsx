"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "@/services/api";

export type HealthStatus = "checking" | "waking" | "ready" | "offline";

const SLOW_RESPONSE_MS = 2500;
const REQUEST_TIMEOUT_MS = 25_000;
const RETRY_MS = 4000;
const OFFLINE_RETRY_MS = 15_000;
const ATTEMPTS_BEFORE_OFFLINE = 5;

interface HealthState {
  status: HealthStatus;
  /** Whether the backend has a Gemini key configured. `null` until the first successful health check. */
  aiEnabled: boolean | null;
}

const HealthContext = createContext<HealthState>({ status: "checking", aiEnabled: null });

/**
 * Polls the backend health endpoint until it responds. Render's free tier sleeps when idle,
 * so the first request can take 10-20 seconds.
 */
export function HealthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<HealthState>({ status: "checking", aiEnabled: null });

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const check = async () => {
      const slowTimer = setTimeout(() => {
        if (!cancelled)
          setState((current) => (current.status === "checking" ? { ...current, status: "waking" } : current));
      }, SLOW_RESPONSE_MS);
      try {
        const health = await api.health(AbortSignal.timeout(REQUEST_TIMEOUT_MS));
        if (cancelled) return;
        if (health.status === "ok") {
          setState({ status: "ready", aiEnabled: health.ai === "enabled" });
          return;
        }
        throw new Error("degraded");
      } catch {
        if (cancelled) return;
        attempts += 1;
        const offline = attempts >= ATTEMPTS_BEFORE_OFFLINE;
        setState((current) => ({ ...current, status: offline ? "offline" : "waking" }));
        retryTimer = setTimeout(check, offline ? OFFLINE_RETRY_MS : RETRY_MS);
      } finally {
        clearTimeout(slowTimer);
      }
    };

    check();
    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
    };
  }, []);

  return <HealthContext value={state}>{children}</HealthContext>;
}

export function useHealth(): HealthStatus {
  return useContext(HealthContext).status;
}

export function useAIEnabled(): boolean | null {
  return useContext(HealthContext).aiEnabled;
}
