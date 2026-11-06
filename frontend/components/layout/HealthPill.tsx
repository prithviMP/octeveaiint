"use client";

import { Badge } from "@/components/ui/Badge";
import type { StatusTone } from "@/components/ui/StatusDot";
import { useHealth, type HealthStatus } from "@/hooks/useHealth";

const HEALTH_DISPLAY: Record<HealthStatus, { label: string; tone: StatusTone }> = {
  checking: { label: "Connecting", tone: "neutral" },
  waking: { label: "Waking up", tone: "warning" },
  ready: { label: "System ready", tone: "success" },
  offline: { label: "Offline", tone: "danger" },
};

export function HealthPill({ className }: { className?: string }) {
  const { label, tone } = HEALTH_DISPLAY[useHealth()];
  return (
    <span role="status" aria-live="polite" className={className}>
      <Badge tone="white" mono dot={tone}>
        {label}
      </Badge>
    </span>
  );
}
