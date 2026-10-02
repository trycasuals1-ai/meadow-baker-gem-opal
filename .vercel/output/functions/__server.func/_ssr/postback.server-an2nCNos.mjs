import { i as partnerText, o as safeEqualHex, r as lootablyHash, s as verifyBitlabsHash, t as getGrantStore } from "./hash-APBNJOp_.mjs";
import { i as signedRevenue, n as cleanVisitorId, r as positiveRevenue, t as cleanTransactionId } from "./ids-DsE-Wv_K.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/postback.server-an2nCNos.js
var REVERSAL = /* @__PURE__ */ new Set([
	"reconciliation",
	"reconciled",
	"chargeback",
	"reversal",
	"reversed"
]);
var COMPLETE = /* @__PURE__ */ new Set([
	"complete",
	"completed",
	"none"
]);
function firstParam(params, names) {
	const wanted = new Set(names.map((name) => name.toLowerCase()));
	for (const [key, value] of params) {
		if (!wanted.has(key.toLowerCase())) continue;
		const trimmed = value.trim();
		if (trimmed) return trimmed;
	}
	return null;
}
function stateValues(params) {
	const names = /* @__PURE__ */ new Set([
		"type",
		"activity",
		"activity_type",
		"offer_state",
		"offerstate"
	]);
	const values = [];
	for (const [key, value] of params) {
		if (!names.has(key.toLowerCase())) continue;
		const trimmed = value.trim().toLowerCase();
		if (trimmed) values.push(trimmed);
	}
	return values;
}
function flagOn(value) {
	if (!value) return false;
	const flag = value.trim().toLowerCase();
	return flag === "1" || flag === "true" || flag === "yes";
}
function decideLootably(params, secret) {
	if (!secret) return {
		ok: false,
		status: 503
	};
	const userID = params.get("userID") ?? "";
	const ip = params.get("ip") ?? "";
	const revenue = params.get("revenue") ?? "";
	const currencyReward = params.get("currencyReward") ?? "";
	const hash = params.get("hash") ?? "";
	if (!hash) return {
		ok: false,
		status: 403
	};
	const expected = lootablyHash({
		userID,
		ip,
		revenue,
		currencyReward,
		secret
	});
	if (!safeEqualHex(expected, hash)) return {
		ok: false,
		status: 403
	};
	const visitorId = cleanVisitorId(userID);
	const transactionId = cleanTransactionId(params.get("transactionID"));
	if (!visitorId || !transactionId) return {
		ok: false,
		status: 400
	};
	const status = (params.get("status") ?? "").trim().toLowerCase();
	if (status === "0" || REVERSAL.has(status) || flagOn(params.get("reversal")) || flagOn(params.get("chargeback"))) return {
		ok: true,
		action: "reverse",
		visitorId,
		transactionId,
		revenue: revenue || "0"
	};
	const payable = positiveRevenue(revenue);
	if (!payable) return {
		ok: true,
		action: "ignore"
	};
	if (status && status !== "1" && !COMPLETE.has(status)) return {
		ok: true,
		action: "ignore"
	};
	return {
		ok: true,
		action: "grant",
		visitorId,
		transactionId,
		revenue: payable
	};
}
function decideBitlabs(request, secret) {
	if (!secret) return {
		ok: false,
		status: 503
	};
	if (!verifyBitlabsHash(request, secret)) return {
		ok: false,
		status: 403
	};
	const params = new URL(request.url).searchParams;
	const visitorId = cleanVisitorId(firstParam(params, [
		"uid",
		"user_id",
		"userid"
	]));
	const transactionId = cleanTransactionId(firstParam(params, [
		"tx",
		"transaction_id",
		"transactionid"
	]));
	if (!visitorId || !transactionId) return {
		ok: false,
		status: 400
	};
	const revenueRaw = firstParam(params, [
		"raw",
		"value_usd",
		"usd",
		"revenue",
		"payout"
	]);
	const amount = signedRevenue(revenueRaw);
	const states = stateValues(params);
	if (states.some((state) => REVERSAL.has(state)) || amount != null && amount < 0) return {
		ok: true,
		action: "reverse",
		visitorId,
		transactionId,
		revenue: revenueRaw ?? "0"
	};
	if (states.filter((state) => !COMPLETE.has(state)).length > 0) return {
		ok: true,
		action: "ignore"
	};
	const payable = positiveRevenue(revenueRaw);
	if (!payable) return {
		ok: true,
		action: "ignore"
	};
	return {
		ok: true,
		action: "grant",
		visitorId,
		transactionId,
		revenue: payable
	};
}
function secret(name) {
	return process.env[name]?.trim() || void 0;
}
async function apply(provider, decision) {
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
			revenue: decision.revenue
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
function handleBitlabsPostback(request) {
	if (request.method !== "GET") return Promise.resolve(partnerText("0", 405));
	return apply("bitlabs", decideBitlabs(request, secret("BITLABS_SECRET_KEY")));
}
function handleLootablyPostback(request) {
	if (request.method !== "GET") return Promise.resolve(partnerText("0", 405));
	const params = new URL(request.url).searchParams;
	return apply("lootably", decideLootably(params, secret("LOOTABLY_SECRET_KEY")));
}
//#endregion
export { handleBitlabsPostback, handleLootablyPostback };
