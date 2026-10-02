import path from "node:path";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
//#region node_modules/.nitro/vite/services/ssr/assets/json-store-DdzJdXOd.js
var globalRef = globalThis;
function emptyFile() {
	return {
		transactions: {},
		grants: {}
	};
}
function defaultPath() {
	const override = process.env.GRANT_STORE_PATH?.trim();
	if (override) return override;
	return path.join(process.cwd(), "data", "unlock-grants.json");
}
function keyOf(input) {
	return `${input.provider}:${input.transactionId}`;
}
async function readGrants(filePath) {
	try {
		const raw = await readFile(filePath, "utf8");
		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object" || !parsed.transactions || !parsed.grants) throw new Error("grant file is not a grant store");
		return parsed;
	} catch (error) {
		if (error.code === "ENOENT") return emptyFile();
		throw error;
	}
}
async function writeGrants(filePath, data) {
	await mkdir(path.dirname(filePath), { recursive: true });
	const tmp = `${filePath}.${process.pid}.tmp`;
	await writeFile(tmp, JSON.stringify(data), "utf8");
	await rename(tmp, filePath);
}
function locked(fn) {
	const run = (globalRef.__unlockJsonChain ?? Promise.resolve()).then(fn, fn);
	globalRef.__unlockJsonChain = run.then(() => void 0, () => void 0);
	return run;
}
function createJsonGrantStore(filePath = defaultPath()) {
	return {
		complete(input) {
			return locked(async () => {
				const data = await readGrants(filePath);
				const key = keyOf(input);
				if (data.transactions[key]) return "duplicate";
				data.transactions[key] = {
					provider: input.provider,
					transactionId: input.transactionId,
					visitorId: input.visitorId,
					revenue: input.revenue,
					kind: "completed",
					at: (/* @__PURE__ */ new Date()).toISOString()
				};
				data.grants[input.visitorId] = {
					provider: input.provider,
					transactionId: input.transactionId,
					grantedAt: (/* @__PURE__ */ new Date()).toISOString()
				};
				await writeGrants(filePath, data);
				return "granted";
			});
		},
		reverse(input) {
			return locked(async () => {
				const data = await readGrants(filePath);
				const key = keyOf(input);
				data.transactions[key] = {
					provider: input.provider,
					transactionId: input.transactionId,
					visitorId: input.visitorId,
					revenue: input.revenue,
					kind: "reversed",
					at: data.transactions[key]?.at ?? (/* @__PURE__ */ new Date()).toISOString()
				};
				delete data.grants[input.visitorId];
				await writeGrants(filePath, data);
			});
		},
		isUnlocked(visitorId) {
			return locked(async () => {
				const data = await readGrants(filePath);
				return Boolean(data.grants[visitorId]);
			});
		}
	};
}
//#endregion
export { createJsonGrantStore };
