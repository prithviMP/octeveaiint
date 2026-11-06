import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/cn";

export type GlassTier = "deck" | "card" | "capsule" | "inset";

const TIER_CLASSES: Record<GlassTier, string> = {
  deck: "glass-deck rounded-[2rem]",
  card: "glass-card rounded-2xl",
  capsule: "glass-capsule rounded-full",
  inset: "glass-inset rounded-2xl",
};

type GlassPanelProps<T extends ElementType> = {
  as?: T;
  tier?: GlassTier;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

/** Frosted surface. Tiers follow the elevation scale: deck > card > capsule controls, inset for wells. */
export function GlassPanel<T extends ElementType = "div">({
  as,
  tier = "card",
  className,
  ...rest
}: GlassPanelProps<T>) {
  const Component: ElementType = as ?? "div";
  return <Component className={cn(TIER_CLASSES[tier], className)} {...rest} />;
}
