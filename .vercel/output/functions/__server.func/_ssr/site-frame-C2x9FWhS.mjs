import { x as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/site-frame-C2x9FWhS.js
var import_jsx_runtime = require_jsx_runtime();
function SiteFrame({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-paper text-ink",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "border-b border-line",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "font-display text-xl tracking-tight text-ink",
					children: "CourseUnlock"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					className: "flex items-center gap-1 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/privacy",
						className: "inline-flex min-h-11 items-center px-3 text-muted",
						activeProps: { className: "inline-flex min-h-11 items-center px-3 text-ink" },
						children: "Privacy"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/terms",
						className: "inline-flex min-h-11 items-center px-3 text-muted",
						activeProps: { className: "inline-flex min-h-11 items-center px-3 text-ink" },
						children: "Terms"
					})]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "mx-auto max-w-3xl px-5 py-10 sm:py-14",
			children
		})]
	});
}
//#endregion
export { SiteFrame as t };
