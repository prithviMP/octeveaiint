"use client";

import { cn } from "@/lib/cn";
import { getSubjectMeta } from "@/lib/subjects";
import { DifficultyChips } from "@/components/ui/DifficultyChips";
import { IconCapsule } from "@/components/ui/IconCapsule";
import { SelectableCard } from "@/components/ui/SelectableCard";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Subject } from "@/types/api";

interface SubjectCardProps {
  subject: Subject;
  selected: boolean;
  onToggle: () => void;
  /** Compact cards drop the difficulty breakdown and use the short label. */
  compact?: boolean;
}

export function SubjectCard({ subject, selected, onToggle, compact = false }: SubjectCardProps) {
  const meta = getSubjectMeta(subject.code);

  return (
    <SelectableCard selected={selected} onToggle={onToggle} className={cn(compact ? "gap-3 p-4" : "gap-4")}>
      <div className="flex items-center gap-2 pr-7">
        <IconCapsule icon={meta.icon} tone={selected ? "dark" : "muted"} size="sm" />
        <span className="font-mono text-[11px] text-slate-400">{subject.total_questions} Qs</span>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold tracking-tight text-slate-900">{compact ? meta.label : subject.name}</h3>
        <p className={cn("text-xs leading-relaxed text-slate-500", compact && "line-clamp-1")}>{meta.tagline}</p>
      </div>
      {!compact && <DifficultyChips counts={subject.difficulty_counts} />}
    </SelectableCard>
  );
}

export function SubjectCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("glass-card flex flex-col gap-3 rounded-2xl", compact ? "p-4" : "p-5")}>
      <Skeleton className="size-8 rounded-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-full" />
      {!compact && <Skeleton className="h-5 w-3/4 rounded-full" />}
    </div>
  );
}
