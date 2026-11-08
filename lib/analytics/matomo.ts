declare global {
	interface Window {
		_paq?: Array<Array<unknown>>;
	}
}

/** Matomo reads a visit's campaign from these, so they are kept in the urls it is sent. */
const campaignParamPrefixes = ["matomo_", "mtm_", "pk_", "utm_"];

/**
 * The url a page view is reported with: the page's path, without its search params - other than a campaign's - so
 * Matomo lists a page once, rather than once for every combination of params, valid or not. What the params say about
 * how a page is used - searches, filters, paging - is tracked separately, see `SearchTracker`.
 */
export function getPageViewUrl(url: URL): string {
	const result = new URL(url.pathname, url.origin);

	for (const [name, value] of url.searchParams) {
		if (campaignParamPrefixes.some((prefix) => name.toLowerCase().startsWith(prefix))) {
			result.searchParams.append(name, value);
		}
	}

	return result.href;
}

/** So each page view is reported with the url the user came from. */
let previousUrl: string | null = null;

/** Commands are queued in `window._paq` until `matomo.js` has loaded. */
function push(...commands: Array<Array<unknown>>): void {
	const _paq = window._paq ?? [];
	window._paq = _paq;

	_paq.push(...commands);
}

/** Searches and events which follow are reported with the page view's url. */
export function trackPageView(url: string, title = document.title): void {
	if (previousUrl != null) {
		push(["setReferrerUrl", previousUrl]);
	}
	push(["setCustomUrl", url], ["setDocumentTitle", title], ["trackPageView"]);

	previousUrl = url;
}

/** The path and search params of the not-found page shown last, see `isNotFound`. */
let notFoundLocation: string | null = null;

function getLocation(): string {
	return `${window.location.pathname}${window.location.search}`;
}

/**
 * Tracks the not-found page's view, with the title Matomo's guide suggests for one - `404/URL = …/From = …` - so its
 * Page titles report lists the urls not found, search params included, and where their links are: the page the user
 * came from on the site, or else the referring site.
 *
 * @see {@link https://matomo.org/faq/how-to/faq_60/}
 */
export function trackNotFound(url: URL): void {
	const location = `${url.pathname}${url.search}`;
	const from = previousUrl ?? document.referrer;

	notFoundLocation = location;
	trackPageView(getPageViewUrl(url), `404/URL = ${encodeURIComponent(location)}/From = ${encodeURIComponent(from)}`);
}

/** Whether the current url showed the not-found page, which `trackNotFound` tracks instead of `PageViewTracker`. */
export function isNotFound(): boolean {
	return notFoundLocation === getLocation();
}

/** Not a page view in Matomo's reports. */
export function trackSiteSearch(keyword: string, category: string, count: number): void {
	push(["trackSiteSearch", keyword, category, count]);
}

export function trackEvent(category: string, action: string, name: string, value?: number): void {
	push(value != null ? ["trackEvent", category, action, name, value] : ["trackEvent", category, action, name]);
}
