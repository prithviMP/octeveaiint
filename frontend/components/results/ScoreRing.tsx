import { formatPercent, percentTone, type ScoreTone } from "@/lib/format";

const STROKE_BY_TONE: Record<ScoreTone, string> = {
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#f43f5e",
};

interface ScoreRingProps {
  percentage: number;
  caption: string;
  size?: number;
}

/** Circular percentage gauge for the final score. */
export function ScoreRing({ percentage, caption, size = 200 }: ScoreRingProps) {
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percentage));
  const tone = percentTone(clamped);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgb(226 232 240 / 0.8)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={STROKE_BY_TONE[tone]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <span className="text-4xl font-semibold tracking-[-0.03em] text-slate-900 tabular-nums">
          {formatPercent(percentage)}
        </span>
        <span className="font-mono text-[11px] tracking-wider text-slate-500 uppercase">{caption}</span>
      </div>
    </div>
  );
}
