"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/interview", label: "Interview" },
  { href: "/feedback", label: "Feedback" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-hero-gradient text-lg font-bold text-white shadow-glow transition-transform duration-300 group-hover:scale-110">
            AI
          </span>
          <span className="text-lg font-bold tracking-tight text-content transition-colors group-hover:text-accent">
            Interview Agent
          </span>
        </Link>

        <nav aria-label="Main navigation">
          <ul className="flex flex-wrap gap-1 sm:gap-2">
            {navItems.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-hero-gradient text-white shadow-glow"
                        : "text-content-muted hover:bg-surface-muted hover:text-content"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
