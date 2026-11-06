"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
  hint?: ReactNode;
  disabled?: boolean;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  /** "light" raises the active item as a white capsule, "dark" as an obsidian pill. */
  activeStyle?: "light" | "dark";
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  activeStyle = "light",
  className,
}: SegmentedControlProps<T>) {
  const hasHints = options.some((option) => option.hint !== undefined);

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "glass-inset grid gap-1 p-1",
        hasHints ? "rounded-2xl" : "rounded-full",
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 px-3 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40",
              hasHints ? "rounded-xl py-2.5" : "rounded-full py-1.5",
              active
                ? activeStyle === "dark"
                  ? "bg-obsidian text-white shadow-pill"
                  : "bg-white text-slate-900 shadow-[0_4px_12px_rgb(0_0_0/0.06)]"
                : "text-slate-600 hover:bg-white/60 hover:text-slate-900",
            )}
          >
            <span>{option.label}</span>
            {option.hint !== undefined && (
              <span
                className={cn(
                  "font-mono text-[11px] font-normal",
                  active && activeStyle === "dark" ? "text-white/70" : "text-slate-400",
                )}
              >
                {option.hint}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
