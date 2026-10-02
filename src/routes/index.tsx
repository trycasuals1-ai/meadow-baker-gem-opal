import { createFileRoute } from "@tanstack/react-router";
import { LockedMark, UnlockPanel } from "@/components/unlock-panel";
import { SiteFrame } from "@/components/site-frame";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <SiteFrame>
      <div className="flex items-start gap-4">
        <LockedMark />
        <p className="pt-2 text-sm font-semibold tracking-wide text-muted uppercase">
          CourseUnlock
        </p>
      </div>
      <h1 className="mt-6 font-display text-4xl leading-tight text-balance text-ink sm:text-5xl">
        Digital product selling course
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-pretty text-muted">
        US and UK only. Complete one partner survey or one offer. When the partner confirms
        completion, the course unlocks on this page. No fee. Opening this page does not unlock
        the course.
      </p>
      <ol className="mt-8 grid gap-3 text-sm sm:grid-cols-3">
        <li className="rounded-xl bg-card px-4 py-4 panel">
          <span className="font-display text-lg text-ink">1</span>
          <p className="mt-1 text-pretty text-muted">The visit must be in the US or the UK.</p>
        </li>
        <li className="rounded-xl bg-card px-4 py-4 panel">
          <span className="font-display text-lg text-ink">2</span>
          <p className="mt-1 text-pretty text-muted">One survey or one offer. Not two.</p>
        </li>
        <li className="rounded-xl bg-card px-4 py-4 panel">
          <span className="font-display text-lg text-ink">3</span>
          <p className="mt-1 text-pretty text-muted">
            The download appears only after the partner’s server confirms it.
          </p>
        </li>
      </ol>
      <UnlockPanel />
    </SiteFrame>
  );
}
