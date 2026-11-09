import "server-only";

import { getExtracted } from "next-intl/server";
import { type Entry, rss } from "xast-util-feed";
import { toXml } from "xast-util-to-xml";

import { cachedEvents, cachedNews, cachedSiteMetadata } from "#/lib/data/api-cache.ts";
import type { IntlLocale } from "#/lib/i18n/locales.ts";
import { localizeHref } from "#/lib/navigation/convert.ts";
import { createFullUrl } from "#/lib/navigation/create-full-url.ts";

/** Number of entries in the feed. Feed readers remember what they have seen, so this only has to outlast a poll gap. */
const feedSize = 20;

/**
 * The pathname of the feed's route handler, without its locale prefix. The same as on the previous website, so existing
 * subscriptions keep working.
 */
const feedPathname = "/feed.xml";

function absoluteUrl(pathname: string, locale: IntlLocale): string {
	return String(createFullUrl({ pathname: localizeHref(pathname, locale) }));
}

/** The feed's url, relative, for links to it on the website. */
export function getFeedHref(locale: IntlLocale): string {
	return localizeHref(feedPathname, locale);
}

export async function getFeedTitle(locale: IntlLocale): Promise<string> {
	const [t, site] = await Promise.all([getExtracted({ locale }), cachedSiteMetadata(locale)]);

	return t("{title}: Aktuelles und Veranstaltungen", { title: site.title });
}

/**
 * The feed as rss: the most recently published news and events, newest first, like the feed of the previous website.
 * The events endpoint cannot sort by publication date, so a full page of events is sorted here.
 *
 * Every call is cached, so the route handler which calls this is prerendered, and refreshed by the revalidation webhook
 * through the cache tags of these calls.
 */
export async function getFeed(locale: IntlLocale): Promise<string> {
	const [news, events, site, title] = await Promise.all([
		cachedNews(locale, feedSize),
		cachedEvents(locale),
		cachedSiteMetadata(locale),
		getFeedTitle(locale),
	]);

	const entries: Array<Entry> = [
		...news.data.map((item): Entry => {
			return {
				title: item.title,
				description: item.summary,
				url: absoluteUrl(`/news/${item.entity.slug}`, locale),
				published: item.publishedAt,
			};
		}),
		...events.data.map((item): Entry => {
			return {
				title: item.title,
				description: item.summary,
				url: absoluteUrl(`/events/${item.entity.slug}`, locale),
				published: item.publishedAt,
			};
		}),
	]
		.toSorted((a, b) => String(b.published).localeCompare(String(a.published)))
		.slice(0, feedSize);

	return toXml(
		rss(
			{
				title,
				description: site.description.trim(),
				url: absoluteUrl("/", locale),
				feedUrl: absoluteUrl(feedPathname, locale),
				lang: locale,
			},
			entries,
		),
	);
}
