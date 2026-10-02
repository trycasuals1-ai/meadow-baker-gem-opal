import { verifyBitlabsHash, lootablyHash, safeEqualHex } from "./hash.ts";
import { cleanTransactionId, cleanVisitorId, positiveRevenue, signedRevenue } from "./ids.ts";

export type GrantDecision = {
  ok: true;
  action: "grant" | "reverse";
  visitorId: string;
  transactionId: string;
  revenue: string;
};

export type Decision =
  | GrantDecision
  | { ok: true; action: "ignore" }
  | { ok: false; status: number };

const REVERSAL = new Set([
  "reconciliation",
  "reconciled",
  "chargeback",
  "reversal",
  "reversed",
]);

const COMPLETE = new Set(["complete", "completed", "none"]);

function firstParam(params: URLSearchParams, names: string[]): string | null {
  const wanted = new Set(names.map((name) => name.toLowerCase()));
  for (const [key, value] of params) {
    if (!wanted.has(key.toLowerCase())) continue;
    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }
  return null;
}

function stateValues(params: URLSearchParams): string[] {
  const names = new Set(["type", "activity", "activity_type", "offer_state", "offerstate"]);
  const values: string[] = [];
  for (const [key, value] of params) {
    if (!names.has(key.toLowerCase())) continue;
    const trimmed = value.trim().toLowerCase();
    if (trimmed) values.push(trimmed);
  }
  return values;
}

function flagOn(value: string | null): boolean {
  if (!value) return false;
  const flag = value.trim().toLowerCase();
  return flag === "1" || flag === "true" || flag === "yes";
}

export function decideLootably(params: URLSearchParams, secret: string | undefined): Decision {
  if (!secret) return { ok: false, status: 503 };
  const userID = params.get("userID") ?? "";
  const ip = params.get("ip") ?? "";
  const revenue = params.get("revenue") ?? "";
  const currencyReward = params.get("currencyReward") ?? "";
  const hash = params.get("hash") ?? "";
  if (!hash) return { ok: false, status: 403 };
  const expected = lootablyHash({ userID, ip, revenue, currencyReward, secret });
  if (!safeEqualHex(expected, hash)) return { ok: false, status: 403 };

  const visitorId = cleanVisitorId(userID);
  const transactionId = cleanTransactionId(params.get("transactionID"));
  if (!visitorId || !transactionId) return { ok: false, status: 400 };

  const status = (params.get("status") ?? "").trim().toLowerCase();
  const reversal =
    status === "0" ||
    REVERSAL.has(status) ||
    flagOn(params.get("reversal")) ||
    flagOn(params.get("chargeback"));
  if (reversal) {
    return { ok: true, action: "reverse", visitorId, transactionId, revenue: revenue || "0" };
  }

  const payable = positiveRevenue(revenue);
  if (!payable) return { ok: true, action: "ignore" };
  if (status && status !== "1" && !COMPLETE.has(status)) return { ok: true, action: "ignore" };
  return { ok: true, action: "grant", visitorId, transactionId, revenue: payable };
}

export function decideBitlabs(request: Request, secret: string | undefined): Decision {
  if (!secret) return { ok: false, status: 503 };
  if (!verifyBitlabsHash(request, secret)) return { ok: false, status: 403 };

  const params = new URL(request.url).searchParams;
  const visitorId = cleanVisitorId(firstParam(params, ["uid", "user_id", "userid"]));
  const transactionId = cleanTransactionId(
    firstParam(params, ["tx", "transaction_id", "transactionid"]),
  );
  if (!visitorId || !transactionId) return { ok: false, status: 400 };

  const revenueRaw = firstParam(params, ["raw", "value_usd", "usd", "revenue", "payout"]);
  const amount = signedRevenue(revenueRaw);
  const states = stateValues(params);
  const reversal = states.some((state) => REVERSAL.has(state)) || (amount != null && amount < 0);
  if (reversal) {
    return {
      ok: true,
      action: "reverse",
      visitorId,
      transactionId,
      revenue: revenueRaw ?? "0",
    };
  }

  const blocking = states.filter((state) => !COMPLETE.has(state));
  if (blocking.length > 0) return { ok: true, action: "ignore" };

  const payable = positiveRevenue(revenueRaw);
  if (!payable) return { ok: true, action: "ignore" };
  return { ok: true, action: "grant", visitorId, transactionId, revenue: payable };
}
