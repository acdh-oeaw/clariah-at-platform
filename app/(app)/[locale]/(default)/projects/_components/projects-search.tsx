"use client";

import { useExtracted } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useCallback, useState } from "react";

import { SearchView, type SearchViewParams } from "#/app/(app)/[locale]/(default)/_components/search-view.tsx";
import { useFacetLabel } from "#/app/(app)/[locale]/(default)/projects/_components/facet-labels";
import {
	type ProjectStatus,
	projectStatuses,
	searchParams,
} from "#/app/(app)/[locale]/(default)/projects/search-params.ts";
import { SearchFacetFilter } from "#/app/(app)/[locale]/(default)/search/_components/facet-filter.tsx";
import { Card } from "#/components/card";
import { getAssetImageUrl } from "#/lib/data/api-client";
import type { IntlLocale } from "#/lib/i18n/locales.ts";
import { localizeHref } from "#/lib/navigation/convert";
import type { WebsiteFilterField } from "#/lib/search/collections/website.ts";
import type { SearchFilter } from "#/lib/search/filters.ts";
import type { WebsiteDocument } from "#/lib/search/index.ts";
import { getSearchService } from "#/lib/search/service.ts";
import type { SearchOutcome, SearchParams, SelectedFacets } from "#/lib/search/use-search.ts";

const facetField = "project_call";
/** Not an indexed facet field: its values and counts are derived from `end_date` in `search` below. */
const statusField = "project_status";

interface ProjectsSearchProps {
	locale: IntlLocale;
}

function toProjectStatus(value: string | undefined): ProjectStatus | undefined {
	return projectStatuses.find((projectStatus) => projectStatus === value);
}

function toRawSearchParams(params: SearchViewParams): {
	q: string;
	project_call: string | undefined;
	project_status: ProjectStatus | undefined;
	page: number;
} {
	return {
		q: params.query,
		page: params.page,
		project_call: params.facets[facetField]?.[0],
		// The statuses are mutually exclusive, so the most recently picked one replaces the previous one.
		project_status: toProjectStatus(params.facets[statusField]?.at(-1)),
	};
}

function toSearchViewParams(raw: {
	q: string;
	project_call?: string | undefined;
	project_status?: ProjectStatus | undefined;
	page: number;
}): SearchViewParams {
	const facets: SelectedFacets = {};
	if (raw.project_call != null) {
		facets[facetField] = [raw.project_call];
	}
	if (raw.project_status != null) {
		facets[statusField] = [raw.project_status];
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
	 * Start of the current UTC day. Project dates are UTC days (midnight timestamps), so a project ending today still
	 * counts as ongoing. Fixed on mount, so results and counts split at the same instant.
	 */
	const [today] = useState(() => {
		const date = new Date();
		return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
	});

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

	function getStatusLabel(value: string): string {
		switch (toProjectStatus(value)) {
			case "ongoing": {
				return t("Laufend");
			}
			case "completed": {
				return t("Abgeschlossen");
			}
			case undefined: {
				return value;
			}
		}
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

	// Depends on `locale` and `today` only, so it stays referentially stable across re-renders.
	const search = useCallback(
		async (params: SearchParams): Promise<SearchOutcome<WebsiteDocument> | null> => {
			/**
			 * Projects without an `end_date` match neither status: typesense never matches a missing field, so "no end date
			 * yet" cannot be expressed as a filter (see `events-search.tsx`).
			 */
			const statusFilters: Record<ProjectStatus, SearchFilter<WebsiteFilterField>> = {
				ongoing: { operator: "range", field: "end_date", min: today },
				completed: { operator: "range", field: "end_date", max: today - 1 },
			};

			const baseFilters: Array<SearchFilter<WebsiteFilterField>> = [
				{ operator: "equals", field: "type", value: "project" },
				{ operator: "equals", field: "locale", value: locale },
			];
			const selectedCalls = params.facets?.[facetField] ?? [];
			const callFilters: Array<SearchFilter<WebsiteFilterField>> =
				selectedCalls.length > 0 ? [{ operator: "equals", field: facetField, value: selectedCalls }] : [];
			const selectedStatus = toProjectStatus(params.facets?.[statusField]?.[0]);

			const website = getSearchService().collections.website;

			/**
			 * Status counts are disjunctive like the funding call's: they apply the selected call, but not the selected
			 * status, so they show how many results picking the other status would give.
			 */
			const [result, ...statusCounts] = await Promise.all([
				website.search({
					...params,
					filters: selectedStatus != null ? [...baseFilters, statusFilters[selectedStatus]] : baseFilters,
					facets: { [facetField]: { values: selectedCalls } },
				}),
				...projectStatuses.map((projectStatus) =>
					website.search({
						query: params.query,
						perPage: 0,
						filters: [...baseFilters, ...callFilters, statusFilters[projectStatus]],
					}),
				),
			]);
			if (result.isErr()) {
				return null;
			}

			const statusValues = projectStatuses.flatMap((projectStatus, index) => {
				const count = statusCounts[index];
				return count?.isOk() === true && count.value.pagination.total > 0
					? [{ value: projectStatus, count: count.value.pagination.total, highlighted: projectStatus }]
					: [];
			});

			return { ...result.value, facets: { ...result.value.facets, [statusField]: { values: statusValues } } };
		},
		[locale, today],
	);

	function renderFacets(params: {
		facets: SearchOutcome<WebsiteDocument>["facets"];
		selected: SelectedFacets;
		onChange: (field: string, values: ReadonlyArray<string>) => void;
	}): ReactNode {
		const { facets, onChange, selected } = params;
		const facet = facets?.[facetField];
		const statusFacet = facets?.[statusField];

		return (
			<div className="flex flex-wrap gap-2">
				{facet?.values.length === 0 ? null : (
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
				)}
				{statusFacet?.values.length === 0 && selected[statusField] == null ? null : (
					<SearchFacetFilter
						getLabel={getStatusLabel}
						facet={statusFacet}
						isLoading={facets == null}
						label={t("Projektstatus")}
						onChange={(values) => {
							onChange(statusField, values);
						}}
						selected={selected[statusField] ?? []}
					/>
				)}
			</div>
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
