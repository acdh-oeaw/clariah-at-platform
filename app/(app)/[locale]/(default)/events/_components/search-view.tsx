"use client";

import cn from "clsx/lite";
import { SearchIcon } from "lucide-react";
import { useExtracted } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Fragment, type ReactNode, useEffect, useId, useState } from "react";

import { Button } from "#/components/ui/button.tsx";
import { type SearchOutcome, type SearchParams, useSearch } from "#/lib/search/use-search.ts";

/** Typesense's match-all query. */
const matchAll = "*";
const debounceMilliseconds = 250;

/** Like a debounced value, but `flush` applies the current value right away, e.g. when the form is submitted. */
function useDebouncedValue<T>(value: T, delay: number): [T, () => void] {
	const [debounced, setDebounced] = useState(value);

	useEffect(() => {
		const id = setTimeout(() => {
			setDebounced(value);
		}, delay);

		return () => {
			clearTimeout(id);
		};
	}, [value, delay]);

	function flush(): void {
		setDebounced(value);
	}

	return [debounced, flush];
}

export interface SearchViewSection<Document extends { id: string }> {
	id: string;
	title: string;
	/** Must be referentially stable across renders, e.g. a `useCallback` if it closes over the current locale. */
	search: (params: SearchParams) => Promise<SearchOutcome<Document> | null>;
	/** How many results to load at once, and with each "load more". Typesense caps this at 250. */
	perPage: number;
	/**
	 * Groups consecutive results under a heading, e.g. their year. Results for which this returns `null` get no heading.
	 * Must be referentially stable, like `search`.
	 */
	getGroup?: (document: Document) => string | null;
}

export interface RenderItemContext {
	/** One level below the group heading, if the result has one, so the outline stays intact. */
	headingLevel: 3 | 4;
}

interface SearchViewProps<Document extends { id: string }> {
	/** Each section runs its own search for the shared query, and loads more results independently. */
	sections: ReadonlyArray<SearchViewSection<Document>>;
	renderItem: (document: Document, context: RenderItemContext) => ReactNode;
	/** Wraps the form and the results. Defaults to a simple vertical stack. */
	className?: string;
	/** Wraps the results `<ul>`. Defaults to a card grid; pass a vertical stack for a plain text-result list instead. */
	resultsClassName?: string;
}

const defaultClassName = "flex flex-col gap-y-8";
const defaultResultsClassName = "mt-12 grid grid-cols-[repeat(auto-fill,minmax(min(100%,20rem),1fr))] gap-8";

export function SearchView<Document extends { id: string }>(props: Readonly<SearchViewProps<Document>>): ReactNode {
	const { className = defaultClassName, renderItem, resultsClassName = defaultResultsClassName, sections } = props;

	const t = useExtracted();
	const searchParams = useSearchParams();

	const [input, setInput] = useState(() => searchParams.get("q") ?? "");
	const [query, flushQuery] = useDebouncedValue(input.trim(), debounceMilliseconds);
	const inputId = useId();

	/** Keep the address bar shareable. Next syncs `history.replaceState` with `useSearchParams`. */
	useEffect(() => {
		const params = new URLSearchParams();
		if (query !== "") {
			params.set("q", query);
		}
		const serialized = params.toString();

		window.history.replaceState(null, "", serialized !== "" ? `?${serialized}` : window.location.pathname);
	}, [query]);

	return (
		<div className={className}>
			<form
				className="flex flex-col gap-y-2"
				onSubmit={(event) => {
					event.preventDefault();
					// Results already update while typing; submitting just skips the wait.
					flushQuery();
				}}
				role="search"
			>
				<label className="font-strong text-text-strong" htmlFor={inputId}>
					{t("Events durchsuchen")}
				</label>
				<div className="flex gap-x-2">
					<input
						className="min-w-0 flex-1 border border-stroke-weak bg-white px-4 py-2.5 text-regular"
						id={inputId}
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

			{sections.map((section) => (
				<SearchResults<Document>
					key={section.id}
					query={query}
					renderItem={renderItem}
					resultsClassName={resultsClassName}
					section={section}
				/>
			))}
		</div>
	);
}

interface SearchResultsProps<Document extends { id: string }> {
	query: string;
	section: SearchViewSection<Document>;
	renderItem: (document: Document, context: RenderItemContext) => ReactNode;
	resultsClassName: string;
}

interface MoreResults<Document> {
	/** The query these pages belong to; a different query discards them without an extra request. */
	query: string;
	/** Pages after the first, in order. */
	pages: Array<SearchOutcome<Document>>;
	status: "error" | "idle" | "loading";
}

interface ResultGroup<Document> {
	label: string | null;
	documents: Array<Document>;
}

function SearchResults<Document extends { id: string }>(props: Readonly<SearchResultsProps<Document>>): ReactNode {
	const { query, renderItem, resultsClassName, section } = props;

	const t = useExtracted();

	const searchQuery = query === "" ? matchAll : query;

	/** The first page goes through `useSearch`, which keeps the previous results on screen while a new query loads. */
	const state = useSearch({ query: searchQuery, page: 1, perPage: section.perPage, search: section.search });

	const [more, setMore] = useState<MoreResults<Document>>({ query, pages: [], status: "idle" });
	const morePages = more.query === query ? more.pages : [];
	const moreStatus = more.query === query ? more.status : "idle";

	const pagination = morePages.at(-1)?.pagination ?? state.outcome?.pagination;
	const hasMore = state.status === "success" && pagination != null && pagination.page < pagination.totalPages;

	async function loadMore(): Promise<void> {
		const requestQuery = query;
		const page = (pagination?.page ?? 1) + 1;
		setMore({ query: requestQuery, pages: morePages, status: "loading" });

		let outcome: SearchOutcome<Document> | null;
		try {
			outcome = await section.search({ query: searchQuery, page, perPage: section.perPage });
		} catch {
			outcome = null;
		}

		setMore((current) => {
			/** The query changed while this page was loading, so it belongs to results which are no longer shown. */
			if (current.query !== requestQuery) {
				return current;
			}
			return outcome != null
				? { query: requestQuery, pages: [...current.pages, outcome], status: "idle" }
				: { ...current, status: "error" };
		});
	}

	const documents =
		state.outcome != null
			? [...state.outcome.items, ...morePages.flatMap((page) => page.items)].map(({ document }) => document)
			: [];

	/** Consecutive results with the same group share one heading, which also carries on across "load more". */
	const groups: Array<ResultGroup<Document>> = [];
	for (const document of documents) {
		const label = section.getGroup?.(document) ?? null;
		const last = groups.at(-1);
		if (last?.label === label) {
			last.documents.push(document);
		} else {
			groups.push({ label, documents: [document] });
		}
	}

	const isLoading = state.status === "loading";

	return (
		<section className="flex flex-col gap-y-8">
			<h2 className="text-h2 font-strong text-text-strong">{section.title}</h2>

			{state.status === "error" ? <p role="alert">{t("Suche derzeit nicht verfügbar.")}</p> : null}

			{state.status === "success" && documents.length === 0 ? <p>{t("Keine Ergebnisse.")}</p> : null}

			{documents.length > 0 ? (
				<div className="flex flex-col gap-y-8">
					<div
						aria-busy={isLoading}
						className={cn("flex flex-col gap-y-8", isLoading && "opacity-60 transition-opacity")}
					>
						{groups.map((group, index) => (
							// Labels can repeat, e.g. an ungrouped run on either side of a group, so the index keeps keys unique.
							<Fragment key={`${String(index)}:${group.label ?? ""}`}>
								{group.label != null ? <h3 className="text-h3 font-strong text-text-strong">{group.label}</h3> : null}
								<ul className={resultsClassName} role="list">
									{group.documents.map((document) => (
										<li key={document.id} className="flex flex-col gap-y-1">
											{renderItem(document, { headingLevel: group.label != null ? 4 : 3 })}
										</li>
									))}
								</ul>
							</Fragment>
						))}
					</div>

					{moreStatus === "error" ? <p role="alert">{t("Weitere Ergebnisse konnten nicht geladen werden.")}</p> : null}

					{hasMore ? (
						<Button
							className="self-start"
							isPending={moreStatus === "loading"}
							onPress={() => {
								void loadMore();
							}}
							variant="outline"
						>
							{t("Mehr laden")}
						</Button>
					) : null}
				</div>
			) : null}
		</section>
	);
}
