import createI18nMiddleware from "next-intl/middleware";
import type { NextRequest, NextResponse } from "next/server";

import { localePrefix, routing } from "#/lib/i18n/routing.ts";

const i18nMiddleware = createI18nMiddleware(routing);

/**
 * Every request path that resolves to the homepage: the unprefixed root (which redirects to a locale), and each
 * locale's own bare prefix.
 */
const homepagePathnames = new Set<string>(["/", ...Object.values(localePrefix.prefixes)]);

function isHomepagePathname(pathname: string): boolean {
	return homepagePathnames.has(pathname) || homepagePathnames.has(pathname.replace(/\/$/, ""));
}

const hreflangPattern = /hreflang="(?<hreflang>[^"]*)"/;

function getHreflang(entry: string): string | null {
	return hreflangPattern.exec(entry)?.groups?.hreflang ?? null;
}

/**
 * Next-intl v4 adds an `x-default` alternate link to every route's response unconditionally (see
 * `getAlternateLinksHeaderValue.js` — there's no routing config to limit it). This app only redirects an unprefixed
 * request at "/", so `x-default` only makes sense there; anywhere else it advertises a URL that nothing actually
 * negotiates locale from.
 *
 * Separately, deduplicate by `hreflang`: a still-open Next.js bug (proxy-generated `Link` headers + `next/font` preload
 * headers + Cache Components revalidation + standalone output) can repeatedly append a full duplicate set of alternate
 * links after every cache revalidation, growing the header unboundedly until it's large enough to cause 502s from the
 * reverse proxy. Entries without an `hreflang` (e.g. a font preload link) aren't touched — only next-intl's own
 * alternate links are deduplicated.
 *
 * @see {@link https://github.com/vercel/next.js/issues/94945}
 */
export function middleware(request: NextRequest): NextResponse {
	const response = i18nMiddleware(request);

	const link = response.headers.get("link");
	if (link == null) {
		return response;
	}

	const isHomepage = isHomepagePathname(request.nextUrl.pathname);
	const seen = new Set<string>();
	const entries: Array<string> = [];

	for (const entry of link.split(/, |\n/)) {
		const hreflang = getHreflang(entry);

		if (hreflang == null) {
			entries.push(entry);
			continue;
		}

		if (seen.has(hreflang) || (hreflang === "x-default" && !isHomepage)) {
			continue;
		}

		seen.add(hreflang);
		entries.push(entry);
	}

	if (entries.length > 0) {
		response.headers.set("link", entries.join(", "));
	} else {
		response.headers.delete("link");
	}

	return response;
}
