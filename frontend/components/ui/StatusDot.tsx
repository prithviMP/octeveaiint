import { cn } from "@/lib/cn";

export type StatusTone = "success" | "warning" | "danger" | "neutral" | "accent";

const TONE_CLASSES: Record<StatusTone, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
  neutral: "bg-slate-400",
  accent: "bg-accent",
};

export function StatusDot({ tone = "success", pulse = false }: { tone?: StatusTone; pulse?: boolean }) {
  return (
    <span aria-hidden className="relative inline-flex size-2 shrink-0">
      {pulse && <span className={cn("absolute inset-0 animate-ping rounded-full opacity-60", TONE_CLASSES[tone])} />}
      <span className={cn("relative inline-flex size-2 rounded-full", TONE_CLASSES[tone])} />
    </span>
  );
}
