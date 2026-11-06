import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { StatusDot, type StatusTone } from "@/components/ui/StatusDot";

export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "accent" | "dark" | "white";

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-slate-100/80 text-slate-600 border-slate-200/70",
  success: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  danger: "bg-rose-500/10 text-rose-700 border-rose-500/20",
  accent: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20",
  dark: "bg-obsidian text-white border-white/15",
  white: "bg-white/90 text-slate-700 border-white shadow-[0_1px_3px_rgb(15_23_42/0.05)]",
};

interface BadgeProps {
  tone?: BadgeTone;
  /** Uppercase mono micro-label style. */
  mono?: boolean;
  dot?: StatusTone;
  onRemove?: () => void;
  removeLabel?: string;
  className?: string;
  children: ReactNode;
}

export function Badge({ tone = "neutral", mono = false, dot, onRemove, removeLabel, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 whitespace-nowrap",
        mono ? "font-mono text-[10px] font-semibold tracking-wider uppercase" : "text-xs font-medium",
        TONE_CLASSES[tone],
        onRemove && "pr-1",
        className,
      )}
    >
      {dot && <StatusDot tone={dot} />}
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel ?? "Remove"}
          className="inline-flex size-4 items-center justify-center rounded-full text-current opacity-60 transition hover:bg-black/5 hover:opacity-100"
        >
          <X size={11} strokeWidth={2} aria-hidden />
        </button>
      )}
    </span>
  );
}
