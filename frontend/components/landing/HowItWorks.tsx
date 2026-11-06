import { BookOpen, LayoutGrid, ListChecks, User, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { IconCapsule } from "@/components/ui/IconCapsule";
import { SectionHeader } from "@/components/ui/SectionHeader";

const STEPS: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: "Enter your name",
    description: "No account or password. Your name personalises the session and your results.",
    icon: User,
  },
  {
    title: "Pick subjects",
    description: "Combine DSA, system design, languages, and frameworks into one practice set.",
    icon: LayoutGrid,
  },
  {
    title: "Answer MCQs",
    description: "Choose the question count and difficulty, then work through one question at a time.",
    icon: ListChecks,
  },
  {
    title: "Review and learn",
    description: "See your score, a per-subject breakdown, and an explanation for every question.",
    icon: BookOpen,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="flex scroll-mt-28 flex-col gap-8">
      <SectionHeader
        align="center"
        eyebrow="How it works"
        eyebrowDot="success"
        title="From zero to scored in four steps"
        description="Built to get you practicing immediately, without sign-up forms or email confirmations."
      />
      <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => (
          <li key={step.title}>
            <GlassPanel tier="card" className="flex h-full flex-col gap-4 p-5">
              <div className="flex items-center justify-between">
                <Badge tone="white" mono>
                  Step {String(index + 1).padStart(2, "0")}
                </Badge>
                <IconCapsule icon={step.icon} tone="muted" size="sm" />
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-sm font-semibold tracking-tight text-slate-900">{step.title}</h3>
                <p className="text-xs leading-relaxed text-slate-500">{step.description}</p>
              </div>
            </GlassPanel>
          </li>
        ))}
      </ol>
    </section>
  );
}
