import { ArrowLeft, ArrowRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

interface WizardActionBarProps {
  summary?: ReactNode;
  back?: { href: string; label: string };
  next: {
    label: string;
    onClick?: () => void;
    type?: "button" | "submit";
    form?: string;
    disabled?: boolean;
    loading?: boolean;
    icon?: LucideIcon;
  };
}

/** Sticky footer bar for setup steps: a summary on the left, back and continue on the right. */
export function WizardActionBar({ summary, back, next }: WizardActionBarProps) {
  return (
    <div className="sticky bottom-4 z-30">
      <div className="glass-capsule flex flex-col gap-3 bg-white/95 rounded-[1.75rem] p-3 pl-5 shadow-capsule sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 text-sm text-slate-600">{summary}</div>
        <div className="flex items-center justify-end gap-2">
          {back && (
            <Button variant="text" href={back.href} icon={ArrowLeft}>
              {back.label}
            </Button>
          )}
          <Button
            type={next.type ?? "button"}
            form={next.form}
            onClick={next.onClick}
            disabled={next.disabled}
            loading={next.loading}
            trailingIcon={next.icon ?? ArrowRight}
            size="lg"
          >
            {next.label}
          </Button>
        </div>
      </div>
    </div>
  );
}
