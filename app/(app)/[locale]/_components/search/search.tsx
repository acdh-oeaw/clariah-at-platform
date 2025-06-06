"use client";

import type { UiState } from "instantsearch.js";
import type { ReactNode } from "react";
import { Configure } from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";

import { Filters } from "@/app/(app)/[locale]/_components/search/filters";
import { Hits } from "@/app/(app)/[locale]/_components/search/hits";
import { SearchInput } from "@/app/(app)/[locale]/_components/search/search-input";
import { Stats } from "@/app/(app)/[locale]/_components/search/stats";
import { env } from "@/config/env.config";
import type { Locale } from "@/config/i18n.config";
import { filters, hitsPerPage, resourcesFilters } from "@/config/search.config";
import { typesenseInstantsearchAdapter } from "@/lib/typesense/typesense-search-adapter";

interface SearchProps {
	locale: Locale;
	content?: string;
}

export function Search(props: SearchProps): ReactNode {
	const { content, locale } = props;

	const routing = {
		stateMapping: {
			stateToRoute(uiState: UiState) {
				const indexUiState = uiState[env.NEXT_PUBLIC_TYPESENSE_COLLECTION_NAME]!;
				return {
					q: indexUiState.query,
					keywords: indexUiState.refinementList?.keywords ?? [],
					kind: indexUiState.refinementList?.kind ?? [],
				};
			},
			routeToState(routeState: { q?: string; kind?: Array<string>; keywords?: Array<string> }) {
				return {
					[env.NEXT_PUBLIC_TYPESENSE_COLLECTION_NAME]: {
						query: routeState.q,
						refinementList: {
							kind: routeState.kind ?? [],
							keywords: routeState.keywords ?? [],
						},
					},
				};
			},
		},
	};

	return (
		<InstantSearchNext
			indexName={env.NEXT_PUBLIC_TYPESENSE_COLLECTION_NAME}
			routing={routing}
			searchClient={typesenseInstantsearchAdapter.searchClient}
		>
			<Configure
				filters={content === "resources" ? resourcesFilters() : filters(locale)}
				hitsPerPage={hitsPerPage}
			></Configure>
			<div className="relative grid grid-cols-[3fr_1fr] gap-2">
				<div>
					<SearchInput />
					<Stats />
					<Hits />
				</div>
				<div>
					<Filters content={content} />
				</div>
			</div>
		</InstantSearchNext>
	);
}
