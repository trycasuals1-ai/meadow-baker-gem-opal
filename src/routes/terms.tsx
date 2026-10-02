import { createFileRoute } from "@tanstack/react-router";
import { SiteFrame } from "@/components/site-frame";
import { loadContact } from "@/lib/unlock/contact";

export const Route = createFileRoute("/terms")({
  loader: () => loadContact(),
  head: () => ({ meta: [{ title: "Terms · CourseUnlock" }] }),
  component: TermsPage,
});

function TermsPage() {
  const { contactEmail } = Route.useLoaderData();
  return (
    <SiteFrame>
      <h1 className="font-display text-4xl text-balance text-ink">Terms</h1>
      <div className="mt-6 space-y-4 text-base leading-relaxed text-pretty text-ink">
        <p>The course is free to the user. Opening this page does not unlock it, and there is no fee.</p>
        <p>
          Unlock requires one completed partner task. BitLabs and Lootably process the task. One
          successful completion is enough. A second task is not required.
        </p>
        <p>
          The course unlocks only after this site verifies the partner’s server postback. Clicking
          a button, loading the task wall, or saying the task is finished does not unlock it.
        </p>
        <p>
          This unlock is only available for US and UK visitors. If the partner sends a reversal or
          chargeback, the grant is removed.
        </p>
        <p>This site does not sell the user’s course file to advertisers.</p>
        {contactEmail ? (
          <p>
            Contact:{" "}
            <a
              className="text-accent underline underline-offset-4"
              href={`mailto:${contactEmail}`}
            >
              {contactEmail}
            </a>
          </p>
        ) : (
          <p>The publisher has not published a contact email yet.</p>
        )}
      </div>
    </SiteFrame>
  );
}
