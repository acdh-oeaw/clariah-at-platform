import "server-only";

import { createUrl } from "@acdh-oeaw/lib";
import { getLocale } from "next-intl/server";
import type { Event, NewsArticle, Organization, Place, VirtualLocation, WebSite, WithContext } from "schema-dts";

import { env } from "#/configs/env.config.ts";
import { cachedSiteMetadata } from "#/lib/data/api-cache.ts";
import type { Event as EventItem, NewsItem, SiteMetadata } from "#/lib/data/api-client.ts";
import { locales } from "#/lib/i18n/locales.ts";
import { toDescription, toImageUrl } from "#/lib/metadata.ts";
import { localizeHref } from "#/lib/navigation/convert.ts";

/**
 * Structured data for search engines, see https://developers.google.com/search/docs/appearance/structured-data.
 *
 * The organisation and the website are described once, on the landing page, under fixed `@id`s. Every other page's data
 * refers to them by those ids rather than repeating them.
 */

function toAbsoluteUrl(pathname: string): string {
	return String(createUrl({ baseUrl: env.NEXT_PUBLIC_APP_BASE_URL, pathname }));
}

const organizationId = toAbsoluteUrl("/#organization");
const websiteId = toAbsoluteUrl("/#website");

/**
 * The organisation as a reference. Its name and url sit beside the `@id`, since its full description is on another
 * page.
 */
function toOrganizationRef(site: SiteMetadata): Organization {
	return { "@type": "Organization", "@id": organizationId, name: site.title, url: toAbsoluteUrl("/") };
}

/** Not in the api, so they are fixed here. */
const organizationEmail = "office@clariah.at";
const organizationProfiles = ["https://www.linkedin.com/company/clariah-at/"];

export function createOrganization(site: SiteMetadata): WithContext<Organization> {
	return {
		"@context": "https://schema.org",
		"@type": "Organization",
		"@id": organizationId,
		name: site.title,
		description: site.description.trim(),
		url: toAbsoluteUrl("/"),
		logo: toAbsoluteUrl("/assets/images/logo-clariah.svg"),
		email: organizationEmail,
		sameAs: organizationProfiles,
	};
}

export function createWebSite(site: SiteMetadata): WithContext<WebSite> {
	return {
		"@context": "https://schema.org",
		"@type": "WebSite",
		"@id": websiteId,
		name: site.title,
		description: site.description.trim(),
		url: toAbsoluteUrl("/"),
		inLanguage: [...locales],
		publisher: { "@id": organizationId },
	};
}

export async function createNewsArticle(pathname: string, item: NewsItem): Promise<WithContext<NewsArticle>> {
	const locale = await getLocale();
	const site = await cachedSiteMetadata(locale);

	const url = toAbsoluteUrl(localizeHref(pathname, locale));
	const image = toImageUrl(item.image);
	const organization = toOrganizationRef(site);

	return {
		"@context": "https://schema.org",
		"@type": "NewsArticle",
		headline: item.title,
		description: toDescription(item.summary),
		url,
		mainEntityOfPage: url,
		...(image != null ? { image } : {}),
		datePublished: item.publishedAt,
		inLanguage: locale,
		author: organization,
		publisher: organization,
		isPartOf: { "@id": websiteId },
	};
}

/**
 * An event's date as schema.org wants it. UTC stands in for the event's own timezone (see `EventBase["duration"]`), so
 * the offset is dropped rather than converted: a date-time without one is read in the timezone of the event's location.
 * Midnight means no time of day was entered, so that is a date only, as for a full-day event.
 */
function toEventDate(value: string, isFullDay: boolean): string {
	const date = new Date(value).toISOString();

	return isFullDay || date.slice(11, 16) === "00:00" ? date.slice(0, 10) : date.slice(0, 16);
}

/** How an event's free text `location` says it takes place, before or after the name of the venue, if it has one. */
const attendanceMode = /^(?:hybrid|online|onsite)(?:\s+in\b|[\s,&]+)?|[\s,&]+(?:hybrid|online|onsite)$/iu;

/** The api has an event's venue as free text only, e.g. "Vienna", "online", "hybrid in Graz" or "Salzburg & online". */
function toEventLocation(item: EventItem, pageUrl: string): Pick<Event & object, "eventAttendanceMode" | "location"> {
	const text = item.location.trim();
	const venue = text.replace(attendanceMode, "").trim();

	const isHybrid = /\bhybrid\b/iu.test(text);
	const isOnline = /\bonline\b/iu.test(text);

	const location: Array<Place | VirtualLocation> = [];

	if (venue !== "") {
		location.push({ "@type": "Place", name: venue, address: venue });
	}

	if (isHybrid || isOnline) {
		location.push({ "@type": "VirtualLocation", url: item.website ?? pageUrl });
	}

	let eventAttendanceMode: Event & object extends { eventAttendanceMode?: infer T } ? T : never =
		"https://schema.org/OfflineEventAttendanceMode";

	if (isHybrid || (isOnline && venue !== "")) {
		eventAttendanceMode = "https://schema.org/MixedEventAttendanceMode";
	} else if (isOnline) {
		eventAttendanceMode = "https://schema.org/OnlineEventAttendanceMode";
	}

	return { eventAttendanceMode, ...(location.length > 0 ? { location } : {}) };
}

/** Search engines reject an event without a location, so one whose venue is unknown has no structured data. */
export async function createEvent(pathname: string, item: EventItem): Promise<WithContext<Event> | null> {
	const locale = await getLocale();

	const url = toAbsoluteUrl(localizeHref(pathname, locale));
	const image = toImageUrl(item.image);
	const attendance = toEventLocation(item, url);

	if (attendance.location == null) {
		return null;
	}

	const { start, end } = item.duration;

	return {
		"@context": "https://schema.org",
		"@type": "Event",
		name: item.title,
		description: toDescription(item.summary),
		url,
		...(image != null ? { image } : {}),
		startDate: toEventDate(start, item.isFullDay),
		...(end != null ? { endDate: toEventDate(end, item.isFullDay) } : {}),
		eventStatus: "https://schema.org/EventScheduled",
		inLanguage: locale,
		...attendance,
		...(item.website != null ? { sameAs: item.website } : {}),
	};
}
