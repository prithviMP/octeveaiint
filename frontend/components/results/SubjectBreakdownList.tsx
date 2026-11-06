import { formatPercent } from "@/lib/format";
import { getSubjectMeta } from "@/lib/subjects";
import { IconCapsule } from "@/components/ui/IconCapsule";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { SubjectBreakdown } from "@/types/api";

export function SubjectBreakdownList({ items }: { items: SubjectBreakdown[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {items.map((item) => {
        const meta = getSubjectMeta(item.subject);
        return (
          <li key={item.subject} className="flex items-center gap-3">
            <IconCapsule icon={meta.icon} tone="muted" size="sm" />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="font-medium text-slate-800">{meta.label}</span>
                <span className="font-mono text-xs text-slate-500">
                  {item.correct}/{item.total} · {formatPercent(item.percentage)}
                </span>
              </div>
              <ProgressBar value={item.total ? item.correct / item.total : 0} label={`${meta.label} score`} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
