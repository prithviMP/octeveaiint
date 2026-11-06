import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { DIFFICULTIES, type Difficulty } from "@/types/api";

export const DIFFICULTY_TONE: Record<Difficulty, BadgeTone> = {
  Easy: "success",
  Medium: "warning",
  Hard: "danger",
};

const SHORT_LABEL: Record<Difficulty, string> = { Easy: "Easy", Medium: "Med", Hard: "Hard" };

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return <Badge tone={DIFFICULTY_TONE[difficulty] ?? "neutral"}>{difficulty}</Badge>;
}

/** Per-difficulty question counts, e.g. "4 Easy 5 Med 3 Hard". */
export function DifficultyChips({ counts }: { counts: Partial<Record<Difficulty, number>> }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {DIFFICULTIES.filter((level) => counts[level]).map((level) => (
        <Badge key={level} tone={DIFFICULTY_TONE[level]}>
          {counts[level]} {SHORT_LABEL[level]}
        </Badge>
      ))}
    </div>
  );
}
