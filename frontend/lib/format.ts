export type ScoreTone = "success" | "warning" | "danger";

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours) return `${hours}h ${minutes}m`;
  if (minutes) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function formatPercent(value: number): string {
  return `${Number.isInteger(value) ? value : value.toFixed(1)}%`;
}

export function percentTone(percentage: number): ScoreTone {
  if (percentage >= 75) return "success";
  if (percentage >= 50) return "warning";
  return "danger";
}
