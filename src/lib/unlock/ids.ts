const VISITOR =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function cleanVisitorId(value: string | null | undefined): string | null {
  if (!value) return null;
  const id = value.trim().toLowerCase();
  if (!VISITOR.test(id)) return null;
  return id;
}

export function cleanTransactionId(value: string | null | undefined): string | null {
  if (!value) return null;
  const id = value.trim();
  if (id.length < 1 || id.length > 128) return null;
  if (!/^[\w.:~+-]+$/.test(id)) return null;
  return id;
}

/** Publisher revenue as a decimal string. Rejects junk and non-positive amounts. */
export function positiveRevenue(value: string | null | undefined): string | null {
  if (value == null) return null;
  const raw = value.trim();
  if (!/^\d+(\.\d+)?$/.test(raw)) return null;
  const amount = Number(raw);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return raw;
}

export function signedRevenue(value: string | null | undefined): number | null {
  if (value == null) return null;
  const raw = value.trim();
  if (!/^-?\d+(\.\d+)?$/.test(raw)) return null;
  const amount = Number(raw);
  if (!Number.isFinite(amount)) return null;
  return amount;
}
