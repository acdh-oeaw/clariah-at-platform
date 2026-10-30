"use client";

import { useExtracted } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import { searchResultListClassName } from "#/app/(app)/[locale]/(default)/_components/search-result-card.tsx";
import { SearchView, type SearchViewParams } from "#/app/(app)/[locale]/(default)/_components/search-view.tsx";
import { ResourceResultCard } from "#/app/(app)/[locale]/(default)/resources/_components/resource-result-card";
import { searchParams } from "#/app/(app)/[locale]/(default)/resources/search-params.ts";
import { SearchFacetFilter } from "#/app/(app)/[locale]/(default)/search/_components/facet-filter.tsx";
import type { ResourceDocument, ResourceType } from "#/lib/search/collections/resources.ts";
import { getSearchService } from "#/lib/search/service.ts";
import type { SearchOutcome, SearchParams, SelectedFacets } from "#/lib/search/use-search.ts";

const facetField = "type";

function toRawSearchParams(params: SearchViewParams): { q: string; type: ResourceType | undefined; page: number } {
	return {
		q: params.query,
		page: params.page,
		type: params.facets[facetField]?.[0] as ResourceType | undefined,
	};
}

function toSearchViewParams(raw: { q: string; type?: ResourceType | undefined; page: number }): SearchViewParams {
	const facets: SelectedFacets = {};
	if (raw.type != null) {
		facets[facetField] = [raw.type];
	}
	return { facets, page: raw.page, query: raw.q };
}

function renderItem(document: ResourceDocument): ReactNode {
	return <ResourceResultCard document={document} />;
}

// No `locale` filter, unlike website content: resources aren't per-locale, so every resource shows regardless of the
// page's language — same choice made for the resources half of the combined `/search`.
async function search(params: SearchParams): Promise<SearchOutcome<ResourceDocument> | null> {
	const result = await getSearchService().collections.resources.search({
		query: params.query,
		page: params.page,
		perPage: params.perPage,
		facets: { [facetField]: { values: params.facets?.[facetField] ?? [] } },
	});

	if (!result.isOk()) {
		return null;
	}

	return {
		items: result.value.items,
		pagination: result.value.pagination,
		facets: Object.fromEntries(
			Object.entries(result.value.facets).map(([field, facet]) => [
				field,
				{
					values: (facet?.values ?? []).map(({ count, highlighted, value }) => {
						return { count, highlighted, value };
					}),
				},
			]),
		),
	};
}

// TODO: `getLabel` below shows the raw indexed value (e.g. "publication", "software"). Map these to translated,
// human-readable labels once the full set of values in use is confirmed against the live index.

export function ResourcesSearch(): ReactNode {
	const t = useExtracted();
	const pathname = usePathname();
	const router = useRouter();
	const rawSearchParams = useSearchParams();

	/**
	 * No local state: `params` is derived fresh from the url on every render, not mirrored into a `useState` that would
	 * need manual syncing. `router.replace` below already updates the url; `useSearchParams` reactively reflects that on
	 * the very next render, so there is nothing else to keep in sync by hand.
	 */
	const params = toSearchViewParams(searchParams.parse(rawSearchParams));

	function getHref(nextParams: SearchViewParams): string {
		const { query } = searchParams.encode(toRawSearchParams(nextParams));
		return query !== "" ? `${pathname}?${query}` : pathname;
	}

	function onParamsChange(nextParams: SearchViewParams): void {
		router.replace(getHref(nextParams), { scroll: false });
	}

	function renderFacets(renderParams: {
		facets: SearchOutcome<ResourceDocument>["facets"];
		selected: SelectedFacets;
		onChange: (field: string, values: ReadonlyArray<string>) => void;
	}): ReactNode {
		const { facets, onChange, selected } = renderParams;
		const facet = facets?.[facetField];

		if (facet?.values.length === 0) {
			return null;
		}

		return (
			<SearchFacetFilter
				getLabel={(value) => value}
				facet={facet}
				isLoading={facets == null}
				label={t("Typ")}
				onChange={(values) => {
					onChange(facetField, values);
				}}
				selected={selected[facetField] ?? []}
			/>
		);
	}

	return (
		<SearchView<ResourceDocument>
			getHref={getHref}
			label={t("Resourcen durchsuchen")}
			onParamsChange={onParamsChange}
			params={params}
			renderFacets={renderFacets}
			renderItem={renderItem}
			resultsClassName={searchResultListClassName}
			search={search}
		/>
	);
}
