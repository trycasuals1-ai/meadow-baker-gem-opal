import { o as __toESM } from "../_runtime.mjs";
import { J as require_react, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as cleanVisitorId } from "./ids-DsE-Wv_K.mjs";
import { n as Lock, r as Download } from "../_libs/lucide-react.mjs";
import { t as SiteFrame } from "./site-frame-C2x9FWhS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-vDQNOafS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KEY = "courseunlock.uid";
function visitorId() {
	try {
		const existing = cleanVisitorId(localStorage.getItem(KEY));
		if (existing) return existing;
	} catch {}
	const id = crypto.randomUUID();
	try {
		localStorage.setItem(KEY, id);
	} catch {}
	return id;
}
function bitlabsWallUrl(token, visitorId) {
	const url = new URL("https://web.bitlabs.ai/");
	url.searchParams.set("uid", visitorId);
	url.searchParams.set("token", token);
	return url.toString();
}
function lootablyWallUrl(placementId, visitorId) {
	const url = new URL("https://wall.lootably.com/");
	url.searchParams.set("placementID", placementId);
	url.searchParams.set("sid", visitorId);
	return url.toString();
}
var POLL_MS = 8e3;
function UnlockPanel() {
	const [geo, setGeo] = (0, import_react.useState)({ state: "loading" });
	const [uid, setUid] = (0, import_react.useState)(null);
	const [wall, setWall] = (0, import_react.useState)(null);
	const [unlock, setUnlock] = (0, import_react.useState)({ state: "idle" });
	(0, import_react.useEffect)(() => {
		setUid(visitorId());
		const controller = new AbortController();
		fetch("/api/geo", {
			signal: controller.signal,
			cache: "no-store"
		}).then(async (response) => {
			if (!response.ok) throw new Error("geo failed");
			const body = await response.json();
			setGeo({
				state: "ready",
				allowed: body.allowed === true,
				country: body.country ?? null,
				bitlabsToken: body.bitlabsToken ?? null,
				lootablyPlacementId: body.lootablyPlacementId ?? null
			});
		}).catch((error) => {
			if (error instanceof DOMException && error.name === "AbortError") return;
			setGeo({ state: "error" });
		});
		return () => controller.abort();
	}, []);
	const allowed = geo.state === "ready" && geo.allowed;
	const unlocked = unlock.state === "ready";
	(0, import_react.useEffect)(() => {
		if (!allowed || !uid || unlocked) return;
		let cancelled = false;
		const check = async () => {
			try {
				const response = await fetch(`/api/unlock-status?uid=${encodeURIComponent(uid)}`, { cache: "no-store" });
				if (!response.ok) throw new Error("status failed");
				const body = await response.json();
				if (cancelled) return;
				if (body.unlocked) {
					setUnlock({
						state: "ready",
						downloadPath: body.downloadPath ?? null
					});
					setWall(null);
					return;
				}
				setUnlock({ state: "locked" });
			} catch {
				if (!cancelled) setUnlock({ state: "error" });
			}
		};
		check();
		if (!wall) return () => {
			cancelled = true;
		};
		const timer = window.setInterval(() => void check(), POLL_MS);
		return () => {
			cancelled = true;
			window.clearInterval(timer);
		};
	}, [
		allowed,
		uid,
		wall,
		unlocked
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-8",
		"aria-live": "polite",
		children: [
			geo.state === "loading" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted",
				children: "Checking this visit…"
			}) : null,
			geo.state === "error" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-xl bg-card px-4 py-4 text-ink panel",
				children: "This visit could not be checked. The task wall stays closed."
			}) : null,
			geo.state === "ready" && !geo.allowed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-xl bg-card px-5 py-5 panel",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-2xl text-balance text-ink",
					children: "This unlock is only available for US and UK visitors"
				})
			}) : null,
			geo.state === "ready" && geo.allowed && unlock.state !== "ready" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfferChoice, {
				bitlabsToken: geo.bitlabsToken,
				lootablyPlacementId: geo.lootablyPlacementId,
				wall,
				uid,
				status: unlock.state,
				onOpen: setWall,
				onClose: () => setWall(null)
			}) : null,
			unlock.state === "ready" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DownloadReady, { downloadPath: unlock.downloadPath }) : null
		]
	});
}
function OfferChoice({ bitlabsToken, lootablyPlacementId, wall, uid, status, onOpen, onClose }) {
	const hasBitlabs = Boolean(bitlabsToken);
	const hasLootably = Boolean(lootablyPlacementId);
	if (!hasBitlabs && !hasLootably) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "rounded-xl bg-card px-5 py-5 text-ink panel",
		children: "No partner wall is connected on this server yet. The course stays locked until a verified completion arrives."
	});
	if (!wall || !uid) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3 sm:flex-row",
		children: [hasBitlabs ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "min-h-12 flex-1 rounded-lg bg-ink px-4 text-base font-semibold text-paper",
			onClick: () => onOpen("bitlabs"),
			children: "BitLabs"
		}) : null, hasLootably ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "min-h-12 flex-1 rounded-lg bg-ink px-4 text-base font-semibold text-paper",
			onClick: () => onOpen("lootably"),
			children: "Lootably"
		}) : null]
	});
	const src = wall === "bitlabs" && bitlabsToken ? bitlabsWallUrl(bitlabsToken, uid) : wall === "lootably" && lootablyPlacementId ? lootablyWallUrl(lootablyPlacementId, uid) : null;
	if (!src) return null;
	const label = wall === "bitlabs" ? "BitLabs" : "Lootably";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "overflow-hidden rounded-2xl bg-card p-2 panel",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3 px-2 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold text-ink",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "inline-flex min-h-11 items-center rounded-lg px-3 text-sm text-muted",
					onClick: onClose,
					children: "Close"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
				title: `${label} tasks`,
				src,
				className: "h-[70dvh] min-h-[32rem] w-full rounded-xl bg-paper"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-3 py-3 text-sm text-pretty text-muted",
				children: status === "error" ? "The status check failed. This page will try again. The course is still locked." : "Waiting for the partner to confirm. This page checks every 8 seconds. Opening the wall does not unlock the course."
			})
		]
	});
}
function DownloadReady({ downloadPath }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-ok-soft px-5 py-5 text-ink panel",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-2xl text-balance",
				children: "The partner confirmed one completed task."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-pretty text-muted",
				children: "The course is unlocked on this page. No fee."
			}),
			downloadPath ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				href: downloadPath,
				className: "mt-5 inline-flex min-h-12 items-center gap-2 rounded-lg bg-ok px-4 font-semibold text-paper",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
					className: "size-4",
					"aria-hidden": "true"
				}), "Download the course"]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-pretty",
				children: "The completion is verified, but the course file is not attached on the server yet."
			})
		]
	});
}
function LockedMark() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "inline-flex size-11 items-center justify-center rounded-lg bg-accent-soft text-accent",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, {
			className: "size-5",
			"aria-hidden": "true"
		})
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SiteFrame, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockedMark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "pt-2 text-sm font-semibold tracking-wide text-muted uppercase",
				children: "CourseUnlock"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-6 font-display text-4xl leading-tight text-balance text-ink sm:text-5xl",
			children: "Digital product selling course"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-5 max-w-2xl text-lg leading-relaxed text-pretty text-muted",
			children: "US and UK only. Complete one partner survey or one offer. When the partner confirms completion, the course unlocks on this page. No fee. Opening this page does not unlock the course."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
			className: "mt-8 grid gap-3 text-sm sm:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-xl bg-card px-4 py-4 panel",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-lg text-ink",
						children: "1"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-pretty text-muted",
						children: "The visit must be in the US or the UK."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-xl bg-card px-4 py-4 panel",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-lg text-ink",
						children: "2"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-pretty text-muted",
						children: "One survey or one offer. Not two."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-xl bg-card px-4 py-4 panel",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-lg text-ink",
						children: "3"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-pretty text-muted",
						children: "The download appears only after the partner’s server confirms it."
					})]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnlockPanel, {})
	] });
}
//#endregion
export { Home as component };
