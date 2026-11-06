"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";

const NAV_LINKS = [
  { href: "/", label: "Home", match: (path: string) => path === "/" },
  { href: "/#subjects", label: "Subjects", match: () => false },
  { href: "/#how-it-works", label: "How it works", match: () => false },
  {
    href: "/user-details",
    label: "Practice",
    match: (path: string) =>
      ["/user-details", "/subjects", "/configure", "/interview", "/results", "/review"].some((prefix) =>
        path.startsWith(prefix),
      ),
  },
];

/** `pathname` is null in the static fallback, before the URL is known. */
export function NavLinks({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Main" className="glass-inset hidden items-center gap-1 rounded-full p-1 md:flex">
      {NAV_LINKS.map((link) => {
        const active = pathname !== null && link.match(pathname);
        return (
          <Link
            key={link.label}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium whitespace-nowrap transition-all",
              active ? "bg-obsidian text-white shadow-sm" : "text-slate-600 hover:bg-white/60 hover:text-slate-900",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function StartPracticingButton({ pathname }: { pathname: string | null }) {
  if (pathname?.startsWith("/interview")) return null;
  return (
    <Button href="/user-details" size="sm">
      Start Practicing
    </Button>
  );
}

export function HeaderNav() {
  return <NavLinks pathname={usePathname()} />;
}

export function HeaderCta() {
  return <StartPracticingButton pathname={usePathname()} />;
}
