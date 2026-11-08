"use client";

import { useEffect } from "react";

/**
 * Works around a firefox bug with scroll anchoring. On back/forward, the router shows the restored page - kept hidden
 * with `display: none` by react's `<Activity>` - synchronously inside the `popstate` event, and the browser then
 * restores the scroll position. Firefox, unless a reflow happens in between, ends up scrolled to the very end of the
 * document instead - e.g. going back to the home page lands on the footer. Chrome and Safari are not affected.
 * Anchoring is switched off on the root scroller until the restore has painted. This works whether the listener runs
 * before or after the router's own.
 */
export function HistoryScrollAnchoringFix(): null {
	useEffect(() => {
		const root = document.documentElement;
		let frame: number | null = null;

		function onPopState() {
			root.style.overflowAnchor = "none";
			if (frame != null) {
				cancelAnimationFrame(frame);
			}
			frame = requestAnimationFrame(() => {
				frame = requestAnimationFrame(() => {
					frame = null;
					root.style.overflowAnchor = "";
				});
			});
		}

		window.addEventListener("popstate", onPopState);

		return () => {
			window.removeEventListener("popstate", onPopState);
			if (frame != null) {
				cancelAnimationFrame(frame);
			}
			root.style.overflowAnchor = "";
		};
	}, []);

	return null;
}
