"use client";

import { useEffect, useRef } from "react";

import { trackEvent, trackSiteSearch } from "#/lib/analytics/matomo.ts";
import { type SearchPage, type SearchState, getSearchCommands } from "#/lib/analytics/search.ts";

/** How long the page's state has to stay the same before it is tracked. */
const delay = 1500;

interface SearchTrackerProps {
	/** Identifies the page in Matomo's reports. */
	name: SearchPage;
	/** `null` while the results for the current url are loading, or when the search failed. */
	state: SearchState | null;
}

/**
 * Tracks with Matomo how a list page is used - searches, filters and paging, see `getSearchCommands` - none of which is
 * a page view: `PageViewTracker` tracks one when the user arrives on the page, not when its search params change.
 *
 * The state is tracked once it has stayed the same for a moment, since the search form updates the url as the user
 * types: "d", "di" and "dig" are not searches. A state still pending is tracked right away when the user leaves the
 * page, e.g. following a result, which may well be quicker than the delay.
 *
 * Stays mounted while results load, so it remembers what it tracked last. Pass only valid filter values: those the
 * index knows, not whatever a url says.
 */
export function SearchTracker(props: Readonly<SearchTrackerProps>): null {
	const { name, state } = props;

	/** The props are new objects with every render; the effect should only run when they say something new. */
	const key = state != null ? JSON.stringify(state) : null;

	const trackedRef = useRef<SearchState | null>(null);
	const pendingRef = useRef<{ pathname: string; track: () => void } | null>(null);

	useEffect(() => {
		if (key == null) {
			pendingRef.current = null;
			return;
		}

		const next = JSON.parse(key) as SearchState;
		const pending = {
			pathname: window.location.pathname,
			track: () => {
				if (pendingRef.current !== pending) {
					return;
				}
				pendingRef.current = null;

				for (const command of getSearchCommands(name, trackedRef.current, next)) {
					if (command.type === "site-search") {
						trackSiteSearch(command.keyword, command.category, command.count);
					} else {
						trackEvent(command.category, command.action, command.name, command.value);
					}
				}
				trackedRef.current = next;
			},
		};
		pendingRef.current = pending;

		const { track } = pending;
		const timeout = window.setTimeout(track, delay);
		window.addEventListener("pagehide", track);

		return () => {
			window.clearTimeout(timeout);
			window.removeEventListener("pagehide", track);
		};
	}, [key, name]);

	/**
	 * On unmount, a pending state is tracked if the user left the page - before the next page's view, as effects are
	 * cleaned up before new ones run. A state superseded by a new one is never tracked: `pendingRef` holds the new one by
	 * then.
	 */
	useEffect(
		() => () => {
			const pending = pendingRef.current;

			if (pending != null && pending.pathname !== window.location.pathname) {
				pending.track();
			}
		},
		[],
	);

	return null;
}
