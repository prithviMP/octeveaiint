import { Suspense } from "react";
import { BrandMark } from "@/components/layout/BrandMark";
import { HeaderCta, HeaderNav, NavLinks, StartPracticingButton } from "@/components/layout/HeaderNav";
import { HealthPill } from "@/components/layout/HealthPill";

export function SiteHeader() {
  return (
    <header className="sticky top-3 z-40 mt-3 px-4">
      <div className="glass-capsule mx-auto flex bg-white/90 max-w-6xl items-center justify-between gap-4 rounded-full px-4 py-2 sm:px-5">
        <BrandMark />
        <Suspense fallback={<NavLinks pathname={null} />}>
          <HeaderNav />
        </Suspense>
        <div className="flex items-center gap-2">
          <HealthPill className="hidden sm:inline-flex" />
          <Suspense fallback={<StartPracticingButton pathname={null} />}>
            <HeaderCta />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
