import { useEffect, useState } from "react";

export interface SearchFacetValue {
	value: string;
	count: number;
	highlighted: string;
}

export interface SearchFacetResult {
	values: Array<SearchFacetValue>;
}
export type SelectedFacets = Record<string, ReadonlyArray<string>>;

export interface SearchParams {
	query: string;
	page: number;
	perPage: number;
	facets?: SelectedFacets;
}

export interface SearchOutcome<Document> {
	items: Array<{ document: Document }>;
	pagination: { page: number; totalPages: number };
	facets?: Record<string, SearchFacetResult>;
}

export type SearchState<Document> =
	/** Keeps the previous outcome, so the results stay on screen while the next ones load. */
	| { status: "loading"; outcome: SearchOutcome<Document> | null }
	| { status: "success"; outcome: SearchOutcome<Document> }
	| { status: "error"; outcome: null };

interface UseSearchParams<Document> extends SearchParams {
	/** Must be referentially stable, e.g. declared at module scope. Resolves to `null` when the search failed. */
	search: (params: SearchParams) => Promise<SearchOutcome<Document> | null>;
}

export function useSearch<Document>(params: UseSearchParams<Document>): SearchState<Document> {
	const { facets, page, perPage, query, search } = params;

	/** The state is only ever set from the promise callback, and `outcome: null` marks a failed search. */
	const [settled, setSettled] = useState<{
		key: string;
		outcome: SearchOutcome<Document> | null;
	} | null>(null);

	const key = `${String(page)}:${String(perPage)}:${query}:${JSON.stringify(facets ?? {})}`;

	useEffect(() => {
		/**
		 * A slower, older response must not overwrite the current one. Held in an object, not a bare `let`: the flag is
		 * flipped by the cleanup below while this effect's own async body is suspended on `await`, which a type checker
		 * cannot see — narrowing a plain boolean here would make it look permanently `false` and the check "unnecessary".
		 */
		const stale = { current: false };

		void (async () => {
			let outcome: SearchOutcome<Document> | null;
			try {
				outcome = await search({ query, page, perPage, facets });
			} catch {
				outcome = null;
			}

			if (!stale.current) {
				setSettled({ key, outcome });
			}
		})();

		return () => {
			stale.current = true;
		};
	}, [facets, key, page, perPage, query, search]);

	if (settled?.key === key) {
		return settled.outcome != null
			? { status: "success", outcome: settled.outcome }
			: { status: "error", outcome: null };
	}

	return { status: "loading", outcome: settled?.outcome ?? null };
}
