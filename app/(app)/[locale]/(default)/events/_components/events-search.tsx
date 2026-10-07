"use client";

import { useExtracted } from "next-intl";
import { type ReactNode, useCallback, useState } from "react";

import { EventCard } from "#/app/(app)/[locale]/(default)/events/_components/event-card";
import { type RenderItemContext, SearchView } from "#/app/(app)/[locale]/(default)/events/_components/search-view.tsx";
import { getAssetImageUrl } from "#/lib/data/api-client";
import type { IntlLocale } from "#/lib/i18n/locales.ts";
import { localizeHref } from "#/lib/navigation/convert";
import type { WebsiteFilterField } from "#/lib/search/collections/website.ts";
import type { SearchFilter } from "#/lib/search/filters.ts";
import type { WebsiteDocument } from "#/lib/search/index.ts";
import { getSearchService } from "#/lib/search/service.ts";
import type { SearchOutcome, SearchParams } from "#/lib/search/use-search.ts";

/** Typesense caps `per_page` at 250. Upcoming events are few, so they are all loaded at once. */
const maxPerPage = 250;
/** Past events keep accumulating, so they are loaded in batches. */
const pastPerPage = 20;

/** The UTC year an event starts in, which is how both lists are grouped. */
function getYear(document: WebsiteDocument): string | null {
	return document.start_date != null ? String(new Date(document.start_date).getUTCFullYear()) : null;
}

interface EventsSearchProps {
	locale: IntlLocale;
}

async function searchEvents(
	params: SearchParams,
	locale: IntlLocale,
	timeFilter: SearchFilter<WebsiteFilterField>,
	direction: "asc" | "desc",
): Promise<SearchOutcome<WebsiteDocument> | null> {
	const result = await getSearchService().collections.website.search({
		...params,
		filters: [
			{ operator: "equals", field: "type", value: "event" },
			{ operator: "equals", field: "locale", value: locale },
			timeFilter,
		],
		sortBy: [{ field: "start_date", direction }],
	});
	return result.isOk() ? result.value : null;
}

export function EventsSearch(props: EventsSearchProps): ReactNode {
	const { locale } = props;

	const t = useExtracted();

	/**
	 * Start of the current UTC day. Event dates are UTC days (midnight timestamps), so an event ending — or, without an
	 * end, taking place — today still counts as upcoming. Fixed on mount, so both sections split at the same instant.
	 */
	const [today] = useState(() => {
		const date = new Date();
		return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
	});

	function renderItem(document: WebsiteDocument, context: RenderItemContext): ReactNode {
		const link = document.link != null && document.link !== "" ? localizeHref(document.link, locale) : undefined;
		const srcUrl = getAssetImageUrl("images", document.image_key);

		return (
			<EventCard
				duration={{ start: document.start_date, end: document.end_date }}
				image={{ srcUrl, height: 0, width: 0 }}
				headingLevel={context.headingLevel}
				link={link}
				summary={document.description}
				title={document.label}
			/>
		);
	}

	/** Upcoming events in the current year need no heading; later years are set apart, e.g. January after December. */
	const getUpcomingGroup = useCallback(
		(document: WebsiteDocument) => {
			const year = getYear(document);
			return year === String(new Date(today).getUTCFullYear()) ? null : year;
		},
		[today],
	);

	// Depend on `locale` and `today` only, so they stay referentially stable across re-renders.
	const searchUpcoming = useCallback(
		(params: SearchParams) =>
			// `end_date:>=today || start_date:>=today`, soonest first. Single-day events have no `end_date`, and typesense
			// never matches a missing field, so those are matched by their start.
			searchEvents(
				params,
				locale,
				{
					operator: "any",
					filters: [
						{ operator: "range", field: "end_date", min: today },
						{ operator: "range", field: "start_date", min: today },
					],
				},
				"asc",
			),
		[locale, today],
	);

	const searchPast = useCallback(
		async (params: SearchParams) => {
			/**
			 * Past is everything which started before today, except ongoing events. Matching "no `end_date`, or
			 * `end_date:<today`" directly would need a filter on a missing field, so the (few) ongoing events are looked up
			 * first and excluded by id instead.
			 */
			const ongoing = await searchEvents(
				{ query: "*", page: 1, perPage: maxPerPage },
				locale,
				{
					operator: "all",
					filters: [
						{ operator: "range", field: "start_date", max: today - 1 },
						{ operator: "range", field: "end_date", min: today },
					],
				},
				"asc",
			);
			if (ongoing == null) {
				return null;
			}

			const ongoingIds = ongoing.items.map(({ document }) => `\`${document.id}\``);

			// Most recent first.
			return searchEvents(
				params,
				locale,
				{
					operator: "all",
					filters: [
						{ operator: "range", field: "start_date", max: today - 1 },
						...(ongoingIds.length > 0 ? [{ operator: "raw" as const, value: `id:!=[${ongoingIds.join(",")}]` }] : []),
					],
				},
				"desc",
			);
		},
		[locale, today],
	);

	return (
		<SearchView<WebsiteDocument>
			renderItem={renderItem}
			resultsClassName="grid gap-y-12"
			sections={[
				{
					id: "upcoming",
					title: t("Kommende Events"),
					search: searchUpcoming,
					perPage: maxPerPage,
					getGroup: getUpcomingGroup,
				},
				{ id: "past", title: t("Vergangene Events"), search: searchPast, perPage: pastPerPage, getGroup: getYear },
			]}
		/>
	);
}
