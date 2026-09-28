"use client";

import type { ReactNode } from "react";

import { SearchView } from "#/app/(app)/[locale]/(default)/_components/search-view.tsx";
import { SearchFacetFilter } from "#/app/(app)/[locale]/(default)/search/_components/facet-filter.tsx";
import { Link } from "#/components/link.tsx";
import { Badge } from "#/components/ui/badge.tsx";
import type {
	ResourceDocument,
	ResourceFacetField,
	ResourcesCollection,
	SearchFacetsConfig,
} from "#/lib/search/index.ts";
import { getSearchService } from "#/lib/search/service.ts";
import type { SearchOutcome, SearchParams, SelectedFacets } from "#/lib/search/use-search.ts";

const facetFields: ReadonlyArray<ResourceFacetField> = ["type"];

// Unlike website content, a resource's link points at an external platform (Zenodo, HAL, DARIAH-Campus, ...), not a
// route on this site — so no `localizeHref` here, unlike `website-search.tsx`'s `renderItem`.
function renderItem(document: ResourceDocument): ReactNode {
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

// No `locale` filter, unlike website content: resources aren't per-locale, so every resource shows regardless of the
// page's language — same choice made for the resources half of the combined `/search`.
async function search(params: SearchParams): Promise<SearchOutcome<ResourceDocument> | null> {
	// Every field always requests counts; a field with nothing selected still gets `values: []`, which is what
	// `SearchFacetConfig` uses to mean "just count this facet, don't filter on it".
	const facets: SearchFacetsConfig<ResourcesCollection> = Object.fromEntries(
		facetFields.map((field) => [field, { values: params.facets?.[field] ?? [] }]),
	);

	const result = await getSearchService().collections.resources.search({
		query: params.query,
		page: params.page,
		perPage: params.perPage,
		facets,
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

function renderFacets(params: {
	facets: SearchOutcome<ResourceDocument>["facets"];
	selected: SelectedFacets;
	onChange: (field: string, values: ReadonlyArray<string>) => void;
}): ReactNode {
	const { facets, onChange, selected } = params;

	return (
		<div className="flex flex-wrap gap-x-4 gap-y-2">
			{facetFields.map((field) => {
				const facet = facets?.[field];
				if (facet != null && facet.values.length === 0) {
					return null;
				}

				return (
					<SearchFacetFilter
						key={field}
						// No nicer labels for the raw indexed values yet — see the TODO below.
						getLabel={(value) => value}
						facet={facet}
						isLoading={facets == null}
						label={field}
						onChange={(values) => {
							onChange(field, values);
						}}
						selected={selected[field] ?? []}
					/>
				);
			})}
		</div>
	);
}

// TODO: `getLabel` above shows the raw indexed value (e.g. "publication", "software"). Map these to translated,
// human-readable labels once the full set of values in use is confirmed against the live index.

export function ResourcesSearch(): ReactNode {
	return (
		<SearchView<ResourceDocument>
			renderFacets={renderFacets}
			renderItem={renderItem}
			resultsClassName="flex flex-col gap-y-12"
			search={search}
		/>
	);
}
