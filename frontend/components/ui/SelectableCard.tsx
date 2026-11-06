"use client";

import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SelectableCardProps {
  selected: boolean;
  onToggle: () => void;
  className?: string;
  children: ReactNode;
}

/** A glass card that toggles on click and shows a check badge when selected. */
export function SelectableCard({ selected, onToggle, className, children }: SelectableCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(
        "group relative flex w-full flex-col rounded-2xl border p-5 text-left transition-all duration-200",
        selected
          ? "border-obsidian/80 bg-white shadow-capsule ring-1 ring-obsidian/70"
          : "glass-card hover:-translate-y-0.5 hover:bg-white/95 hover:shadow-capsule",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-4 right-4 inline-flex size-5 items-center justify-center rounded-md border-[1.5px] transition-all",
          selected ? "border-obsidian bg-obsidian text-white" : "border-slate-300 bg-white/70 text-transparent",
        )}
      >
        <Check size={12} strokeWidth={3} />
      </span>
      {children}
    </button>
  );
}
