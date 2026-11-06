import { cn } from "@/lib/cn";

interface ProgressBarProps {
  /** 0 to 1. */
  value: number;
  label: string;
  className?: string;
}

export function ProgressBar({ value, label, className }: ProgressBarProps) {
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className={cn("glass-inset h-2 overflow-hidden rounded-full", className)}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-obsidian to-accent transition-[width] duration-500 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
