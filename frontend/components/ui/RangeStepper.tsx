"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { IconButton } from "@/components/ui/IconCapsule";

interface RangePreset {
  label: string;
  value: number;
}

interface RangeStepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
  presets?: RangePreset[];
  className?: string;
}

/** Slider with minus/plus buttons and optional quick-pick presets. */
export function RangeStepper({ value, min, max, onChange, label, presets = [], className }: RangeStepperProps) {
  const clamp = (next: number) => Math.min(max, Math.max(min, next));
  const percent = max > min ? ((value - min) / (max - min)) * 100 : 100;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="glass-inset flex items-center gap-4 rounded-2xl px-4 py-4">
        <IconButton
          icon={Minus}
          label={`Decrease ${label}`}
          size="sm"
          onClick={() => onChange(clamp(value - 1))}
          disabled={value <= min}
        />
        <input
          type="range"
          aria-label={label}
          min={min}
          max={max}
          value={value}
          onChange={(event) => onChange(clamp(Number(event.target.value)))}
          className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full accent-obsidian [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-obsidian [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-obsidian [&::-webkit-slider-thumb]:shadow-md"
          style={{
            background: `linear-gradient(to right, var(--color-obsidian) ${percent}%, rgb(203 213 225 / 0.7) ${percent}%)`,
          }}
        />
        <IconButton
          icon={Plus}
          label={`Increase ${label}`}
          size="sm"
          onClick={() => onChange(clamp(value + 1))}
          disabled={value >= max}
        />
      </div>
      {presets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => {
            const active = preset.value === value;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => onChange(clamp(preset.value))}
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-3 py-1 font-mono text-xs transition-all",
                  active
                    ? "border-obsidian bg-obsidian text-white"
                    : "border-white/90 bg-white/60 text-slate-600 hover:bg-white hover:text-slate-900",
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
