import Link from "next/link";
import { LoaderCircle, type LucideIcon } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "ghost" | "text";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-obsidian text-white shadow-pill hover:bg-obsidian-soft hover:scale-[1.02] active:scale-[0.99] disabled:bg-slate-400 disabled:shadow-none",
  ghost:
    "glass-capsule text-slate-800 hover:bg-white/95 hover:shadow-capsule disabled:text-slate-400",
  text: "text-slate-600 hover:text-slate-900 hover:bg-white/50 disabled:text-slate-400",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 px-3.5 text-xs",
  md: "h-10 gap-2 px-5 text-sm",
  lg: "h-12 gap-2 px-6 text-sm",
};

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  trailingIcon?: LucideIcon;
  loading?: boolean;
  fullWidth?: boolean;
  href?: string;
  children?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  trailingIcon: TrailingIcon,
  loading = false,
  fullWidth = false,
  href,
  disabled,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  const classes = cn(
    "inline-flex shrink-0 items-center justify-center rounded-full font-medium whitespace-nowrap transition-all duration-200 disabled:cursor-not-allowed disabled:hover:scale-100",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    fullWidth && "w-full",
    className,
  );
  const iconSize = size === "sm" ? 14 : 16;
  const content = (
    <>
      {loading ? (
        <LoaderCircle size={iconSize} className="animate-spin" aria-hidden />
      ) : (
        Icon && <Icon size={iconSize} strokeWidth={1.75} aria-hidden />
      )}
      {children}
      {TrailingIcon && <TrailingIcon size={iconSize} strokeWidth={1.75} aria-hidden />}
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled || loading} aria-busy={loading || undefined} className={classes} {...rest}>
      {content}
    </button>
  );
}
