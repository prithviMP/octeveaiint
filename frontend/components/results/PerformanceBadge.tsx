import { Badge } from "@/components/ui/Badge";
import { percentTone } from "@/lib/format";

export function PerformanceBadge({ level, percentage }: { level: string; percentage: number }) {
  const tone = percentTone(percentage);
  return (
    <Badge tone={tone} mono dot={tone}>
      {level}
    </Badge>
  );
}
