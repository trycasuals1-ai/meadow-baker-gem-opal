import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length === 0 || left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function safeEqualHex(a: string, b: string): boolean {
  return safeEqual(a.toLowerCase(), b.toLowerCase());
}

/** Lootably: SHA-256 of userID + ip + revenue + currencyReward + secret. */
export function lootablyHash(parts: {
  userID: string;
  ip: string;
  revenue: string;
  currencyReward: string;
  secret: string;
}): string {
  return createHash("sha256")
    .update(
      parts.userID + parts.ip + parts.revenue + parts.currencyReward + parts.secret,
      "utf8",
    )
    .digest("hex");
}

export function bitlabsHmac(unsignedUrl: string, secret: string): string {
  return createHmac("sha1", secret).update(unsignedUrl, "utf8").digest("hex");
}

/**
 * BitLabs hashes the callback URL with the hash parameter removed.
 * Their sample splits on `&hash=` and treats the hash as the final parameter.
 */
export function splitBitlabsUrl(url: string): { unsigned: string; hash: string } | null {
  const amp = url.indexOf("&hash=");
  const q = url.indexOf("?hash=");
  const idx = amp === -1 ? q : q === -1 ? amp : Math.min(amp, q);
  if (idx <= 0) return null;
  const unsigned = url.slice(0, idx);
  const hash = url.slice(idx + "&hash=".length).split("&")[0] ?? "";
  if (!/^[a-fA-F0-9]{40}$/.test(hash)) return null;
  return { unsigned, hash };
}

/** Public URL candidates. Proxies often rewrite host; the MAC still uses their secret. */
export function bitlabsUrlCandidates(request: Request): string[] {
  const raw = request.url;
  const parsed = new URL(raw);
  const queryAt = raw.indexOf("?");
  const search = queryAt === -1 ? "" : raw.slice(queryAt);
  const hosts = new Set<string>();
  const addHost = (value: string | null) => {
    const host = value?.split(",")[0]?.trim();
    if (host) hosts.add(host);
  };
  addHost(request.headers.get("x-forwarded-host"));
  addHost(request.headers.get("host"));
  if (parsed.host) hosts.add(parsed.host);

  const protos = new Set<string>();
  const addProto = (value: string | null) => {
    const proto = value?.split(",")[0]?.trim().replace(/:$/, "");
    if (proto === "http" || proto === "https") protos.add(proto);
  };
  addProto(request.headers.get("x-forwarded-proto"));
  addProto(parsed.protocol);
  protos.add("https");

  const urls = new Set<string>([raw]);
  for (const proto of protos) {
    for (const host of hosts) {
      urls.add(`${proto}://${host}${parsed.pathname}${search}`);
    }
  }
  return [...urls];
}

export function verifyBitlabsHash(request: Request, secret: string): boolean {
  if (!secret) return false;
  for (const candidate of bitlabsUrlCandidates(request)) {
    const split = splitBitlabsUrl(candidate);
    if (!split) continue;
    if (safeEqualHex(bitlabsHmac(split.unsigned, secret), split.hash)) return true;
  }
  return false;
}
