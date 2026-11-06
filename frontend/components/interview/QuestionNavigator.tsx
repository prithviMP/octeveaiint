"use client";

import { cn } from "@/lib/cn";

interface QuestionNavigatorProps {
  total: number;
  currentIndex: number;
  isAnswered: (index: number) => boolean;
  onJump: (index: number) => void;
}

/** Numbered grid for jumping between questions; filled dots are answered. */
export function QuestionNavigator({ total, currentIndex, isAnswered, onJump }: QuestionNavigatorProps) {
  return (
    <nav aria-label="Questions" className="grid grid-cols-5 gap-2 sm:grid-cols-10 lg:grid-cols-5">
      {Array.from({ length: total }, (_, index) => {
        const answered = isAnswered(index);
        const current = index === currentIndex;
        return (
          <button
            key={index}
            type="button"
            onClick={() => onJump(index)}
            aria-current={current ? "step" : undefined}
            aria-label={`Question ${index + 1}${answered ? ", answered" : ", not answered"}`}
            className={cn(
              "inline-flex aspect-square items-center justify-center rounded-xl border font-mono text-xs font-semibold transition-all",
              current && "ring-2 ring-accent/60 ring-offset-2 ring-offset-white/60",
              answered
                ? "border-obsidian bg-obsidian text-white"
                : "border-white/90 bg-white/60 text-slate-500 hover:bg-white hover:text-slate-900",
            )}
          >
            {index + 1}
          </button>
        );
      })}
    </nav>
  );
}
