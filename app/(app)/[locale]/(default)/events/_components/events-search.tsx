"use client";

import { type ReactNode, useCallback } from "react";

import { SearchView } from "#/app/(app)/[locale]/(default)/_components/search-view.tsx";
import { Card } from "#/components/card";
import { getAssetImageUrl } from "#/lib/data/api-client";
import type { IntlLocale } from "#/lib/i18n/locales.ts";
import { localizeHref } from "#/lib/navigation/convert";
import type { WebsiteDocument } from "#/lib/search/index.ts";
import { getSearchService } from "#/lib/search/service.ts";
import type { SearchOutcome, SearchParams } from "#/lib/search/use-search.ts";

interface EventsSearchProps {
	locale: IntlLocale;
}

export function EventsSearch(props: EventsSearchProps): ReactNode {
	const { locale } = props;

	function renderItem(document: WebsiteDocument): ReactNode {
		const srcUrl = getAssetImageUrl("images", document.image_key);
		const link = document.link != null && document.link !== "" ? localizeHref(document.link, locale) : undefined;
		return (
			<Card image={{ srcUrl, height: 0, width: 0 }} link={link} summary={document.description} title={document.label} />
		);
	}

	// Depends on `locale`, so it stays referentially stable across re-renders unless the page's own locale changes.
	const search = useCallback(
		async (params: SearchParams): Promise<SearchOutcome<WebsiteDocument> | null> => {
			const result = await getSearchService().collections.website.search({
				...params,
				filters: [
					{ operator: "equals", field: "type", value: "event" },
					{ operator: "equals", field: "locale", value: locale },
				],
			});
			return result.isOk() ? result.value : null;
		},
		[locale],
	);

	return <SearchView<WebsiteDocument> renderItem={renderItem} search={search} />;
}
