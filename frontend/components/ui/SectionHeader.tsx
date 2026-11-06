import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge";
import type { StatusTone } from "@/components/ui/StatusDot";

interface SectionHeaderProps {
  eyebrow?: string;
  eyebrowDot?: StatusTone;
  eyebrowIcon?: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
  size?: "lg" | "md";
  className?: string;
}

export function SectionHeader({
  eyebrow,
  eyebrowDot,
  eyebrowIcon: EyebrowIcon,
  title,
  description,
  action,
  align = "left",
  as: Heading = "h2",
  size = "md",
  className,
}: SectionHeaderProps) {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        centered ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={cn("flex flex-col gap-2.5", centered && "items-center")}>
        {eyebrow && (
          <Badge tone="white" mono dot={eyebrowDot} className="w-fit">
            {EyebrowIcon && <EyebrowIcon size={12} aria-hidden />}
            {eyebrow}
          </Badge>
        )}
        <Heading
          className={cn(
            "font-semibold text-slate-900",
            size === "lg" ? "text-2xl tracking-[-0.025em] md:text-3xl" : "text-xl tracking-[-0.02em] md:text-2xl",
          )}
        >
          {title}
        </Heading>
        {description && (
          <p className={cn("max-w-xl text-sm leading-relaxed text-slate-600", centered && "mx-auto")}>{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
