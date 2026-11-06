import { Info, Library, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { QuestionSource } from "@/types/api";

const LABELS: Record<QuestionSource, string> = {
  ai: "AI-generated",
  mixed: "AI + curated",
  bank: "Curated bank",
};

export function QuestionSourceBadge({ source }: { source: QuestionSource }) {
  const Icon = source === "bank" ? Library : Sparkles;
  return (
    <Badge tone={source === "bank" ? "neutral" : "accent"}>
      <Icon size={11} aria-hidden />
      {LABELS[source]}
    </Badge>
  );
}

/** Explains a fallback to the curated bank. Renders nothing when every question came from Gemini. */
export function QuestionSourceNote({ source }: { source: QuestionSource }) {
  if (source === "ai") return null;
  return (
    <p className="flex items-center gap-1.5 text-xs text-slate-500">
      <Info size={13} aria-hidden />
      {source === "mixed"
        ? "Gemini couldn't write every question, so some come from the curated bank."
        : "Gemini was unavailable, so these questions come from the curated bank."}
    </p>
  );
}
