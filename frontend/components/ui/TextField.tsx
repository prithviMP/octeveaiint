"use client";

import { CircleAlert, Info, X, type LucideIcon } from "lucide-react";
import { useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "onChange" | "value"> {
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  hint?: string;
  error?: string | null;
  icon?: LucideIcon;
  showCounter?: boolean;
  clearable?: boolean;
  size?: "md" | "lg";
}

/** Pill input with optional label, leading icon, clear button, character counter, and inline error. */
export function TextField({
  value,
  onValueChange,
  label,
  hint,
  error,
  icon: Icon,
  showCounter = false,
  clearable = false,
  size = "lg",
  maxLength,
  className,
  id,
  ...rest
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  const message = error ?? hint;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {(label || showCounter) && (
        <div className="flex items-center justify-between px-1">
          {label && (
            <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
              {label}
            </label>
          )}
          {showCounter && maxLength && (
            <span className="font-mono text-xs text-slate-400 tabular-nums">
              {value.length} / {maxLength}
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "group flex items-center gap-3 rounded-full border bg-white/60 px-4 transition-all focus-within:bg-white/95 focus-within:ring-4",
          size === "lg" ? "h-12" : "h-10",
          error
            ? "border-rose-300 focus-within:ring-rose-500/15"
            : "border-white/90 shadow-[inset_0_1px_3px_rgb(15_23_42/0.05)] focus-within:border-indigo-400/50 focus-within:ring-indigo-500/15",
        )}
      >
        {Icon && <Icon size={16} strokeWidth={1.75} className="shrink-0 text-slate-400" aria-hidden />}
        <input
          id={inputId}
          value={value}
          maxLength={maxLength}
          onChange={(event) => onValueChange(event.target.value)}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={message ? messageId : undefined}
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          {...rest}
        />
        {clearable && value && (
          <button
            type="button"
            onClick={() => onValueChange("")}
            aria-label="Clear"
            className="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={14} aria-hidden />
          </button>
        )}
      </div>
      {message && (
        <p
          id={messageId}
          className={cn("flex items-center gap-1.5 px-1 text-xs", error ? "text-rose-600" : "text-slate-500")}
        >
          {error ? <CircleAlert size={13} aria-hidden /> : <Info size={13} aria-hidden />}
          {message}
        </p>
      )}
    </div>
  );
}
