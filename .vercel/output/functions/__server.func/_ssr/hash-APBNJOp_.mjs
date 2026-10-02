import { createHash, createHmac, timingSafeEqual } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/hash-APBNJOp_.js
var NO_STORE = {
	"cache-control": "no-store",
	"content-type": "text/plain; charset=utf-8"
};
function partnerText(body, status) {
	return new Response(body, {
		status,
		headers: NO_STORE
	});
}
function jsonBody(body, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			"content-type": "application/json",
			"cache-control": "no-store"
		}
	});
}
async function getGrantStore() {
	if (process.env.DATABASE_URL?.trim()) {
		const { createPostgresGrantStore } = await import("./postgres-store-r8ZJh9ei.mjs");
		return createPostgresGrantStore();
	}
	const { createJsonGrantStore } = await import("./json-store-DdzJdXOd.mjs");
	return createJsonGrantStore();
}
function safeEqual(a, b) {
	const left = Buffer.from(a);
	const right = Buffer.from(b);
	if (left.length === 0 || left.length !== right.length) return false;
	return timingSafeEqual(left, right);
}
function safeEqualHex(a, b) {
	return safeEqual(a.toLowerCase(), b.toLowerCase());
}
/** Lootably: SHA-256 of userID + ip + revenue + currencyReward + secret. */
function lootablyHash(parts) {
	return createHash("sha256").update(parts.userID + parts.ip + parts.revenue + parts.currencyReward + parts.secret, "utf8").digest("hex");
}
function bitlabsHmac(unsignedUrl, secret) {
	return createHmac("sha1", secret).update(unsignedUrl, "utf8").digest("hex");
}
/**
* BitLabs hashes the callback URL with the hash parameter removed.
* Their sample splits on `&hash=` and treats the hash as the final parameter.
*/
function splitBitlabsUrl(url) {
	const amp = url.indexOf("&hash=");
	const q = url.indexOf("?hash=");
	const idx = amp === -1 ? q : q === -1 ? amp : Math.min(amp, q);
	if (idx <= 0) return null;
	const unsigned = url.slice(0, idx);
	const hash = url.slice(idx + 6).split("&")[0] ?? "";
	if (!/^[a-fA-F0-9]{40}$/.test(hash)) return null;
	return {
		unsigned,
		hash
	};
}
/** Public URL candidates. Proxies often rewrite host; the MAC still uses their secret. */
function bitlabsUrlCandidates(request) {
	const raw = request.url;
	const parsed = new URL(raw);
	const queryAt = raw.indexOf("?");
	const search = queryAt === -1 ? "" : raw.slice(queryAt);
	const hosts = /* @__PURE__ */ new Set();
	const addHost = (value) => {
		const host = value?.split(",")[0]?.trim();
		if (host) hosts.add(host);
	};
	addHost(request.headers.get("x-forwarded-host"));
	addHost(request.headers.get("host"));
	if (parsed.host) hosts.add(parsed.host);
	const protos = /* @__PURE__ */ new Set();
	const addProto = (value) => {
		const proto = value?.split(",")[0]?.trim().replace(/:$/, "");
		if (proto === "http" || proto === "https") protos.add(proto);
	};
	addProto(request.headers.get("x-forwarded-proto"));
	addProto(parsed.protocol);
	protos.add("https");
	const urls = /* @__PURE__ */ new Set([raw]);
	for (const proto of protos) for (const host of hosts) urls.add(`${proto}://${host}${parsed.pathname}${search}`);
	return [...urls];
}
function verifyBitlabsHash(request, secret) {
	if (!secret) return false;
	for (const candidate of bitlabsUrlCandidates(request)) {
		const split = splitBitlabsUrl(candidate);
		if (!split) continue;
		if (safeEqualHex(bitlabsHmac(split.unsigned, secret), split.hash)) return true;
	}
	return false;
}
//#endregion
export { safeEqual as a, partnerText as i, jsonBody as n, safeEqualHex as o, lootablyHash as r, verifyBitlabsHash as s, getGrantStore as t };
