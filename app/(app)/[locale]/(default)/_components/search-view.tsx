"use client";

import cn from "clsx/lite";
import { SearchIcon } from "lucide-react";
import { useExtracted, useFormatter } from "next-intl";
import { type ReactNode, useEffect, useState } from "react";

import { Pagination } from "#/app/(app)/[locale]/(default)/_components/pagination";
import { Button } from "#/components/ui/button";
import { type SearchOutcome, type SearchParams, type SelectedFacets, useSearch } from "#/lib/search/use-search.ts";

/** Typesense's match-all query. */
const matchAll = "*";
const resultsPerPage = 25;
const debounceMilliseconds = 250;

function useDebouncedValue<T>(value: T, delay: number): T {
	const [debounced, setDebounced] = useState(value);

	useEffect(() => {
		const id = setTimeout(() => {
			setDebounced(value);
		}, delay);

		return () => {
			clearTimeout(id);
		};
	}, [value, delay]);

	return debounced;
}

/** The part of a search's state that belongs in the url — owned by the caller, not `SearchView` itself. */
export interface SearchViewParams {
	query: string;
	page: number;
	facets: SelectedFacets;
}

interface SearchViewProps<Document extends { id: string }> {
	/** Accessible name for the search input, e.g. "Search website" — each page's own wording. */
	label: string;
	/** The committed params this search is currently showing results for — the caller's url-encoded state. */
	params: SearchViewParams;
	/**
	 * Called whenever the user's action should change the url: typing (debounced, resets `page` to 1), picking a facet
	 * (resets `page` to 1), or clicking a `Pagination` link. `SearchView` never touches the url itself — the caller
	 * re-encodes `params` with its own page-specific codec and pushes it.
	 */
	onParamsChange: (params: SearchViewParams) => void;
	/** A real, shareable url for `params` — used for `Pagination`'s links only (so they're right-clickable). */
	getHref: (params: SearchViewParams) => string;
	/** Must be referentially stable across renders, e.g. a `useCallback` if it closes over the current locale. */
	search: (params: SearchParams) => Promise<SearchOutcome<Document> | null>;
	renderItem: (document: Document) => ReactNode;
	/** Wraps the form and the results. Defaults to a simple vertical stack. */
	className?: string;
	/** Wraps the results `<ul>`. Defaults to a card grid; pass a vertical stack for a plain text-result list instead. */
	resultsClassName?: string;
	/**
	 * Renders a facet UI (checkboxes, a filter sidebar, ...) between the form and the results. Omit for a page with no
	 * faceting. `facets` is `undefined` until the first response arrives, and absent from the response entirely unless
	 * `search` itself requests counts for at least one field — the caller decides which fields matter, `SearchView` just
	 * carries whatever it's given.
	 */
	renderFacets?: (params: {
		facets: SearchOutcome<Document>["facets"];
		selected: SelectedFacets;
		onChange: (field: string, values: ReadonlyArray<string>) => void;
	}) => ReactNode;
}

const defaultClassName = "flex flex-col gap-y-8";
const defaultResultsClassName = "grid grid-cols-[repeat(auto-fill,minmax(min(100%,20rem),1fr))] gap-8";

export function SearchView<Document extends { id: string }>(props: Readonly<SearchViewProps<Document>>): ReactNode {
	const {
		className = defaultClassName,
		getHref,
		label,
		onParamsChange,
		params,
		renderFacets,
		renderItem,
		resultsClassName = defaultResultsClassName,
		search,
	} = props;

	const t = useExtracted();
	const format = useFormatter();

	/** A local draft so typing feels instant; debounced before it becomes part of `params` (and the url). */
	const [input, setInput] = useState(params.query);
	/**
	 * The committed query this draft was last reset from. When `params.query` changes from outside (browser back/forward,
	 * or a facet/page change elsewhere resetting it) and doesn't match, the draft snaps to it — adjusted here during
	 * render rather than in an effect, so it takes effect in the same render instead of a second one. A no-op when it's
	 * our own debounced value flowing back through the caller.
	 */
	const [syncedQuery, setSyncedQuery] = useState(params.query);
	if (params.query !== syncedQuery) {
		setSyncedQuery(params.query);
		setInput(params.query);
	}

	const debouncedInput = useDebouncedValue(input.trim(), debounceMilliseconds);

	useEffect(() => {
		if (debouncedInput !== params.query) {
			onParamsChange({ facets: params.facets, page: 1, query: debouncedInput });
		}
		// `params.facets`/`params.query` are read, not just depended on for re-triggering: the guard above already
		// makes this a no-op whenever they (not `debouncedInput`) are what changed, so listing them is honest, not risky.
	}, [debouncedInput, onParamsChange, params.facets, params.query]);

	const isBrowsing = params.query === "";
	const state = useSearch({
		query: isBrowsing ? matchAll : params.query,
		page: params.page,
		perPage: resultsPerPage,
		facets: params.facets,
		search,
	});

	const isLoading = state.status === "loading";

	return (
		<div className={className}>
			<form
				className="flex flex-col gap-y-2"
				onSubmit={(event) => {
					event.preventDefault();
				}}
				role="search"
			>
				<div className="flex gap-x-2">
					<input
						aria-label={label}
						className="min-w-0 flex-1 border border-stroke-weak bg-white px-4 py-2.5 text-regular"
						name="q"
						onChange={(event) => {
							setInput(event.currentTarget.value);
						}}
						type="search"
						value={input}
					/>
					<Button startIcon={<SearchIcon aria-hidden={true} />} type="submit" variant="outline">
						{t("Suchen")}
					</Button>
				</div>
			</form>

			{renderFacets != null ? (
				// `self-start`: the outer column's children stretch to full width by default (the form, results and
				// pagination all want that), but the facets slot should size to its own content instead.
				<div className="self-start">
					{renderFacets({
						facets: state.outcome?.facets,
						selected: params.facets,
						onChange: (field, values) => {
							const nextFacets =
								values.length === 0
									? // Not `{ [field]: _removed, ...rest }`: React Compiler doesn't lower computed-key object destructuring.
										Object.fromEntries(Object.entries(params.facets).filter(([key]) => key !== field))
									: { ...params.facets, [field]: values };

							onParamsChange({ facets: nextFacets, page: 1, query: params.query });
						},
					})}
				</div>
			) : null}

			{state.status === "error" ? <p role="alert">{t("Search is currently unavailable.")}</p> : null}

			{state.status === "success" && state.outcome.items.length === 0 ? <p>{t("No results found.")}</p> : null}

			{state.outcome != null && state.outcome.items.length > 0 ? (
				<div className="flex flex-col gap-y-8">
					<div>
						<h2 className="text-2xl">
							{t("{total} Suchergebnisse", { total: format.number(state.outcome.pagination.total) })}
						</h2>
						<Pagination
							getHref={(targetPage) => getHref({ ...params, page: targetPage })}
							onChange={(targetPage) => {
								onParamsChange({ ...params, page: targetPage });
							}}
							page={params.page}
							totalPages={state.outcome.pagination.totalPages}
						/>
					</div>
					<ul
						aria-busy={isLoading}
						className={cn(resultsClassName, isLoading && "opacity-60 transition-opacity")}
						role="list"
					>
						{state.outcome.items.map(({ document }) => (
							<li key={document.id} className="flex flex-col gap-y-1">
								{renderItem(document)}
							</li>
						))}
					</ul>

					<Pagination
						getHref={(targetPage) => getHref({ ...params, page: targetPage })}
						onChange={(targetPage) => {
							onParamsChange({ ...params, page: targetPage });
						}}
						page={params.page}
						totalPages={state.outcome.pagination.totalPages}
					/>
				</div>
			) : null}
		</div>
	);
}
