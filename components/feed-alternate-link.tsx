import { getLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { getFeedHref, getFeedTitle } from "#/lib/data/feed.ts";
import { isValidLocale } from "#/lib/i18n/locales.ts";

/**
 * Lets browsers and feed readers discover the rss feed. A `<link>` element, which react hoists into the document head,
 * rather than `alternates.types` in the layout's metadata, which a page's own `alternates` would replace.
 */
export async function FeedAlternateLink(): Promise<ReactNode> {
	const locale = await getLocale();

	if (!isValidLocale(locale)) {
		return null;
	}

	const title = await getFeedTitle(locale);

	return <link href={getFeedHref(locale)} rel="alternate" title={title} type="application/rss+xml" />;
}
