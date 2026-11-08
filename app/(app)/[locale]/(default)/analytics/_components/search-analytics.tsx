import { useExtracted, useFormatter } from "next-intl";
import { type ReactNode, useId } from "react";

import {
	useFacetLabel as useProjectCallLabel,
	useStatusLabel as useProjectStatusLabel,
} from "#/app/(app)/[locale]/(default)/projects/_components/facet-labels.ts";
import { useFacetLabel as useSearchTypeLabel } from "#/app/(app)/[locale]/(default)/search/_components/facet-labels.ts";
import type { SearchPage } from "#/lib/analytics/search.ts";
import {
	type PageSearchAnalytics,
	getSearchAnalytics,
	minKeywordVisits,
	searchAnalyticsDays,
} from "#/lib/data/analytics.ts";

/** Pages without filters, which list no filter values. */
const pagesWithoutFilters = new Set<SearchPage>(["news", "events"]);

/**
 * Searches and filters per list page over the last `searchAnalyticsDays` days: the number of searches and how many
 * found nothing, the most searched keywords, and the filter values selected most often. Keywords are listed only when
 * searched in a few visits at least: they are free text, and the page is public. Pages with nothing tracked yet are
 * left out.
 */
export async function SearchAnalytics(): Promise<ReactNode> {
	const pages = await getSearchAnalytics();

	if (pages == null) {
		return null;
	}

	return <SearchAnalyticsContent pages={pages} />;
}

interface SearchAnalyticsContentProps {
	pages: ReadonlyArray<PageSearchAnalytics>;
}

function SearchAnalyticsContent(props: Readonly<SearchAnalyticsContentProps>): ReactNode {
	const { pages } = props;

	const t = useExtracted();
	const id = useId();

	const pagesWithData = pages.filter((page) => page.searches > 0 || page.filters.length > 0);

	return (
		<section aria-labelledby={`${id}-heading`} className="flex flex-col gap-y-8">
			<h2 className="text-h2" id={`${id}-heading`}>
				{t("Suchen und Filter")}
			</h2>
			<p className="max-w-prose">
				{t(
					"Wie die Website-Suche und die Suchen und Filter der Listenseiten in den vergangenen {days} Tagen genutzt wurden. Suchbegriffe werden nur aufgeführt, wenn in mindestens {visits} Besuchen nach ihnen gesucht wurde.",
					{ days: String(searchAnalyticsDays), visits: String(minKeywordVisits) },
				)}
			</p>
			{pagesWithData.length > 0 ? (
				pagesWithData.map((page) => <PageSearches key={page.page} page={page} />)
			) : (
				<p>{t("Bisher wurden keine Suchanfragen oder Filter erfasst.")}</p>
			)}
		</section>
	);
}

function PageSearches(props: Readonly<{ page: PageSearchAnalytics }>): ReactNode {
	const { page } = props;

	const t = useExtracted();
	const format = useFormatter();
	const id = useId();
	const getFilterLabel = useFilterLabel();
	const getValueLabel = useValueLabel();

	const pageTitles: Record<SearchPage, string> = {
		search: t("Website-Suche"),
		resources: t("Ressourcen"),
		projects: t("Projekte"),
		news: t("News"),
		events: t("Events"),
	};

	const hasFilters = !pagesWithoutFilters.has(page.page);

	return (
		<section aria-labelledby={`${id}-heading`} className="flex flex-col gap-y-6">
			<h3 className="text-h3" id={`${id}-heading`}>
				{pageTitles[page.page]}
			</h3>

			<dl className="grid gap-6 sm:grid-cols-2">
				<div className="flex flex-col gap-y-1 rounded-md bg-primary-100 p-6">
					<dt className="text-small">{t("Suchanfragen")}</dt>
					<dd className="order-first text-h2">{format.number(page.searches)}</dd>
				</div>
				{page.searches > 0 ? (
					<div className="flex flex-col gap-y-1 rounded-md bg-primary-100 p-6">
						<dt className="text-small">{t("Suchanfragen ohne Ergebnis")}</dt>
						<dd className="order-first text-h2">
							{format.number(page.searchesWithoutResults / page.searches, {
								style: "percent",
								maximumFractionDigits: 0,
							})}
						</dd>
					</div>
				) : null}
			</dl>

			<div className="grid gap-x-16 gap-y-8 lg:grid-cols-2">
				<UsageTable
					caption={t("Häufigste Suchbegriffe")}
					columns={[t("Suchbegriff"), t("Suchanfragen")]}
					empty={t("Bisher wurde kein Begriff in mindestens {visits} Besuchen gesucht.", {
						visits: String(minKeywordVisits),
					})}
					rows={page.keywords.map((keyword) => {
						return { key: keyword.keyword, cells: [keyword.keyword], value: keyword.searches };
					})}
				/>
				{hasFilters ? (
					<UsageTable
						caption={t("Häufigste Filter")}
						columns={[t("Filter"), t("Wert"), t("Ausgewählt")]}
						empty={t("Bisher wurde kein Filter verwendet.")}
						rows={page.filters.map((filter) => {
							return {
								key: `${filter.filter}:${filter.value}`,
								cells: [
									getFilterLabel(page.page, filter.filter),
									getValueLabel(page.page, filter.filter, filter.value),
								],
								value: filter.selections,
							};
						})}
					/>
				) : null}
			</div>
		</section>
	);
}

interface UsageTableProps {
	caption: string;
	/** The last is the count's, aligned to the end. */
	columns: ReadonlyArray<string>;
	empty: string;
	rows: ReadonlyArray<{ key: string; cells: ReadonlyArray<string>; value: number }>;
}

/** A ranked list, as a table under its caption, or a note saying there is nothing to list yet. */
function UsageTable(props: Readonly<UsageTableProps>): ReactNode {
	const { caption, columns, empty, rows } = props;

	const format = useFormatter();

	return (
		<div className="overflow-x-auto">
			<table className="w-full text-start">
				<caption className="pb-3 text-start font-bold">{caption}</caption>
				<thead>
					<tr className="border-b-2 border-stroke-strong">
						{columns.map((column, index) => (
							<th
								key={column}
								className={index === columns.length - 1 ? "py-3 ps-6 text-end" : "py-3 pe-6 text-start"}
								scope="col"
							>
								{column}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.length > 0 ? (
						rows.map((row) => (
							<tr key={row.key} className="border-b border-stroke-weak">
								{row.cells.map((cell, index) => (
									<td key={columns[index]} className="py-3 pe-6 text-start wrap-anywhere">
										{cell}
									</td>
								))}
								<td className="py-3 ps-6 text-end tabular-nums">{format.number(row.value)}</td>
							</tr>
						))
					) : (
						<tr>
							<td className="py-3" colSpan={columns.length}>
								{empty}
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
}

/** The filters' labels, as on their pages. */
function useFilterLabel(): (page: SearchPage, filter: string) => string {
	const t = useExtracted();

	const labels: Partial<Record<SearchPage, Record<string, string>>> = {
		search: { type: t("Typ") },
		resources: { type: t("Typ") },
		projects: { project_call: t("Förderprogramm"), project_status: t("Projektstatus") },
	};

	return (page, filter) => labels[page]?.[filter] ?? filter;
}

/** The filter values' labels, as on their pages, or the raw value for one not known (any longer). */
function useValueLabel(): (page: SearchPage, filter: string, value: string) => string {
	const getSearchTypeLabel = useSearchTypeLabel();
	const getProjectCallLabel = useProjectCallLabel();
	const getProjectStatusLabel = useProjectStatusLabel();

	const labels: Partial<Record<SearchPage, Record<string, (value: string) => string>>> = {
		search: { type: getSearchTypeLabel },
		projects: { project_call: getProjectCallLabel, project_status: getProjectStatusLabel },
	};

	return (page, filter, value) => labels[page]?.[filter]?.(value) ?? value;
}

export function SearchAnalyticsSkeleton(): ReactNode {
	const t = useExtracted();

	return (
		<div
			aria-busy={true}
			aria-label={t("Suchstatistik wird geladen …")}
			className="flex flex-col gap-y-8"
			role="status"
		>
			<div className="h-12 w-1/2 animate-pulse rounded-md bg-primary-100" />
			<div className="h-64 animate-pulse rounded-md bg-primary-100" />
		</div>
	);
}
