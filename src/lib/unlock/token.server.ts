import { createHmac } from "node:crypto";
import { safeEqual } from "./hash.ts";
import { cleanVisitorId } from "./ids.ts";

const TTL_MS = 10 * 60 * 1000;

function signingKey(): string | null {
  const parts = ["BITLABS_SECRET_KEY", "LOOTABLY_SECRET_KEY", "COURSE_DOWNLOAD_URL"]
    .map((name) => process.env[name]?.trim())
    .filter((value): value is string => Boolean(value));
  if (parts.length === 0) return null;
  return parts.join("\n");
}

export function courseDownloadConfigured(): boolean {
  const url = process.env.COURSE_DOWNLOAD_URL?.trim() ?? "";
  return url.startsWith("https://");
}

export function signDownloadPath(visitorId: string): string | null {
  const key = signingKey();
  if (!key || !courseDownloadConfigured()) return null;
  const payload = Buffer.from(
    JSON.stringify({ uid: visitorId, exp: Date.now() + TTL_MS }),
    "utf8",
  ).toString("base64url");
  const sig = createHmac("sha256", key).update(payload).digest("base64url");
  return `/api/download?token=${payload}.${sig}`;
}

export function readDownloadToken(token: string): string | null {
  const key = signingKey();
  if (!key) return null;
  const dot = token.indexOf(".");
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", key).update(payload).digest("base64url");
  if (!safeEqual(expected, sig)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      uid?: unknown;
      exp?: unknown;
    };
    if (typeof parsed.exp !== "number" || parsed.exp < Date.now()) return null;
    if (typeof parsed.uid !== "string") return null;
    return cleanVisitorId(parsed.uid);
  } catch {
    return null;
  }
}
