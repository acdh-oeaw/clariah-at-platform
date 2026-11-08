"use client";

import cn from "clsx/lite";
import { useExtracted, useFormatter } from "next-intl";
import { type ReactNode, useEffect, useState } from "react";

import { Pagination } from "#/app/(app)/[locale]/(default)/_components/pagination.tsx";
import { SearchForm } from "#/app/(app)/[locale]/(default)/_components/search-form.tsx";
import { type SearchOutcome, type SearchParams, type SelectedFacets, useSearch } from "#/lib/search/use-search.ts";

/** Typesense's match-all query. */
const matchAll = "*";
const resultsPerPage = 25;
const debounceMilliseconds = 250;

/** Results which can be in the first row of the widest grid, and whose images should therefore not be lazy loaded. */
export const eagerResultCount = 3;

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

/** The part of a search's state that belongs in the url, owned by the caller. */
export interface SearchViewParams {
	query: string;
	page: number;
	facets: SelectedFacets;
}

interface SearchViewProps<Document extends { id: string }> {
	/** Accessible name for the search input. */
	label: string;

	params: SearchViewParams;
	/** Called when the url should change. `SearchView` never touches the url itself. */
	onParamsChange: (params: SearchViewParams) => void;
	/** For `Pagination`'s links. */
	getHref: (params: SearchViewParams) => string;
	/** Must be referentially stable across renders, e.g. a `useCallback` if it closes over the current locale. */
	search: (params: SearchParams) => Promise<SearchOutcome<Document> | null>;
	renderItem: (document: Document, index: number) => ReactNode;

	className?: string;

	resultsClassName?: string;
	/** `facets` is `undefined` until the first response arrives. */
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

	/** A local draft so typing feels instant, debounced before it reaches the url. */
	const [input, setInput] = useState(params.query);
	/** Resets the draft when `params.query` changes from outside, e.g. on back/forward navigation. */
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
		/** Keeps the footer below the fold until the first results are in. */
		<div className={cn(className, isLoading && state.outcome == null && "min-block-svh")}>
			<SearchForm label={label} onChange={setInput} value={input} />

			{renderFacets != null ? (
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

			{state.status === "error" ? <p role="alert">{t("Die Suche ist derzeit nicht verfügbar.")}</p> : null}

			{state.status === "success" && state.outcome.items.length === 0 ? <p>{t("Keine Ergebnisse.")}</p> : null}

			{state.outcome != null && state.outcome.items.length > 0 ? (
				<div className="flex flex-col gap-y-8">
					<div>
						<h2 className="text-2xl mb-4">
							{t("{total} Suchergebnisse", { total: format.number(state.outcome.pagination.total) })}
						</h2>
						<Pagination
							label={t("Seitennavigation oben")}
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
						{state.outcome.items.map(({ document }, index) => (
							<li key={document.id} className="flex flex-col gap-y-1">
								{renderItem(document, index)}
							</li>
						))}
					</ul>

					<Pagination
						label={t("Seitennavigation unten")}
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
