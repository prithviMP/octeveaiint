import Link from "next/link";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, "");

const FOOTER_LINKS = [
  { href: "/#subjects", label: "Practice subjects", external: false },
  { href: `${API_URL}/docs`, label: "API docs", external: true },
  { href: "https://github.com/prithviMP/octeveaiint", label: "GitHub", external: true },
];

export function SiteFooter() {
  return (
    <footer className="px-4 pt-4 pb-6">
      <div className="glass-capsule mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 rounded-full px-6 py-3 text-xs sm:flex-row">
        <p className="font-mono text-slate-500">AI Interview Coach. Built for technical interview practice.</p>
        <nav aria-label="Footer" className="flex items-center gap-5">
          {FOOTER_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="text-slate-600 transition hover:text-slate-900"
              >
                {link.label}
              </a>
            ) : (
              <Link key={link.label} href={link.href} className="text-slate-600 transition hover:text-slate-900">
                {link.label}
              </Link>
            ),
          )}
        </nav>
      </div>
    </footer>
  );
}
