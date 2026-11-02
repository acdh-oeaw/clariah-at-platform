import { createUrl, log } from "@acdh-oeaw/lib";
import type { MetadataRoute } from "next";

import { env } from "#/configs/env.config.ts";
import { cachedSitemap } from "#/lib/data/api-cache.ts";
import type { SitemapEntry } from "#/lib/data/api-client.ts";
import { isValidLocale, locales } from "#/lib/i18n/locales.ts";
import { localizeHref } from "#/lib/navigation/convert.ts";

/**
 * Listing pages which no content document backs, so the api's sitemap leaves them out (see `getSitemap` in
 * `lib/openapi/types.ts`). `/search` is left out on purpose: result pages are not worth indexing.
 */
const staticPathnames = ["/", "/events", "/imprint", "/news", "/projects", "/resources"] as const;

/** Entity types the api lists urls for, but which have no detail page on this website (yet). */
const excludedEntityTypes: ReadonlySet<SitemapEntry["type"]> = new Set(["persons"]);

function toAbsoluteUrl(pathname: string): string {
	return String(createUrl({ baseUrl: env.NEXT_PUBLIC_APP_BASE_URL, pathname }));
}

/**
 * The api prepends the full locale code (`/en-GB/…`), while this website's public urls use the short prefixes from
 * `lib/i18n/routing.ts` (`/en/…`), so the locale segment is swapped for the configured prefix.
 */
function toPublicPathname(link: Pick<SitemapEntry, "href" | "locale">): string {
	if (!isValidLocale(link.locale)) {
		return link.href;
	}

	const segment = `/${link.locale}`;
	if (link.href !== segment && !link.href.startsWith(`${segment}/`)) {
		return link.href;
	}

	return localizeHref(link.href.slice(segment.length) || "/", link.locale);
}

/**
 * Static routes share one pathname across locales, so their translations are listed as `alternates.languages` the same
 * way the api's entries are. No `lastModified`: nothing records when a listing page last changed.
 */
function getStaticEntries(): MetadataRoute.Sitemap {
	return staticPathnames.flatMap((pathname) => {
		const languages = Object.fromEntries(
			locales.map((locale) => [locale, toAbsoluteUrl(localizeHref(pathname, locale))] as const),
		);

		return locales.map((locale) => {
			return { url: toAbsoluteUrl(localizeHref(pathname, locale)), alternates: { languages } };
		});
	});
}

/**
 * Each entry's `href` already has its real, translated slug resolved by the api (see `SitemapEntry` in
 * `lib/openapi/types.ts`) — only its locale segment needs mapping, and the origin prepending. The same goes for each of
 * its `alternates`, which include the entry's own locale.
 */
export async function getSitemapEntries(): Promise<MetadataRoute.Sitemap> {
	const { data, unresolved } = await cachedSitemap();

	if (unresolved > 0) {
		log.warn(`Sitemap is incomplete: ${String(unresolved)} published document(s) have no resolvable url.`);
	}

	return [
		...getStaticEntries(),
		...data
			.filter((entry) => !excludedEntityTypes.has(entry.type))
			.map((entry) => {
				const languages = Object.fromEntries(
					entry.alternates.map((alternate) => [alternate.locale, toAbsoluteUrl(toPublicPathname(alternate))] as const),
				);

				return {
					lastModified: entry.lastModified,
					url: toAbsoluteUrl(toPublicPathname(entry)),
					alternates: { languages },
				};
			}),
	];
}
