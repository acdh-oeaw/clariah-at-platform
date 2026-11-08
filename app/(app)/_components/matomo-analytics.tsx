"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { Fragment, type ReactNode, useEffect } from "react";

import { getPageViewUrl, isNotFound, trackPageView } from "#/lib/analytics/matomo.ts";

interface MatomoAnalyticsProps {
	/** With trailing slash. */
	baseUrl: string;
	id: number;
}

/**
 * Page views are tracked by `PageViewTracker` - including the initial one - since client-side navigations do not reload
 * the tracker script. Commands are queued in `window._paq` until `matomo.js` has loaded. How a list page is used -
 * searches, filters, paging - is tracked by the page itself, see `SearchTracker`.
 */
export function MatomoAnalytics(props: Readonly<MatomoAnalyticsProps>): ReactNode {
	const { baseUrl, id } = props;

	return (
		<Fragment>
			<Script id="matomo" strategy="afterInteractive">
				{`
var _paq = (window._paq = window._paq || []);
_paq.push(["disableCookies"]);
_paq.push(["enableHeartBeatTimer"]);
_paq.push(["enableLinkTracking"]);
_paq.push(["setTrackerUrl", ${JSON.stringify(`${baseUrl}matomo.php`)}]);
_paq.push(["setSiteId", ${JSON.stringify(String(id))}]);
				`}
			</Script>
			<Script async={true} src={`${baseUrl}matomo.js`} strategy="afterInteractive" />
			<PageViewTracker />
		</Fragment>
	);
}

/**
 * A page view is tracked when the user arrives on a page, i.e. when the path changes. Search params changing on the
 * same page - a search typed, a filter toggled, the next page of results - is not a new page view. The params are read
 * from `window.location`, which has been updated by the time the effect runs, for the campaign params of the landing
 * page.
 *
 * The not-found page is tracked by `NotFoundTracker`, whose effect may run after this one - the order of effects across
 * the tree is not something to rely on - so the page view waits for the effects to have run.
 */
function PageViewTracker(): null {
	const pathname = usePathname();

	useEffect(() => {
		const timeout = window.setTimeout(() => {
			if (!isNotFound()) {
				trackPageView(getPageViewUrl(new URL(`${pathname}${window.location.search}`, window.location.origin)));
			}
		}, 0);

		return () => {
			window.clearTimeout(timeout);
		};
	}, [pathname]);

	return null;
}
