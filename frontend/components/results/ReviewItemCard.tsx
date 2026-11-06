import { Lightbulb, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { OptionList, type OptionState } from "@/components/interview/OptionRow";
import { QuestionCard } from "@/components/interview/QuestionCard";
import type { AnswerOption, ReviewItem } from "@/types/api";

/** One submitted question with the student's answer, the correct answer, and the explanation. */
export function ReviewItemCard({ item, total }: { item: ReviewItem; total: number }) {
  const stateFor = (letter: AnswerOption): OptionState => {
    if (letter === item.correct_answer) return "correct";
    if (letter === item.selected_answer) return "incorrect";
    return "idle";
  };
  const noteFor = (letter: AnswerOption) => {
    if (letter === item.selected_answer) return "Your answer";
    if (letter === item.correct_answer) return "Correct answer";
    return undefined;
  };

  return (
    <GlassPanel tier="card" className="p-5 sm:p-6">
      <QuestionCard
        subject={item.subject}
        topic={item.topic}
        difficulty={item.difficulty}
        question={`${item.position}. ${item.question}`}
        aside={
          <Badge tone={item.is_correct ? "success" : "danger"} mono dot={item.is_correct ? "success" : "danger"}>
            {item.is_correct ? "Correct" : "Incorrect"}
          </Badge>
        }
      >
        <OptionList
          options={item.options}
          label={`Answers for question ${item.position} of ${total}`}
          stateFor={stateFor}
          noteFor={noteFor}
        />
        <div className="glass-inset flex gap-3 rounded-2xl p-4">
          <Lightbulb size={16} className="mt-0.5 shrink-0 text-amber-500" aria-hidden />
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
              Explanation
            </span>
            <p className="text-sm leading-relaxed text-slate-700">{item.explanation}</p>
          </div>
        </div>
        {!item.is_correct && item.ai_feedback && (
          <div className="flex gap-3 rounded-2xl border border-indigo-500/15 bg-indigo-500/5 p-4">
            <Sparkles size={16} className="mt-0.5 shrink-0 text-indigo-500" aria-hidden />
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] font-semibold tracking-wider text-indigo-600 uppercase">
                Coach note
              </span>
              <p className="text-sm leading-relaxed text-slate-700">{item.ai_feedback}</p>
            </div>
          </div>
        )}
      </QuestionCard>
    </GlassPanel>
  );
}
