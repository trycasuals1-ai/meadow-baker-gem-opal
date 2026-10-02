import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as Route$6 } from "./router-Z_u6qhH0.mjs";
import { t as SiteFrame } from "./site-frame-C2x9FWhS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/privacy-D4oSSvmX.js
var import_jsx_runtime = require_jsx_runtime();
function PrivacyPage() {
	const { contactEmail } = Route$6.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SiteFrame, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
		className: "font-display text-4xl text-balance text-ink",
		children: "Privacy"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6 space-y-4 text-base leading-relaxed text-pretty text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "The course is free to the user. There is no fee to unlock it." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Unlock requires one completed partner task. BitLabs and Lootably process that task. This site sends them a random id stored in this browser so their confirmation can be matched to this page. It does not ask you to create an account." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "This site does not sell the user’s course file to advertisers." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "A partner postback may include a transaction id and the publisher revenue for that completion. Those values are kept only to record the grant and to ignore duplicate notices. A reversal or chargeback removes the grant." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "The course file address stays on the server. The page does not include it before unlock." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Contact, { email: contactEmail })
		]
	})] });
}
function Contact({ email }) {
	if (!email) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "The publisher has not published a contact email yet." });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
		"Contact:",
		" ",
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
			className: "text-accent underline underline-offset-4",
			href: `mailto:${email}`,
			children: email
		})
	] });
}
//#endregion
export { PrivacyPage as component };
