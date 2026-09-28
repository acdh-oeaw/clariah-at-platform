"use client";

import { type ReactNode, useCallback } from "react";

import { SearchView } from "#/app/(app)/[locale]/(default)/_components/search-view.tsx";
import { SearchFacetFilter } from "#/app/(app)/[locale]/(default)/search/_components/facet-filter.tsx";
import { Link } from "#/components/link.tsx";
import { Badge } from "#/components/ui/badge.tsx";
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

export function WebsiteSearch(props: Readonly<WebsiteSearchProps>): ReactNode {
	const { locale } = props;

	function renderItem(item: CombinedItem): ReactNode {
		if (item.kind === "website") {
			const document = item.document;
			// `document.link` is root-relative and locale-less, like `EntityRef.href` from the CMS API — prefix it the same way.
			return (
				<>
					<Badge className="inline" intent="primary">
						{document.type}
					</Badge>
					<h2 className="text-h3 font-strong text-text-strong">
						{document.link != null && document.link !== "" ? (
							<Link href={localizeHref(document.link, locale)}>{document.label}</Link>
						) : (
							document.label
						)}
					</h2>
					<p className="line-clamp-3 text-regular">{document.description}</p>
				</>
			);
		}

		const document = item.document;
		// A resource's link points at an external platform (Zenodo, HAL, DARIAH-Campus, ...), not a route on this site.
		const href = document.source_url ?? document.links[0];
		const meta = [document.authors?.join(", "), document.year]
			.filter((value) => value != null && value !== "")
			.join(" · ");

		return (
			<>
				<Badge className="inline" intent="primary">
					{document.type}
				</Badge>
				<h2 className="text-h3 font-strong text-text-strong">
					{href != null && href !== "" ? <Link href={href}>{document.label}</Link> : document.label}
				</h2>
				<p className="text-small text-text-weak">{meta}</p>
				<p className="line-clamp-3 text-regular">{document.description}</p>
			</>
		);
	}

	// Depends on `locale`, so it stays referentially stable across re-renders unless the page's own locale changes.
	const search = useCallback(
		async (params: SearchParams): Promise<SearchOutcome<CombinedItem> | null> => {
			const selectedTypes = params.facets?.[facetField] ?? [];
			const websitePerPage = Math.ceil(params.perPage / 2);
			const resourcesPerPage = params.perPage - websitePerPage;

			const [websiteResult, resourcesResult] = await Promise.all([
				getSearchService().collections.website.search({
					query: params.query,
					page: params.page,
					perPage: websitePerPage,
					// Website content is locale-specific; resources are not — see the resources call below.
					filters: [{ operator: "equals", field: "locale", value: locale }],
					facets: { type: { values: selectedTypes } },
				}),
				getSearchService().collections.resources.search({
					query: params.query,
					page: params.page,
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
					page: params.page,
					totalPages: params.perPage > 0 ? Math.ceil(total / params.perPage) : 0,
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

	function renderFacets(params: {
		facets: SearchOutcome<CombinedItem>["facets"];
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
				// No nicer labels for the raw indexed values yet — see the TODO below.
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

	// TODO: `getLabel` above shows the raw indexed value (e.g. "news-item", "publication"). Map these to translated,
	// human-readable labels once the full set of values in use is confirmed against the live index.

	return (
		<SearchView<CombinedItem>
			renderFacets={renderFacets}
			renderItem={renderItem}
			resultsClassName="flex flex-col gap-y-12"
			search={search}
		/>
	);
}
