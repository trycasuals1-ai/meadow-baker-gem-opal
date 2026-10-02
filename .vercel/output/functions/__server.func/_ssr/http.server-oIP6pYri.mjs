import { bitlabsAppToken, contactEmail, lootablyPlacementId } from "./public-env.server-zU9HbqF5.mjs";
import { a as safeEqual, n as jsonBody, t as getGrantStore } from "./hash-APBNJOp_.mjs";
import { n as cleanVisitorId } from "./ids-DsE-Wv_K.mjs";
import { createHmac } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/http.server-oIP6pYri.js
/** ISO country from the edge. Fail closed: unknown is not US/GB. */
var COUNTRY_HEADERS = ["x-vercel-ip-country", "cf-ipcountry"];
function normalizeCountry(raw) {
	const token = raw.split(",")[0]?.trim().toUpperCase() ?? "";
	const code = token === "UK" ? "GB" : token;
	if (!/^[A-Z]{2}$/.test(code)) return null;
	return code;
}
function countryFromHeaders(headers) {
	for (const name of COUNTRY_HEADERS) {
		const raw = headers.get(name);
		if (!raw) continue;
		const code = normalizeCountry(raw);
		if (code) return code;
	}
	return null;
}
/** Vercel sends GB for the United Kingdom. Pakistan and everyone else stay closed. */
function isAllowedCountry(country) {
	return country === "US" || country === "GB";
}
var TTL_MS = 6e5;
function signingKey() {
	const parts = [
		"BITLABS_SECRET_KEY",
		"LOOTABLY_SECRET_KEY",
		"COURSE_DOWNLOAD_URL"
	].map((name) => process.env[name]?.trim()).filter((value) => Boolean(value));
	if (parts.length === 0) return null;
	return parts.join("\n");
}
function courseDownloadConfigured() {
	return (process.env.COURSE_DOWNLOAD_URL?.trim() ?? "").startsWith("https://");
}
function signDownloadPath(visitorId) {
	const key = signingKey();
	if (!key || !courseDownloadConfigured()) return null;
	const payload = Buffer.from(JSON.stringify({
		uid: visitorId,
		exp: Date.now() + TTL_MS
	}), "utf8").toString("base64url");
	return `/api/download?token=${payload}.${createHmac("sha256", key).update(payload).digest("base64url")}`;
}
function readDownloadToken(token) {
	const key = signingKey();
	if (!key) return null;
	const dot = token.indexOf(".");
	if (dot <= 0) return null;
	const payload = token.slice(0, dot);
	const sig = token.slice(dot + 1);
	const expected = createHmac("sha256", key).update(payload).digest("base64url");
	if (!safeEqual(expected, sig)) return null;
	try {
		const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
		if (typeof parsed.exp !== "number" || parsed.exp < Date.now()) return null;
		if (typeof parsed.uid !== "string") return null;
		return cleanVisitorId(parsed.uid);
	} catch {
		return null;
	}
}
function geoPayload(request) {
	const country = countryFromHeaders(request.headers);
	const allowed = isAllowedCountry(country);
	const body = {
		country,
		allowed,
		contactEmail: contactEmail()
	};
	if (allowed) {
		const bitlabsToken = bitlabsAppToken();
		const lootablyPlacementIdValue = lootablyPlacementId();
		if (bitlabsToken) body.bitlabsToken = bitlabsToken;
		if (lootablyPlacementIdValue) body.lootablyPlacementId = lootablyPlacementIdValue;
	}
	return jsonBody(body);
}
async function unlockStatus(request) {
	if (!isAllowedCountry(countryFromHeaders(request.headers))) return jsonBody({ unlocked: false });
	const visitorId = cleanVisitorId(new URL(request.url).searchParams.get("uid"));
	if (!visitorId) return jsonBody({ unlocked: false });
	if (!await (await getGrantStore()).isUnlocked(visitorId)) return jsonBody({ unlocked: false });
	const downloadPath = signDownloadPath(visitorId);
	if (!downloadPath) return jsonBody({ unlocked: true });
	return jsonBody({
		unlocked: true,
		downloadPath
	});
}
function courseFilename() {
	const url = process.env.COURSE_DOWNLOAD_URL?.trim() ?? "";
	try {
		const base = new URL(url).pathname.split("/").pop() ?? "";
		if (/^[\w.-]+\.(pdf|zip|epub|mp4|mov|pptx)$/i.test(base)) return base;
	} catch {}
	return "digital-product-selling-course";
}
async function downloadCourse(request) {
	if (!isAllowedCountry(countryFromHeaders(request.headers))) return new Response("This unlock is only available for US and UK visitors", {
		status: 403,
		headers: {
			"content-type": "text/plain; charset=utf-8",
			"cache-control": "no-store"
		}
	});
	const visitorId = readDownloadToken(new URL(request.url).searchParams.get("token") ?? "");
	if (!visitorId) return new Response("Download link expired", {
		status: 401,
		headers: {
			"content-type": "text/plain; charset=utf-8",
			"cache-control": "no-store"
		}
	});
	if (!await (await getGrantStore()).isUnlocked(visitorId)) return new Response("Course is locked", {
		status: 403,
		headers: {
			"content-type": "text/plain; charset=utf-8",
			"cache-control": "no-store"
		}
	});
	const courseUrl = process.env.COURSE_DOWNLOAD_URL?.trim() ?? "";
	if (!courseUrl.startsWith("https://")) return new Response("Course file is not configured", {
		status: 404,
		headers: {
			"content-type": "text/plain; charset=utf-8",
			"cache-control": "no-store"
		}
	});
	const upstream = await fetch(courseUrl, { redirect: "follow" });
	if (!upstream.ok || !upstream.body) return new Response("Course file could not be fetched", {
		status: 502,
		headers: {
			"content-type": "text/plain; charset=utf-8",
			"cache-control": "no-store"
		}
	});
	const headers = new Headers({
		"content-type": upstream.headers.get("content-type") || "application/octet-stream",
		"content-disposition": `attachment; filename="${courseFilename()}"`,
		"cache-control": "no-store",
		"x-content-type-options": "nosniff"
	});
	const length = upstream.headers.get("content-length");
	if (length) headers.set("content-length", length);
	return new Response(upstream.body, {
		status: 200,
		headers
	});
}
//#endregion
export { downloadCourse, geoPayload, unlockStatus };
