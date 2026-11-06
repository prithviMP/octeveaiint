import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { GlassPanel } from "@/components/ui/GlassPanel";

type StatTone = "neutral" | "success" | "danger" | "accent";

const ICON_TONE: Record<StatTone, string> = {
  neutral: "bg-slate-100 text-slate-600",
  success: "bg-emerald-500/10 text-emerald-600",
  danger: "bg-rose-500/10 text-rose-600",
  accent: "bg-indigo-500/10 text-indigo-600",
};

interface StatTileProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: StatTone;
}

export function StatTile({ label, value, icon: Icon, tone = "neutral" }: StatTileProps) {
  return (
    <GlassPanel tier="card" className="flex flex-col gap-3 p-4">
      <span className={cn("inline-flex size-8 items-center justify-center rounded-full", ICON_TONE[tone])}>
        <Icon size={15} strokeWidth={1.75} aria-hidden />
      </span>
      <div className="flex flex-col gap-0.5">
        <span className="text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">{value}</span>
        <span className="text-xs text-slate-500">{label}</span>
      </div>
    </GlassPanel>
  );
}
