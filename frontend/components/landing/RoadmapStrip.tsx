import { Rocket } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { IconCapsule } from "@/components/ui/IconCapsule";

export function RoadmapStrip() {
  return (
    <GlassPanel tier="card" className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
      <IconCapsule icon={Rocket} tone="dark" />
      <div className="flex flex-col gap-1">
        <Badge tone="dark" mono className="w-fit">
          Coming next
        </Badge>
        <p className="text-sm text-slate-700">
          A coding challenge module and voice mock interviews are on the roadmap.
        </p>
      </div>
    </GlassPanel>
  );
}
