"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "@/services/api";

export type HealthStatus = "checking" | "waking" | "ready" | "offline";

const SLOW_RESPONSE_MS = 2500;
const REQUEST_TIMEOUT_MS = 25_000;
const RETRY_MS = 4000;
const OFFLINE_RETRY_MS = 15_000;
const ATTEMPTS_BEFORE_OFFLINE = 5;

const HealthContext = createContext<HealthStatus>("checking");

/**
 * Polls the backend health endpoint until it responds. Render's free tier sleeps when idle,
 * so the first request can take 10-20 seconds.
 */
export function HealthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<HealthStatus>("checking");

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const check = async () => {
      const slowTimer = setTimeout(() => {
        if (!cancelled) setStatus((current) => (current === "checking" ? "waking" : current));
      }, SLOW_RESPONSE_MS);
      try {
        const health = await api.health(AbortSignal.timeout(REQUEST_TIMEOUT_MS));
        if (cancelled) return;
        if (health.status === "ok") {
          setStatus("ready");
          return;
        }
        throw new Error("degraded");
      } catch {
        if (cancelled) return;
        attempts += 1;
        const offline = attempts >= ATTEMPTS_BEFORE_OFFLINE;
        setStatus(offline ? "offline" : "waking");
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

  return <HealthContext value={status}>{children}</HealthContext>;
}

export function useHealth(): HealthStatus {
  return useContext(HealthContext);
}
