import { isAllowedCountry, countryFromHeaders } from "./geo.ts";
import { bitlabsAppToken, contactEmail, lootablyPlacementId } from "./public-env.server.ts";
import { jsonBody } from "./respond.ts";
import { cleanVisitorId } from "./ids.ts";
import { getGrantStore } from "./store.ts";
import { readDownloadToken, signDownloadPath } from "./token.server.ts";

export function geoPayload(request: Request): Response {
  const country = countryFromHeaders(request.headers);
  const allowed = isAllowedCountry(country);
  const body: {
    country: string | null;
    allowed: boolean;
    contactEmail: string | null;
    bitlabsToken?: string;
    lootablyPlacementId?: string;
  } = {
    country,
    allowed,
    contactEmail: contactEmail(),
  };
  if (allowed) {
    const bitlabsToken = bitlabsAppToken();
    const lootablyPlacementIdValue = lootablyPlacementId();
    if (bitlabsToken) body.bitlabsToken = bitlabsToken;
    if (lootablyPlacementIdValue) body.lootablyPlacementId = lootablyPlacementIdValue;
  }
  return jsonBody(body);
}

export async function unlockStatus(request: Request): Promise<Response> {
  if (!isAllowedCountry(countryFromHeaders(request.headers))) {
    return jsonBody({ unlocked: false });
  }
  const visitorId = cleanVisitorId(new URL(request.url).searchParams.get("uid"));
  if (!visitorId) return jsonBody({ unlocked: false });
  const store = await getGrantStore();
  const unlocked = await store.isUnlocked(visitorId);
  if (!unlocked) return jsonBody({ unlocked: false });
  const downloadPath = signDownloadPath(visitorId);
  if (!downloadPath) return jsonBody({ unlocked: true });
  return jsonBody({ unlocked: true, downloadPath });
}

function courseFilename(): string {
  const url = process.env.COURSE_DOWNLOAD_URL?.trim() ?? "";
  try {
    const base = new URL(url).pathname.split("/").pop() ?? "";
    if (/^[\w.-]+\.(pdf|zip|epub|mp4|mov|pptx)$/i.test(base)) return base;
  } catch {
    /* fall through */
  }
  return "digital-product-selling-course";
}

export async function downloadCourse(request: Request): Promise<Response> {
  if (!isAllowedCountry(countryFromHeaders(request.headers))) {
    return new Response("This unlock is only available for US and UK visitors", {
      status: 403,
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
    });
  }
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const visitorId = readDownloadToken(token);
  if (!visitorId) {
    return new Response("Download link expired", {
      status: 401,
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
    });
  }
  const store = await getGrantStore();
  if (!(await store.isUnlocked(visitorId))) {
    return new Response("Course is locked", {
      status: 403,
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
    });
  }
  const courseUrl = process.env.COURSE_DOWNLOAD_URL?.trim() ?? "";
  if (!courseUrl.startsWith("https://")) {
    return new Response("Course file is not configured", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
    });
  }
  const upstream = await fetch(courseUrl, { redirect: "follow" });
  if (!upstream.ok || !upstream.body) {
    return new Response("Course file could not be fetched", {
      status: 502,
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
    });
  }
  const headers = new Headers({
    "content-type": upstream.headers.get("content-type") || "application/octet-stream",
    "content-disposition": `attachment; filename="${courseFilename()}"`,
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  const length = upstream.headers.get("content-length");
  if (length) headers.set("content-length", length);
  return new Response(upstream.body, { status: 200, headers });
}
