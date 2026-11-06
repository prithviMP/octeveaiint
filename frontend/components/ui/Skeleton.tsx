import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-shimmer rounded-xl bg-[linear-gradient(90deg,rgb(226_232_240/0.6)_0%,rgb(255_255_255/0.9)_50%,rgb(226_232_240/0.6)_100%)] bg-[length:200%_100%]",
        className,
      )}
    />
  );
}
