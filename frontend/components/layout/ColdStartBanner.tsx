"use client";

import { CloudCog, WifiOff } from "lucide-react";
import { StatusDot } from "@/components/ui/StatusDot";
import { useHealth } from "@/hooks/useHealth";

/** Explains the delay while the free-tier backend wakes up. Hidden once the backend responds. */
export function ColdStartBanner() {
  const status = useHealth();
  if (status !== "waking" && status !== "offline") return null;

  const offline = status === "offline";
  const Icon = offline ? WifiOff : CloudCog;

  return (
    <div className="animate-fade-up px-4 pt-3">
      <div
        role="status"
        className="glass-capsule mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full px-4 py-1.5 text-xs text-slate-600"
      >
        <div className="flex min-w-0 items-center gap-2">
          <Icon size={14} className="shrink-0 text-slate-800" aria-hidden />
          <span className="truncate font-mono">
            {offline
              ? "Can't reach the server right now. Retrying automatically."
              : "The server is waking up from sleep. The first request can take 10 to 20 seconds."}
          </span>
        </div>
        <StatusDot tone={offline ? "danger" : "warning"} pulse />
      </div>
    </div>
  );
}
