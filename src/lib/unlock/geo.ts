/** ISO country from the edge. Fail closed: unknown is not US/GB. */

const COUNTRY_HEADERS = ["x-vercel-ip-country", "cf-ipcountry"] as const;

export function normalizeCountry(raw: string): string | null {
  const token = raw.split(",")[0]?.trim().toUpperCase() ?? "";
  const code = token === "UK" ? "GB" : token;
  if (!/^[A-Z]{2}$/.test(code)) return null;
  return code;
}

export function countryFromHeaders(headers: Headers): string | null {
  for (const name of COUNTRY_HEADERS) {
    const raw = headers.get(name);
    if (!raw) continue;
    const code = normalizeCountry(raw);
    if (code) return code;
  }
  return null;
}

/** Vercel sends GB for the United Kingdom. Pakistan and everyone else stay closed. */
export function isAllowedCountry(country: string | null): boolean {
  return country === "US" || country === "GB";
}
