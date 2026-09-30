"use client";

import cn from "clsx/lite";
import { useExtracted } from "next-intl";
import { useSearchParams } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";

import { Button } from "#/components/ui/button.tsx";
import { type SearchOutcome, type SearchParams, type SelectedFacets, useSearch } from "#/lib/search/use-search.ts";

/** Typesense's match-all query. */
const matchAll = "*";
const resultsPerPage = 10;
/** What is shown before anything is typed. Typesense caps `per_page` at 250, so "all" is not guaranteed. */
const initialResultsPerPage = 100;
const debounceMilliseconds = 250;

function getPageNumber(value: string | null): number {
	const page = Math.trunc(Number(value ?? ""));
	return Number.isInteger(page) && page > 0 ? page : 1;
}

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

interface SearchViewProps<Document extends { id: string }> {
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
const defaultResultsClassName = "mt-12 grid grid-cols-[repeat(auto-fill,minmax(min(100%,20rem),1fr))] gap-8";

export function SearchView<Document extends { id: string }>(props: Readonly<SearchViewProps<Document>>): ReactNode {
	const {
		className = defaultClassName,
		renderFacets,
		renderItem,
		resultsClassName = defaultResultsClassName,
		search,
	} = props;

	const t = useExtracted();
	const searchParams = useSearchParams();

	const [input, setInput] = useState(() => searchParams.get("q") ?? "");
	const query = useDebouncedValue(input.trim(), debounceMilliseconds);

	/** Persists across query changes — picking a facet refines within it, it doesn't start a new search. */
	const [selectedFacets, setSelectedFacets] = useState<SelectedFacets>({});

	/**
	 * The page belongs to the query+facets it was chosen for, so changing either resets to page 1 without an extra
	 * request.
	 */
	const resetKey = `${query}:${JSON.stringify(selectedFacets)}`;
	const [selectedPage, setSelectedPage] = useState(() => {
		return { resetKey, page: getPageNumber(searchParams.get("page")) };
	});
	const page = selectedPage.resetKey === resetKey ? selectedPage.page : 1;

	const isBrowsing = query === "";
	const state = useSearch({
		query: isBrowsing ? matchAll : query,
		page,
		perPage: isBrowsing ? initialResultsPerPage : resultsPerPage,
		facets: selectedFacets,
		search,
	});

	/** Keep the address bar shareable. Next syncs `history.replaceState` with `useSearchParams`. */
	useEffect(() => {
		const params = new URLSearchParams();
		if (query !== "") {
			params.set("q", query);
			if (page > 1) {
				params.set("page", String(page));
			}
		}
		const serialized = params.toString();

		window.history.replaceState(null, "", serialized !== "" ? `?${serialized}` : window.location.pathname);
	}, [query, page]);

	const isLoading = state.status === "loading";

	return (
		<div className={className}>
			<form
				className="flex"
				onSubmit={(event) => {
					event.preventDefault();
				}}
				role="search"
			>
				<input
					aria-label={t("Suche")}
					className="min-w-0 flex-1 border border-stroke-weak bg-white px-4 py-2.5 text-regular"
					name="q"
					onChange={(event) => {
						setInput(event.currentTarget.value);
					}}
					type="search"
					value={input}
				/>
			</form>

			{renderFacets != null ? (
				// `self-start`: the outer column's children stretch to full width by default (the form, results and
				// pagination all want that), but the facets slot should size to its own content instead.
				<div className="self-start">
					{renderFacets({
						facets: state.outcome?.facets,
						selected: selectedFacets,
						onChange: (field, values) => {
							setSelectedFacets((current) => {
								if (values.length === 0) {
									// Not `{ [field]: _removed, ...rest }`: React Compiler doesn't lower computed-key object destructuring.
									return Object.fromEntries(Object.entries(current).filter(([key]) => key !== field));
								}
								return { ...current, [field]: values };
							});
						},
					})}
				</div>
			) : null}

			{state.status === "error" ? <p role="alert">{t("Suche derzeit nicht verfügbar.")}</p> : null}

			{state.status === "success" && state.outcome.items.length === 0 ? <p>{t("Keine Ergebnisse.")}</p> : null}

			{state.outcome != null && state.outcome.items.length > 0 ? (
				<div className="flex flex-col gap-y-8">
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

					{state.outcome.pagination.totalPages > 1 ? (
						<nav aria-label={t("Suchergebnisseiten")} className="flex items-center gap-x-6">
							{page > 1 ? (
								<Button
									onPress={() => {
										setSelectedPage({ resetKey, page: page - 1 });
									}}
									variant="link-primary"
								>
									{t("Vorherige Seite")}
								</Button>
							) : null}
							<span>
								{t("{page} von {total}", {
									page: String(page),
									total: String(state.outcome.pagination.totalPages),
								})}
							</span>
							{page < state.outcome.pagination.totalPages ? (
								<Button
									onPress={() => {
										setSelectedPage({ resetKey, page: page + 1 });
									}}
									variant="link-primary"
								>
									{t("Nächste Seite")}
								</Button>
							) : null}
						</nav>
					) : null}
				</div>
			) : null}
		</div>
	);
}
