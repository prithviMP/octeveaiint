import { ArrowRight, LayoutGrid, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { OptionList } from "@/components/interview/OptionRow";
import { QuestionCard } from "@/components/interview/QuestionCard";

const SAMPLE = {
  subject: "DSA",
  topic: "Binary Search Tree",
  difficulty: "Medium" as const,
  question: "What is the time complexity of searching for an element in a balanced binary search tree?",
  options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
};

export function Hero() {
  return (
    <section className="grid grid-cols-1 items-center gap-10 md:grid-cols-12">
      <div className="flex flex-col items-start gap-6 md:col-span-6">
        <Badge tone="white" mono dot="success">
          Technical MCQ practice
        </Badge>
        <h1 className="text-4xl leading-[1.12] font-semibold tracking-[-0.03em] text-slate-900 lg:text-5xl">
          Practice technical interviews with{" "}
          <span className="relative inline-block">
            confidence
            <span aria-hidden className="absolute bottom-1.5 left-0 -z-10 h-2.5 w-full rounded-full bg-indigo-200/70" />
          </span>
          .
        </h1>
        <p className="max-w-lg text-base leading-relaxed text-slate-600">
          Curated multiple-choice questions across CS fundamentals, system design, and modern frameworks. Get an
          instant score and a detailed explanation for every answer, with no sign-up.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button href="/user-details" size="lg" trailingIcon={ArrowRight}>
            Start Practicing
          </Button>
          <Button href="/#subjects" variant="ghost" size="lg" icon={LayoutGrid}>
            Explore Subjects
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="white" mono dot="warning">
            No sign-up required
          </Badge>
          <Badge tone="white" mono dot="accent">
            Instant scoring
          </Badge>
          <Badge tone="white" mono dot="success">
            Answer explanations
          </Badge>
        </div>
      </div>

      <div className="md:col-span-6">
        <GlassPanel tier="card" className="relative overflow-hidden p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-1.5" aria-hidden>
              <span className="size-2.5 rounded-full bg-rose-400" />
              <span className="size-2.5 rounded-full bg-amber-400" />
              <span className="size-2.5 rounded-full bg-emerald-400" />
            </div>
            <Badge mono>Sample question</Badge>
          </div>
          <QuestionCard {...SAMPLE} position={1} total={10}>
            <OptionList
              options={SAMPLE.options}
              label="Sample answers"
              stateFor={(letter) => (letter === "B" ? "selected" : "idle")}
            />
          </QuestionCard>
          <div className="mt-5 flex items-center justify-between border-t border-slate-200/60 pt-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Sparkles size={13} className="text-accent" aria-hidden />
              Explanations unlock after you submit
            </span>
            <span className="font-mono">Keys A to D</span>
          </div>
        </GlassPanel>
      </div>
    </section>
  );
}
