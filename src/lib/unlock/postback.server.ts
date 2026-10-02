import { decideBitlabs, decideLootably, type Decision } from "./decide.ts";
import { partnerText } from "./respond.ts";
import { getGrantStore } from "./store.ts";

function secret(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

async function apply(provider: "bitlabs" | "lootably", decision: Decision): Promise<Response> {
  const success = provider === "lootably" ? "1" : "OK";
  const failure = "0";
  if (!decision.ok) return partnerText(failure, decision.status);
  if (decision.action === "ignore") return partnerText(success, 200);
  try {
    const store = await getGrantStore();
    const tx = {
      provider,
      transactionId: decision.transactionId,
      visitorId: decision.visitorId,
      revenue: decision.revenue,
    };
    if (decision.action === "grant") {
      const result = await store.complete(tx);
      console.info(`[unlock] ${provider} ${result} tx=${decision.transactionId}`);
    } else {
      await store.reverse(tx);
      console.info(`[unlock] ${provider} reversed tx=${decision.transactionId}`);
    }
    return partnerText(success, 200);
  } catch (error) {
    console.error(`[unlock] ${provider} store error`, error);
    return partnerText(failure, 500);
  }
}

export function handleBitlabsPostback(request: Request): Promise<Response> {
  if (request.method !== "GET") return Promise.resolve(partnerText("0", 405));
  return apply("bitlabs", decideBitlabs(request, secret("BITLABS_SECRET_KEY")));
}

export function handleLootablyPostback(request: Request): Promise<Response> {
  if (request.method !== "GET") return Promise.resolve(partnerText("0", 405));
  const params = new URL(request.url).searchParams;
  return apply("lootably", decideLootably(params, secret("LOOTABLY_SECRET_KEY")));
}
