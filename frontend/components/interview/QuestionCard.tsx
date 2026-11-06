import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { subjectLabel } from "@/lib/subjects";
import { Badge } from "@/components/ui/Badge";
import { DifficultyBadge } from "@/components/ui/DifficultyChips";
import type { Difficulty } from "@/types/api";

interface QuestionCardProps {
  subject: string;
  topic: string;
  difficulty: Difficulty;
  question: string;
  position?: number;
  total?: number;
  /** Extra badge or status shown at the top right. */
  aside?: ReactNode;
  headingId?: string;
  className?: string;
  /** Answer options and any footer content. */
  children: ReactNode;
}

/** A question with its subject, topic, and difficulty. Shared by the interview, the review, and the landing preview. */
export function QuestionCard({
  subject,
  topic,
  difficulty,
  question,
  position,
  total,
  aside,
  headingId,
  className,
  children,
}: QuestionCardProps) {
  return (
    <article className={cn("flex flex-col gap-5", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone="dark">{subjectLabel(subject)}</Badge>
          <Badge tone="white">{topic}</Badge>
          <DifficultyBadge difficulty={difficulty} />
        </div>
        {aside ??
          (position !== undefined && total !== undefined && (
            <span className="font-mono text-xs text-slate-400">
              Question {position} of {total}
            </span>
          ))}
      </div>
      <h2 id={headingId} className="text-lg leading-snug font-semibold tracking-[-0.015em] text-slate-900 md:text-xl">
        {question}
      </h2>
      {children}
    </article>
  );
}
