import { useEffect, useState } from "react";
import { Download, Lock } from "lucide-react";
import { visitorId } from "@/lib/visitor-id";
import { bitlabsWallUrl, lootablyWallUrl } from "@/lib/unlock/walls";

type Geo =
  | { state: "loading" }
  | { state: "error" }
  | {
      state: "ready";
      allowed: boolean;
      country: string | null;
      bitlabsToken: string | null;
      lootablyPlacementId: string | null;
    };

type Unlock =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "locked" }
  | { state: "ready"; downloadPath: string | null }
  | { state: "error" };

type Wall = "bitlabs" | "lootably" | null;

const POLL_MS = 8000;

export function UnlockPanel() {
  const [geo, setGeo] = useState<Geo>({ state: "loading" });
  const [uid, setUid] = useState<string | null>(null);
  const [wall, setWall] = useState<Wall>(null);
  const [unlock, setUnlock] = useState<Unlock>({ state: "idle" });

  useEffect(() => {
    setUid(visitorId());
    const controller = new AbortController();
    fetch("/api/geo", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("geo failed");
        const body = (await response.json()) as {
          allowed?: boolean;
          country?: string | null;
          bitlabsToken?: string;
          lootablyPlacementId?: string;
        };
        setGeo({
          state: "ready",
          allowed: body.allowed === true,
          country: body.country ?? null,
          bitlabsToken: body.bitlabsToken ?? null,
          lootablyPlacementId: body.lootablyPlacementId ?? null,
        });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setGeo({ state: "error" });
      });
    return () => controller.abort();
  }, []);

  const allowed = geo.state === "ready" && geo.allowed;
  const unlocked = unlock.state === "ready";

  useEffect(() => {
    if (!allowed || !uid || unlocked) return;
    let cancelled = false;
    const check = async () => {
      try {
        const response = await fetch(`/api/unlock-status?uid=${encodeURIComponent(uid)}`, {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("status failed");
        const body = (await response.json()) as { unlocked?: boolean; downloadPath?: string };
        if (cancelled) return;
        if (body.unlocked) {
          setUnlock({ state: "ready", downloadPath: body.downloadPath ?? null });
          setWall(null);
          return;
        }
        setUnlock({ state: "locked" });
      } catch {
        if (!cancelled) setUnlock({ state: "error" });
      }
    };
    void check();
    if (!wall) return () => {
      cancelled = true;
    };
    const timer = window.setInterval(() => void check(), POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [allowed, uid, wall, unlocked]);

  return (
    <section className="mt-8" aria-live="polite">
      {geo.state === "loading" ? (
        <p className="text-muted">Checking this visit…</p>
      ) : null}

      {geo.state === "error" ? (
        <p className="rounded-xl bg-card px-4 py-4 text-ink panel">
          This visit could not be checked. The task wall stays closed.
        </p>
      ) : null}

      {geo.state === "ready" && !geo.allowed ? (
        <div className="rounded-xl bg-card px-5 py-5 panel">
          <p className="font-display text-2xl text-balance text-ink">
            This unlock is only available for US and UK visitors
          </p>
        </div>
      ) : null}

      {geo.state === "ready" && geo.allowed && unlock.state !== "ready" ? (
        <OfferChoice
          bitlabsToken={geo.bitlabsToken}
          lootablyPlacementId={geo.lootablyPlacementId}
          wall={wall}
          uid={uid}
          status={unlock.state}
          onOpen={setWall}
          onClose={() => setWall(null)}
        />
      ) : null}

      {unlock.state === "ready" ? <DownloadReady downloadPath={unlock.downloadPath} /> : null}
    </section>
  );
}

function OfferChoice({
  bitlabsToken,
  lootablyPlacementId,
  wall,
  uid,
  status,
  onOpen,
  onClose,
}: {
  bitlabsToken: string | null;
  lootablyPlacementId: string | null;
  wall: Wall;
  uid: string | null;
  status: Unlock["state"];
  onOpen: (wall: Exclude<Wall, null>) => void;
  onClose: () => void;
}) {
  const hasBitlabs = Boolean(bitlabsToken);
  const hasLootably = Boolean(lootablyPlacementId);
  if (!hasBitlabs && !hasLootably) {
    return (
      <p className="rounded-xl bg-card px-5 py-5 text-ink panel">
        No partner wall is connected on this server yet. The course stays locked until a verified
        completion arrives.
      </p>
    );
  }

  if (!wall || !uid) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row">
        {hasBitlabs ? (
          <button
            type="button"
            className="min-h-12 flex-1 rounded-lg bg-ink px-4 text-base font-semibold text-paper"
            onClick={() => onOpen("bitlabs")}
          >
            BitLabs
          </button>
        ) : null}
        {hasLootably ? (
          <button
            type="button"
            className="min-h-12 flex-1 rounded-lg bg-ink px-4 text-base font-semibold text-paper"
            onClick={() => onOpen("lootably")}
          >
            Lootably
          </button>
        ) : null}
      </div>
    );
  }

  const src =
    wall === "bitlabs" && bitlabsToken
      ? bitlabsWallUrl(bitlabsToken, uid)
      : wall === "lootably" && lootablyPlacementId
        ? lootablyWallUrl(lootablyPlacementId, uid)
        : null;
  if (!src) return null;
  const label = wall === "bitlabs" ? "BitLabs" : "Lootably";

  return (
    <div className="overflow-hidden rounded-2xl bg-card p-2 panel">
      <div className="flex items-center justify-between gap-3 px-2 py-2">
        <p className="text-sm font-semibold text-ink">{label}</p>
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm text-muted"
          onClick={onClose}
        >
          Close
        </button>
      </div>
      <iframe
        title={`${label} tasks`}
        src={src}
        className="h-[70dvh] min-h-[32rem] w-full rounded-xl bg-paper"
      />
      <p className="px-3 py-3 text-sm text-pretty text-muted">
        {status === "error"
          ? "The status check failed. This page will try again. The course is still locked."
          : "Waiting for the partner to confirm. This page checks every 8 seconds. Opening the wall does not unlock the course."}
      </p>
    </div>
  );
}

function DownloadReady({ downloadPath }: { downloadPath: string | null }) {
  return (
    <div className="rounded-xl bg-ok-soft px-5 py-5 text-ink panel">
      <p className="font-display text-2xl text-balance">The partner confirmed one completed task.</p>
      <p className="mt-2 text-pretty text-muted">The course is unlocked on this page. No fee.</p>
      {downloadPath ? (
        <a
          href={downloadPath}
          className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-lg bg-ok px-4 font-semibold text-paper"
        >
          <Download className="size-4" aria-hidden="true" />
          Download the course
        </a>
      ) : (
        <p className="mt-4 text-pretty">
          The completion is verified, but the course file is not attached on the server yet.
        </p>
      )}
    </div>
  );
}

export function LockedMark() {
  return (
    <span className="inline-flex size-11 items-center justify-center rounded-lg bg-accent-soft text-accent">
      <Lock className="size-5" aria-hidden="true" />
    </span>
  );
}
