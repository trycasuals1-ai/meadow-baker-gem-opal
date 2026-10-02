//#region node_modules/.nitro/vite/services/ssr/assets/public-env.server-zU9HbqF5.js
function read(name) {
	const value = process.env[name]?.trim() ?? "";
	if (!value || value.length > 200) return null;
	return value;
}
function contactEmail() {
	const value = read("CONTACT_EMAIL");
	if (!value || !value.includes("@")) return null;
	return value;
}
function bitlabsAppToken() {
	return read("BITLABS_APP_TOKEN");
}
function lootablyPlacementId() {
	return read("LOOTABLY_PLACEMENT_ID");
}
//#endregion
export { bitlabsAppToken, contactEmail, lootablyPlacementId };
