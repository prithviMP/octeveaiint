import { CircleAlert, RotateCcw, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { IconCapsule } from "@/components/ui/IconCapsule";

interface StateAction {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: LucideIcon;
}

interface StateMessageProps {
  title: string;
  description?: ReactNode;
  icon?: LucideIcon;
  primaryAction?: StateAction;
  secondaryAction?: StateAction;
  className?: string;
}

/** Centered error or empty state with up to two actions. */
export function StateMessage({
  title,
  description,
  icon = CircleAlert,
  primaryAction,
  secondaryAction,
  className,
}: StateMessageProps) {
  return (
    <GlassPanel
      tier="card"
      role="status"
      className={cn("mx-auto flex max-w-lg flex-col items-center gap-4 px-8 py-10 text-center", className)}
    >
      <IconCapsule icon={icon} tone="muted" />
      <div className="flex flex-col gap-1.5">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
        {description && <p className="text-sm leading-relaxed text-slate-600">{description}</p>}
      </div>
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {secondaryAction && (
            <Button variant="text" href={secondaryAction.href} onClick={secondaryAction.onClick} icon={secondaryAction.icon}>
              {secondaryAction.label}
            </Button>
          )}
          {primaryAction && (
            <Button href={primaryAction.href} onClick={primaryAction.onClick} icon={primaryAction.icon ?? RotateCcw}>
              {primaryAction.label}
            </Button>
          )}
        </div>
      )}
    </GlassPanel>
  );
}
