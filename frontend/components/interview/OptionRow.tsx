import { Check, CircleCheck, CircleX } from "lucide-react";
import { cn } from "@/lib/cn";
import { ANSWER_OPTIONS, type AnswerOption } from "@/types/api";

export type OptionState = "idle" | "selected" | "correct" | "incorrect";

const STATE_CLASSES: Record<OptionState, string> = {
  idle: "glass-card text-slate-700",
  selected: "border-obsidian bg-obsidian text-white shadow-pill",
  correct: "border-emerald-500/40 bg-emerald-50/90 text-emerald-900",
  incorrect: "border-rose-500/40 bg-rose-50/90 text-rose-900",
};

const LETTER_CLASSES: Record<OptionState, string> = {
  idle: "bg-slate-100 text-slate-600",
  selected: "bg-white/15 text-white",
  correct: "bg-emerald-500 text-white",
  incorrect: "bg-rose-500 text-white",
};

interface OptionRowProps {
  letter: AnswerOption;
  text: string;
  state: OptionState;
  /** Shown on the right, e.g. "Your answer". */
  note?: string;
  onSelect?: () => void;
}

export function OptionRow({ letter, text, state, note, onSelect }: OptionRowProps) {
  const interactive = Boolean(onSelect);
  const Indicator = state === "correct" ? CircleCheck : state === "incorrect" ? CircleX : state === "selected" ? Check : null;

  const body = (
    <>
      <span
        className={cn(
          "inline-flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold",
          LETTER_CLASSES[state],
        )}
      >
        {letter}
      </span>
      <span className="flex-1 text-sm leading-relaxed">{text}</span>
      {note && (
        <span className="hidden font-mono text-[10px] tracking-wider uppercase opacity-70 sm:inline">{note}</span>
      )}
      {Indicator && <Indicator size={17} strokeWidth={2} className="shrink-0" aria-hidden />}
    </>
  );

  const classes = cn(
    "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-200",
    STATE_CLASSES[state],
  );

  if (!interactive) {
    return <div className={classes}>{body}</div>;
  }

  return (
    <button
      type="button"
      role="radio"
      aria-checked={state === "selected"}
      onClick={onSelect}
      className={cn(classes, state === "idle" && "hover:-translate-y-0.5 hover:bg-white hover:shadow-capsule")}
    >
      {body}
    </button>
  );
}

interface OptionListProps {
  options: string[];
  label: string;
  stateFor: (letter: AnswerOption) => OptionState;
  noteFor?: (letter: AnswerOption) => string | undefined;
  onSelect?: (letter: AnswerOption) => void;
}

/** The four lettered answers for a question. Interactive when `onSelect` is given. */
export function OptionList({ options, label, stateFor, noteFor, onSelect }: OptionListProps) {
  return (
    <div role={onSelect ? "radiogroup" : "list"} aria-label={label} className="flex flex-col gap-2.5">
      {options.map((text, index) => {
        const letter = ANSWER_OPTIONS[index];
        return (
          <div key={letter} role={onSelect ? undefined : "listitem"}>
            <OptionRow
              letter={letter}
              text={text}
              state={stateFor(letter)}
              note={noteFor?.(letter)}
              onSelect={onSelect ? () => onSelect(letter) : undefined}
            />
          </div>
        );
      })}
    </div>
  );
}
