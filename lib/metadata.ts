import "server-only";

import type { Metadata } from "next";
import { getLocale } from "next-intl/server";

import { cachedSiteMetadata } from "#/lib/data/api-cache.ts";
import { type IntlLocale, isValidLocale, locales } from "#/lib/i18n/locales.ts";
import { type ImageAsset, createImageVariantUrl, isSvgImage } from "#/lib/images/variants.ts";
import { localizeHref } from "#/lib/navigation/convert.ts";

type OpenGraph = NonNullable<Metadata["openGraph"]>;
type OpenGraphImage = Exclude<NonNullable<OpenGraph["images"]>, ReadonlyArray<unknown>>;

/** The link preview of a page without an image of its own, when the site has no `ogImage` either. */
const fallbackImage = { url: "/assets/images/opengraph-image.png", width: 1200, height: 630, type: "image/png" };

/** Wide enough for a large link preview. */
const openGraphImageWidth = 1280;

/** About what search results show of a description before they cut it off. */
const maxDescriptionLength = 160;

/** `og:locale` wants `en_GB`, not the bcp 47 `en-GB`. */
function toOpenGraphLocale(locale: IntlLocale): string {
	return locale.replace("-", "_");
}

/** A summary as `description`: whitespace collapsed, and cut at a word boundary when it runs past what search shows. */
export function toDescription(text: string): string {
	const normalized = text.replaceAll(/\s+/gu, " ").trim();

	if (normalized.length <= maxDescriptionLength) {
		return normalized;
	}

	const cut = normalized.slice(0, maxDescriptionLength - 1);
	const boundary = cut.lastIndexOf(" ");

	return `${(boundary > 0 ? cut.slice(0, boundary) : cut).replace(/[\s,.;:–—-]+$/u, "")}…`;
}

/** An api image for crawlers, which do not render svgs. */
export function toImageUrl(image: ImageAsset): string | null {
	return isSvgImage(image) ? null : createImageVariantUrl(image.srcUrl, openGraphImageWidth);
}

function toOpenGraphImage(image: ImageAsset): OpenGraphImage | null {
	const url = toImageUrl(image);

	return url != null ? { url, alt: image.alt ?? undefined } : null;
}

/**
 * The `openGraph` fields every route shares, with a page's own on top.
 *
 * A segment which sets `openGraph` replaces the root layout's object as a whole, so any page that needs its own builds
 * it through here. Leave `title` and `description` out unless they should differ from the page's own: Next fills them
 * in from those, and passes all of it on to the `twitter` card.
 */
export async function createOpenGraph(openGraph: OpenGraph = {}): Promise<OpenGraph> {
	const locale = await getLocale();
	const site = await cachedSiteMetadata(locale);

	const image = site.ogImage != null ? toOpenGraphImage(site.ogImage) : null;

	return {
		type: "website",
		siteName: site.title,
		locale: toOpenGraphLocale(locale),
		alternateLocale: locales.filter((other) => other !== locale).map((other) => toOpenGraphLocale(other)),
		images: [image ?? { ...fallbackImage, alt: site.title }],
		...openGraph,
	};
}

/** The translations of an entity as `alternates.languages`, for an entity whose pages live below `basePathname`. */
export function getLanguageAlternates(
	basePathname: string,
	translations: ReadonlyArray<{ locale: string; slug: string }>,
): Record<string, string> {
	const languages: Record<string, string> = {};

	for (const translation of translations) {
		if (isValidLocale(translation.locale)) {
			languages[translation.locale] = localizeHref(`${basePathname}/${translation.slug}`, translation.locale);
		}
	}

	return languages;
}

interface CreateMetadataOptions {
	/** The route without its locale prefix, as `canonical` and `og:url`. */
	pathname: string;
	/** The page's own title, which the root layout's template appends the site title to. */
	title: NonNullable<Metadata["title"]>;
	/** A summary in plain text, shortened here. Without one, the site description applies in full. */
	description?: string | null;
	/** Without one, the site's image applies. */
	image?: ImageAsset | null;
	/** For entity pages, whose slugs differ between locales. `AlternateLinks` covers all other routes. */
	languages?: Record<string, string>;
	/** Keeps the route out of the index, in which case it gets no canonical either. */
	noindex?: boolean;
	openGraph?: OpenGraph;
}

/**
 * A route's metadata: title, description, canonical url and the link preview, on top of the root layout's.
 *
 * Next merges a segment's metadata key by key, including keys set to `undefined`, which would blank what the layout
 * provides, so a missing value is left out rather than passed on.
 */
export async function createMetadata(options: CreateMetadataOptions): Promise<Metadata> {
	const { description, image, languages, noindex = false, openGraph, pathname, title } = options;

	const locale = await getLocale();
	const site = await cachedSiteMetadata(locale);

	const url = localizeHref(pathname, locale);
	const openGraphImage = image != null ? toOpenGraphImage(image) : null;

	return {
		title,
		description: description != null && description !== "" ? toDescription(description) : site.description.trim(),
		...(noindex
			? { robots: { index: false } }
			: { alternates: { canonical: url, ...(languages != null ? { languages } : {}) } }),
		openGraph: await createOpenGraph({
			url,
			...(openGraphImage != null ? { images: [openGraphImage] } : {}),
			...openGraph,
		}),
	};
}
