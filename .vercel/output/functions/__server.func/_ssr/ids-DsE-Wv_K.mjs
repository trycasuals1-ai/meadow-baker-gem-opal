//#region node_modules/.nitro/vite/services/ssr/assets/ids-DsE-Wv_K.js
var VISITOR = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function cleanVisitorId(value) {
	if (!value) return null;
	const id = value.trim().toLowerCase();
	if (!VISITOR.test(id)) return null;
	return id;
}
function cleanTransactionId(value) {
	if (!value) return null;
	const id = value.trim();
	if (id.length < 1 || id.length > 128) return null;
	if (!/^[\w.:~+-]+$/.test(id)) return null;
	return id;
}
/** Publisher revenue as a decimal string. Rejects junk and non-positive amounts. */
function positiveRevenue(value) {
	if (value == null) return null;
	const raw = value.trim();
	if (!/^\d+(\.\d+)?$/.test(raw)) return null;
	const amount = Number(raw);
	if (!Number.isFinite(amount) || amount <= 0) return null;
	return raw;
}
function signedRevenue(value) {
	if (value == null) return null;
	const raw = value.trim();
	if (!/^-?\d+(\.\d+)?$/.test(raw)) return null;
	const amount = Number(raw);
	if (!Number.isFinite(amount)) return null;
	return amount;
}
//#endregion
export { signedRevenue as i, cleanVisitorId as n, positiveRevenue as r, cleanTransactionId as t };
