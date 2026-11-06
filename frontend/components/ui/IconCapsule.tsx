import type { LucideIcon } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type IconCapsuleTone = "light" | "dark" | "muted";

const TONE_CLASSES: Record<IconCapsuleTone, string> = {
  light: "bg-white/85 border border-white text-slate-700 shadow-card",
  dark: "bg-obsidian text-white shadow-pill",
  muted: "bg-slate-100/80 border border-white/80 text-slate-600",
};

const SIZE_CLASSES = { sm: "size-8", md: "size-10" } as const;

interface IconCapsuleProps {
  icon: LucideIcon;
  tone?: IconCapsuleTone;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}

/** Decorative round icon holder. */
export function IconCapsule({ icon: Icon, tone = "light", size = "md", className }: IconCapsuleProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full",
        TONE_CLASSES[tone],
        SIZE_CLASSES[size],
        className,
      )}
    >
      <Icon size={size === "sm" ? 15 : 18} strokeWidth={1.75} />
    </span>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label: string;
  tone?: IconCapsuleTone;
  size?: keyof typeof SIZE_CLASSES;
}

/** Round icon-only button with an accessible label. */
export function IconButton({ icon: Icon, label, tone = "light", size = "md", className, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100",
        TONE_CLASSES[tone],
        SIZE_CLASSES[size],
        className,
      )}
      {...rest}
    >
      <Icon size={size === "sm" ? 15 : 18} strokeWidth={1.75} aria-hidden />
    </button>
  );
}
