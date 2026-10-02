import { createFileRoute } from "@tanstack/react-router";
import { SiteFrame } from "@/components/site-frame";
import { loadContact } from "@/lib/unlock/contact";

export const Route = createFileRoute("/privacy")({
  loader: () => loadContact(),
  head: () => ({ meta: [{ title: "Privacy · CourseUnlock" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { contactEmail } = Route.useLoaderData();
  return (
    <SiteFrame>
      <h1 className="font-display text-4xl text-balance text-ink">Privacy</h1>
      <div className="mt-6 space-y-4 text-base leading-relaxed text-pretty text-ink">
        <p>The course is free to the user. There is no fee to unlock it.</p>
        <p>
          Unlock requires one completed partner task. BitLabs and Lootably process that task. This
          site sends them a random id stored in this browser so their confirmation can be matched
          to this page. It does not ask you to create an account.
        </p>
        <p>This site does not sell the user’s course file to advertisers.</p>
        <p>
          A partner postback may include a transaction id and the publisher revenue for that
          completion. Those values are kept only to record the grant and to ignore duplicate
          notices. A reversal or chargeback removes the grant.
        </p>
        <p>The course file address stays on the server. The page does not include it before unlock.</p>
        <Contact email={contactEmail} />
      </div>
    </SiteFrame>
  );
}

function Contact({ email }: { email: string | null }) {
  if (!email) {
    return <p>The publisher has not published a contact email yet.</p>;
  }
  return (
    <p>
      Contact:{" "}
      <a className="text-accent underline underline-offset-4" href={`mailto:${email}`}>
        {email}
      </a>
    </p>
  );
}
