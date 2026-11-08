"use client";

import { useEffect } from "react";

/**
 * Works around client-side navigation dying after a page is restored from firefox's back/forward cache. When a click
 * which leaves for another site also updates react state - closing the navigation menu, say - react's scheduler posts a
 * `MessageChannel` message to run that work. Firefox freezes the page before the message is delivered, and drops it, so
 * after restoring the page the scheduler believes its work loop is still running and never schedules another one.
 * Discrete updates, like opening a menu, still render, but transitions - and with them every router navigation - never
 * do. The page is reloaded instead. `persisted` is only set when coming back from another document, never on the
 * router's own back/forward navigation. This deliberately runs in every browser instead of sniffing for firefox:
 * chromium is not affected, and only loses an instant back from another site.
 *
 * @see https://github.com/adobe/react-spectrum/issues/10459
 * @see https://bugzilla.mozilla.org/show_bug.cgi?id=2077455
 */
export function ReloadOnBfcacheRestore(): null {
	useEffect(() => {
		function onPageShow(event: PageTransitionEvent) {
			if (event.persisted) {
				window.location.reload();
			}
		}

		window.addEventListener("pageshow", onPageShow);

		return () => {
			window.removeEventListener("pageshow", onPageShow);
		};
	}, []);

	return null;
}
