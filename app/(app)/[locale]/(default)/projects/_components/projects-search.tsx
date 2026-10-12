"use client";

import { type ReactNode, useCallback } from "react";

import { SearchView } from "#/app/(app)/[locale]/(default)/_components/search-view.tsx";
import { SearchFacetFilter } from "#/app/(app)/[locale]/(default)/search/_components/facet-filter.tsx";
import { Card } from "#/components/card";
import { getAssetImageUrl } from "#/lib/data/api-client";
import type { IntlLocale } from "#/lib/i18n/locales.ts";
import { localizeHref } from "#/lib/navigation/convert";
import type { WebsiteDocument } from "#/lib/search/index.ts";
import { getSearchService } from "#/lib/search/service.ts";
import type { SearchOutcome, SearchParams, SelectedFacets } from "#/lib/search/use-search.ts";

const facetField = "project_call";

interface ProjectsSearchProps {
	locale: IntlLocale;
}

export function ProjectsSearch(props: ProjectsSearchProps): ReactNode {
	const { locale } = props;

	// `document.link` is root-relative and locale-less, like `EntityRef.href` from the CMS API — prefix it the same way.
	function renderItem(document: WebsiteDocument): ReactNode {
		const link = document.link != null && document.link !== "" ? localizeHref(document.link, locale) : undefined;

		/**
		 * Typesense only indexes the asset key, not the full api `Image` (no known dimensions, alt text, caption or
		 * license) — `Card`'s `image` prop needs that full shape, so the fields it can't know are left `null`. `ApiImage`
		 * never reads `url`/`caption`/`license`, and a `null` width/height takes the same safe, unknown-dimensions fallback
		 * path a vector image would.
		 */
		const srcUrl =
			document.image_key != null && document.image_key !== "" ? getAssetImageUrl("images", document.image_key) : null;
		const image =
			srcUrl != null
				? { alt: null, caption: null, height: null, license: null, srcUrl, url: srcUrl, width: null }
				: null;

		return <Card image={image} link={link} summary={document.description} title={document.label} />;
	}

	// Depends on `locale`, so it stays referentially stable across re-renders unless the page's own locale changes.
	const search = useCallback(
		async (params: SearchParams): Promise<SearchOutcome<WebsiteDocument> | null> => {
			const result = await getSearchService().collections.website.search({
				...params,
				filters: [
					{ operator: "equals", field: "type", value: "project" },
					{ operator: "equals", field: "locale", value: locale },
				],
				facets: { [facetField]: { values: params.facets?.[facetField] ?? [] } },
			});
			return result.isOk() ? result.value : null;
		},
		[locale],
	);

	function renderFacets(params: {
		facets: SearchOutcome<WebsiteDocument>["facets"];
		selected: SelectedFacets;
		onChange: (field: string, values: ReadonlyArray<string>) => void;
	}): ReactNode {
		const { facets, onChange, selected } = params;
		const facet = facets?.[facetField];

		if (facet?.values.length === 0) {
			return null;
		}

		return (
			<SearchFacetFilter
				// No nicer label for the raw indexed value yet — see the TODO below.
				getLabel={(value) => value}
				facet={facet}
				isLoading={facets == null}
				label={facetField}
				onChange={(values) => {
					onChange(facetField, values);
				}}
				selected={selected[facetField] ?? []}
			/>
		);
	}

	// TODO: `label`/`getLabel` above show the raw field name/indexed value. Swap in a translated facet label and
	// confirm whether the indexed call names need their own display mapping once real data is in the index.

	return <SearchView<WebsiteDocument> renderFacets={renderFacets} renderItem={renderItem} search={search} />;
}
