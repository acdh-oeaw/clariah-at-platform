"use client";

import { useExtracted } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useCallback } from "react";

import {
	SearchResultCard,
	searchResultListClassName,
} from "#/app/(app)/[locale]/(default)/_components/search-result-card";
import { SearchView, type SearchViewParams } from "#/app/(app)/[locale]/(default)/_components/search-view.tsx";
import { ResourceResultCard } from "#/app/(app)/[locale]/(default)/resources/_components/resource-result-card";
import { searchParams } from "#/app/(app)/[locale]/(default)/search-params.ts";
import { SearchFacetFilter } from "#/app/(app)/[locale]/(default)/search/_components/facet-filter.tsx";
import { useFacetLabel } from "#/app/(app)/[locale]/(default)/search/_components/facet-labels";
import type { IntlLocale } from "#/lib/i18n/locales.ts";
import { localizeHref } from "#/lib/navigation/convert.ts";
import type { ResourceDocument, WebsiteDocument } from "#/lib/search/index.ts";
import { getSearchService } from "#/lib/search/service.ts";
import type { SearchFacetValue, SearchOutcome, SearchParams, SelectedFacets } from "#/lib/search/use-search.ts";

interface WebsiteSearchProps {
	locale: IntlLocale;
}

/**
 * `/search` combines two Typesense collections into one list — Typesense's `multi_search` runs separate searches per
 * collection, it doesn't merge or rank across them, so the merging happens here.
 */
type CombinedItem =
	| { id: string; kind: "website"; document: WebsiteDocument }
	| { id: string; kind: "resource"; document: ResourceDocument };

/** The only field both collections facet on with a compatible vocabulary — see `mergeFacetValues` below. */
const facetField = "type";

function mergeFacetValues(a: Array<SearchFacetValue>, b: Array<SearchFacetValue>): Array<SearchFacetValue> {
	const byValue = new Map<string, SearchFacetValue>();

	for (const item of [...a, ...b]) {
		const existing = byValue.get(item.value);
		byValue.set(item.value, existing == null ? item : { ...existing, count: existing.count + item.count });
	}

	return Array.from(byValue.values());
}

/** Alternates the two collections' hits — there's no single relevance score comparable across them to sort by instead. */
function interleave<A, B>(a: ReadonlyArray<A>, b: ReadonlyArray<B>): Array<A | B> {
	const result: Array<A | B> = [];
	const length = Math.max(a.length, b.length);

	for (let index = 0; index < length; index++) {
		if (index < a.length) {
			result.push(a[index] as A);
		}
		if (index < b.length) {
			result.push(b[index] as B);
		}
	}

	return result;
}

/**
 * `SearchViewParams.facets[facetField]` is multi-select (the facet UI is checkboxes), but `search-params.ts`'s `type`
 * is a single value — the url has room for one. Only the first selected type round-trips through the url and survives a
 * reload; further ones stay selected in memory until the next full navigation. Flagging this rather than silently
 * dropping the rest: worth deciding whether the url schema should become an array, or the facet UI single-select.
 */
function toRawSearchParams(params: SearchViewParams): {
	q: string;
	type: WebsiteDocument["type"] | undefined;
	page: number;
} {
	return {
		q: params.query,
		page: params.page,
		type: params.facets[facetField]?.[0] as WebsiteDocument["type"] | undefined,
	};
}

function toSearchViewParams(raw: {
	q: string;
	type?: WebsiteDocument["type"] | undefined;
	page: number;
}): SearchViewParams {
	const facets: SelectedFacets = {};
	if (raw.type != null) {
		facets[facetField] = [raw.type];
	}
	return { facets, page: raw.page, query: raw.q };
}

export function WebsiteSearch(props: Readonly<WebsiteSearchProps>): ReactNode {
	const { locale } = props;
	const getLabel = useFacetLabel();
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

	function renderItem(item: CombinedItem): ReactNode {
		if (item.kind === "website") {
			const document = item.document;
			// `document.link` is root-relative and locale-less, like `EntityRef.href` from the CMS API — prefix it the same way.
			return (
				<SearchResultCard
					description={document.description}
					href={document.link != null && document.link !== "" ? localizeHref(document.link, locale) : null}
					title={document.label}
					type={document.type}
				/>
			);
		}

		return <ResourceResultCard document={item.document} />;
	}

	// Depends on `locale`, so it stays referentially stable across re-renders unless the page's own locale changes.
	const search = useCallback(
		async (searchParameters: SearchParams): Promise<SearchOutcome<CombinedItem> | null> => {
			const selectedTypes = searchParameters.facets?.[facetField] ?? [];
			const websitePerPage = Math.ceil(searchParameters.perPage / 2);
			const resourcesPerPage = searchParameters.perPage - websitePerPage;

			const [websiteResult, resourcesResult] = await Promise.all([
				getSearchService().collections.website.search({
					query: searchParameters.query,
					page: searchParameters.page,
					perPage: websitePerPage,
					// Website content is locale-specific; resources are not — see the resources call below.
					filters: [
						{ operator: "equals", field: "locale", value: locale },
						{ operator: "notEquals", field: "type", value: "governance_body" },
						{ operator: "notEquals", field: "type", value: "person" },
						{ operator: "notEquals", field: "type", value: "national_consortium" },
						{ operator: "notEquals", field: "type", value: "country" },
						{ operator: "notEquals", field: "type", value: "institution" },
					],
					facets: { type: { values: selectedTypes } },
				}),
				getSearchService().collections.resources.search({
					query: searchParameters.query,
					page: searchParameters.page,
					perPage: resourcesPerPage,
					facets: { type: { values: selectedTypes } },
				}),
			]);

			if (!websiteResult.isOk() || !resourcesResult.isOk()) {
				return null;
			}

			const websiteItems: Array<CombinedItem> = websiteResult.value.items.map((item) => {
				return {
					id: `website:${item.document.id}`,
					kind: "website",
					document: item.document,
				};
			});
			const resourceItems: Array<CombinedItem> = resourcesResult.value.items.map((item) => {
				return {
					id: `resource:${item.document.id}`,
					kind: "resource",
					document: item.document,
				};
			});

			const total = websiteResult.value.pagination.total + resourcesResult.value.pagination.total;

			return {
				items: interleave(websiteItems, resourceItems).map((item) => {
					return { document: item };
				}),
				pagination: {
					page: searchParameters.page,
					total,
					totalPages: searchParameters.perPage > 0 ? Math.ceil(total / searchParameters.perPage) : 0,
				},
				facets: {
					[facetField]: {
						values: mergeFacetValues(
							websiteResult.value.facets[facetField]?.values ?? [],
							resourcesResult.value.facets[facetField]?.values ?? [],
						),
					},
				},
			};
		},
		[locale],
	);

	function renderFacets(renderParams: {
		facets: SearchOutcome<CombinedItem>["facets"];
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
				getLabel={(value) => getLabel(value)}
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
		<SearchView<CombinedItem>
			getHref={getHref}
			label={t("Website durchsuchen")}
			onParamsChange={onParamsChange}
			params={params}
			renderFacets={renderFacets}
			renderItem={renderItem}
			resultsClassName={searchResultListClassName}
			search={search}
		/>
	);
}
