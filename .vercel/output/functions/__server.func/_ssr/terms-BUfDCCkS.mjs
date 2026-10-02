import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Route$5 } from "./router-Z_u6qhH0.mjs";
import { t as SiteFrame } from "./site-frame-C2x9FWhS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/terms-BUfDCCkS.js
var import_jsx_runtime = require_jsx_runtime();
function TermsPage() {
	const { contactEmail } = Route$5.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SiteFrame, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
		className: "font-display text-4xl text-balance text-ink",
		children: "Terms"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6 space-y-4 text-base leading-relaxed text-pretty text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "The course is free to the user. Opening this page does not unlock it, and there is no fee." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Unlock requires one completed partner task. BitLabs and Lootably process the task. One successful completion is enough. A second task is not required." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "The course unlocks only after this site verifies the partner’s server postback. Clicking a button, loading the task wall, or saying the task is finished does not unlock it." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "This unlock is only available for US and UK visitors. If the partner sends a reversal or chargeback, the grant is removed." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "This site does not sell the user’s course file to advertisers." }),
			contactEmail ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"Contact:",
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					className: "text-accent underline underline-offset-4",
					href: `mailto:${contactEmail}`,
					children: contactEmail
				})
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "The publisher has not published a contact email yet." })
		]
	})] });
}
//#endregion
export { TermsPage as component };
