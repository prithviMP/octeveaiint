"use client";

import { CircleCheck, Crosshair, Footprints, RotateCcw, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { IconCapsule } from "@/components/ui/IconCapsule";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAsync } from "@/hooks/useAsync";
import { cn } from "@/lib/cn";
import { useAIEnabled } from "@/hooks/useHealth";
import { subjectLabel } from "@/lib/subjects";
import { api } from "@/services/api";
import type { InterviewEvaluation } from "@/types/api";

function ReportBlock({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <div className="glass-inset flex flex-col gap-3 rounded-2xl p-4">
      <h3 className="flex items-center gap-2 font-mono text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
        <Icon size={13} aria-hidden />
        {title}
      </h3>
      {children}
    </div>
  );
}

function ReportBody({ evaluation }: { evaluation: InterviewEvaluation }) {
  return (
    <>
      <p className="text-sm leading-relaxed text-slate-700">{evaluation.summary}</p>
      <div
        className={cn(
          "grid grid-cols-1 gap-4",
          evaluation.strengths.length > 0 && evaluation.weak_areas.length > 0 && "md:grid-cols-2",
        )}
      >
        {evaluation.strengths.length > 0 && (
          <ReportBlock icon={CircleCheck} title="Strengths">
            <ul className="flex flex-col gap-2 text-sm text-slate-700">
              {evaluation.strengths.map((strength) => (
                <li key={strength} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                  {strength}
                </li>
              ))}
            </ul>
          </ReportBlock>
        )}
        {evaluation.weak_areas.length > 0 && (
          <ReportBlock icon={Crosshair} title="Focus areas">
            <ul className="flex flex-col gap-3 text-sm">
              {evaluation.weak_areas.map((area) => (
                <li key={`${area.subject}-${area.topic}`} className="flex flex-col gap-1">
                  <span className="flex flex-wrap items-center gap-1.5 font-medium text-slate-900">
                    {area.topic}
                    <Badge tone="white">{subjectLabel(area.subject)}</Badge>
                  </span>
                  <span className="leading-relaxed text-slate-600">{area.advice}</span>
                </li>
              ))}
            </ul>
          </ReportBlock>
        )}
      </div>
      {evaluation.recommendations.length > 0 && (
        <ReportBlock icon={Footprints} title="Next steps">
          <ol className="flex flex-col gap-2 text-sm text-slate-700">
            {evaluation.recommendations.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="font-mono text-xs text-slate-400">{String(index + 1).padStart(2, "0")}</span>
                {step}
              </li>
            ))}
          </ol>
        </ReportBlock>
      )}
    </>
  );
}

/** Personal feedback for a submitted interview, written by Gemini or, if it is unavailable, by simple rules. */
export function AICoachReport({ sessionId }: { sessionId: string }) {
  const aiEnabled = useAIEnabled();
  const { data, error, loading, reload } = useAsync((signal) => api.getEvaluation(sessionId, signal), sessionId);
  const ruleBased = data?.source === "rule_based";

  return (
    <GlassPanel tier="card" as="section" className="flex flex-col gap-5 p-5 sm:p-6" aria-busy={loading}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <IconCapsule icon={Sparkles} tone="dark" size="sm" />
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold tracking-tight text-slate-900">Coach report</h2>
            <p className="text-xs text-slate-500">
              {loading ? "Your AI coach is reviewing your answers…" : "Personal feedback on this interview."}
            </p>
          </div>
        </div>
        {data && (
          <Badge tone={ruleBased ? "neutral" : "accent"} mono>
            {ruleBased ? "Rule-based" : "Gemini"}
          </Badge>
        )}
      </div>

      {loading && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
        </div>
      )}

      {error && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
          <span role="alert">Couldn&apos;t load the coach report. {error.message}</span>
          <Button variant="ghost" size="sm" icon={RotateCcw} onClick={reload}>
            Try again
          </Button>
        </div>
      )}

      {data && <ReportBody evaluation={data} />}

      {ruleBased && aiEnabled && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/60 pt-4 text-xs text-slate-500">
          <span>Gemini was unavailable, so this is a basic report.</span>
          <Button variant="text" size="sm" icon={RotateCcw} onClick={reload}>
            Ask Gemini again
          </Button>
        </div>
      )}
    </GlassPanel>
  );
}
