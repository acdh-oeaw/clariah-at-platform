"use client";

import { useExtracted } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useCallback } from "react";

import { SearchView, type SearchViewParams } from "#/app/(app)/[locale]/(default)/_components/search-view.tsx";
import { useFacetLabel } from "#/app/(app)/[locale]/(default)/projects/_components/facet-labels";
import { searchParams } from "#/app/(app)/[locale]/(default)/projects/search-params.ts";
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

function toRawSearchParams(params: SearchViewParams): { q: string; project_call: string | undefined; page: number } {
	return {
		q: params.query,
		page: params.page,
		project_call: params.facets[facetField]?.[0],
	};
}

function toSearchViewParams(raw: { q: string; project_call?: string | undefined; page: number }): SearchViewParams {
	const facets: SelectedFacets = {};
	if (raw.project_call != null) {
		facets[facetField] = [raw.project_call];
	}
	return { facets, page: raw.page, query: raw.q };
}

export function ProjectsSearch(props: Readonly<ProjectsSearchProps>): ReactNode {
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

	// `document.link` is root-relative and locale-less, like `EntityRef.href` from the CMS API — prefix it the same way.
	function renderItem(document: WebsiteDocument): ReactNode {
		const link = document.link != null && document.link !== "" ? localizeHref(document.link, locale) : undefined;

		const image =
			document.image_key !== ""
				? {
						alt: document.image_alt ?? null,
						height: document.image_height ?? null,
						mimeType: document.image_mime_type ?? "",
						srcUrl: getAssetImageUrl("images", document.image_key),
						width: document.image_width ?? null,
					}
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
				getLabel={(value) => getLabel(value)}
				facet={facet}
				isLoading={facets == null}
				label={t("Förderprogramm")}
				onChange={(values) => {
					onChange(facetField, values);
				}}
				selected={selected[facetField] ?? []}
			/>
		);
	}

	// TODO: `label`/`getLabel` above show the raw field name/indexed value. Swap in a translated facet label and
	// confirm whether the indexed call names need their own display mapping once real data is in the index.

	return (
		<SearchView<WebsiteDocument>
			getHref={getHref}
			label={t("Projekte filtern")}
			onParamsChange={onParamsChange}
			params={params}
			renderFacets={renderFacets}
			renderItem={renderItem}
			search={search}
		/>
	);
}
