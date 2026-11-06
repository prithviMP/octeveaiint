import Link from "next/link";
import { Bot } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export function BrandMark() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="AI Interview Coach home">
      <span className="inline-flex size-8 items-center justify-center rounded-full bg-obsidian text-white shadow-pill">
        <Bot size={17} strokeWidth={1.75} aria-hidden />
      </span>
      <span className="text-sm font-semibold tracking-tight whitespace-nowrap text-slate-900">AI Interview Coach</span>
      <Badge mono className="hidden xl:inline-flex">
        Beta
      </Badge>
    </Link>
  );
}
