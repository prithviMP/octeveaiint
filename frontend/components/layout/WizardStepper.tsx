import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import { Fragment } from "react";
import { cn } from "@/lib/cn";

export type WizardStep = 1 | 2 | 3;

const STEPS: { step: WizardStep; label: string; href: string }[] = [
  { step: 1, label: "Your name", href: "/user-details" },
  { step: 2, label: "Subjects", href: "/subjects" },
  { step: 3, label: "Configure", href: "/configure" },
];

/** Progress through the three setup steps. Completed steps link back. */
export function WizardStepper({ current }: { current: WizardStep }) {
  return (
    <nav aria-label="Setup progress" className="mx-auto w-full max-w-2xl">
      <ol className="glass-capsule flex items-center gap-1 rounded-full p-1.5">
        {STEPS.map(({ step, label, href }, index) => {
          const done = step < current;
          const active = step === current;
          const content = (
            <>
              <span
                className={cn(
                  "inline-flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-semibold",
                  active && "bg-white/15 text-white",
                  done && "bg-emerald-500/15 text-emerald-700",
                  !active && !done && "bg-slate-200/70 text-slate-500",
                )}
              >
                {done ? <Check size={12} strokeWidth={2.5} aria-hidden /> : step}
              </span>
              <span className={cn("truncate", !active && "hidden sm:inline")}>{label}</span>
            </>
          );
          const itemClasses = cn(
            "flex h-10 w-full items-center justify-center gap-2 rounded-full px-3 text-sm font-medium transition-all",
            active && "bg-obsidian text-white shadow-pill",
            done && "text-slate-700 hover:bg-white/70",
            !active && !done && "text-slate-400",
          );

          return (
            <Fragment key={step}>
              {index > 0 && <ChevronRight size={14} className="shrink-0 text-slate-300" aria-hidden />}
              <li className={cn("min-w-0", active ? "flex-[1.4]" : "flex-1")}>
                {done ? (
                  <Link href={href} className={itemClasses}>
                    {content}
                  </Link>
                ) : (
                  <span aria-current={active ? "step" : undefined} className={itemClasses}>
                    {content}
                  </span>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
