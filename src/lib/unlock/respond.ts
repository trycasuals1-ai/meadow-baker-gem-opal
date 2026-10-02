const NO_STORE = {
  "cache-control": "no-store",
  "content-type": "text/plain; charset=utf-8",
} as const;

export function partnerText(body: string, status: number): Response {
  return new Response(body, { status, headers: NO_STORE });
}

export function jsonBody(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
