import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function SiteFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-3">
          <Link to="/" className="font-display text-xl tracking-tight text-ink">
            CourseUnlock
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link
              to="/privacy"
              className="inline-flex min-h-11 items-center px-3 text-muted"
              activeProps={{ className: "inline-flex min-h-11 items-center px-3 text-ink" }}
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="inline-flex min-h-11 items-center px-3 text-muted"
              activeProps={{ className: "inline-flex min-h-11 items-center px-3 text-ink" }}
            >
              Terms
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-10 sm:py-14">{children}</main>
    </div>
  );
}
