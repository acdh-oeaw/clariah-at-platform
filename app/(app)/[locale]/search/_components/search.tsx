"use client";

import type { ReactNode } from "react";
import { InstantSearchNext } from "react-instantsearch-nextjs";

import { Filters } from "@/app/(app)/[locale]/search/_components/filters";
import { Hits } from "@/app/(app)/[locale]/search/_components/hits";
import { SearchInput } from "@/app/(app)/[locale]/search/_components/search-input";
import { Stats } from "@/app/(app)/[locale]/search/_components/stats";
import { env } from "@/config/env.config";
import { typesenseInstantsearchAdapter } from "@/lib/typesense/typesense-search-adapter";

export function Search(): ReactNode {
	return (
		<InstantSearchNext
			indexName={env.NEXT_PUBLIC_TYPESENSE_COLLECTION_NAME}
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			searchClient={typesenseInstantsearchAdapter.searchClient}
		>
			<div className="relative grid grid-cols-[3fr_1fr] gap-2">
				<div>
					<SearchInput />
					<Stats />
					<Hits />
				</div>
				<div>
					<Filters />
				</div>
			</div>
		</InstantSearchNext>
	);
}
