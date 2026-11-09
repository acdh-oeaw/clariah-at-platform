import { cacheLife } from "next/cache";

import { getFeed } from "#/lib/data/feed.ts";
import { isValidLocale } from "#/lib/i18n/locales.ts";
import { routing } from "#/lib/i18n/routing.ts";

export function generateStaticParams(): Array<{ locale: string }> {
	return routing.locales.map((locale) => {
		return { locale };
	});
}

/**
 * Takes the locale as a promise, which is only awaited inside the cache scope, so the route handler is prerendered per
 * locale rather than rendered per request.
 *
 * @see {@link https://nextjs.org/docs/app/api-reference/functions/generate-static-params#route-handlers-with-cache-components}
 */
async function getCachedFeed(locale: Promise<string>): Promise<string | null> {
	"use cache";
	cacheLife("content");

	const value = await locale;

	if (!isValidLocale(value)) {
		return null;
	}

	return getFeed(value);
}

/** One feed per locale, at the same url as on the previous website. */
export async function GET(_request: Request, context: RouteContext<"/[locale]/feed.xml">): Promise<Response> {
	const feed = await getCachedFeed(context.params.then((params) => params.locale));

	if (feed == null) {
		return new Response(null, { status: 404 });
	}

	return new Response(feed, { headers: { "content-type": "application/rss+xml; charset=utf-8" } });
}
