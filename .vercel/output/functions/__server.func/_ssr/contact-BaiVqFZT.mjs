import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/contact-BaiVqFZT.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var loadContact_createServerFn_handler = createServerRpc({
	id: "785a80ecfc1ea71556a799f0f971956c5bde32517ab5d29a8537fa07f9e0b4c8",
	name: "loadContact",
	filename: "src/lib/unlock/contact.ts"
}, (opts) => loadContact.__executeServer(opts));
var loadContact = createServerFn({ method: "GET" }).handler(loadContact_createServerFn_handler, async () => {
	const { contactEmail } = await import("./public-env.server-zU9HbqF5.mjs");
	return { contactEmail: contactEmail() };
});
//#endregion
export { loadContact_createServerFn_handler };
