import { GlassPanel } from "@/components/ui/GlassPanel";
import { CtaStrip } from "@/components/landing/CtaStrip";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { RoadmapStrip } from "@/components/landing/RoadmapStrip";
import { SubjectGrid } from "@/components/landing/SubjectGrid";

export default function Home() {
  return (
    <GlassPanel tier="deck" className="flex flex-col gap-16 p-6 md:p-10">
      <Hero />
      <SubjectGrid />
      <HowItWorks />
      <div className="flex flex-col gap-4">
        <CtaStrip />
        <RoadmapStrip />
      </div>
    </GlassPanel>
  );
}
