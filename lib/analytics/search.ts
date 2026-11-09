/** What a list page shows: the results of a search, narrowed down by filters, one page of them at a time. */
export interface SearchState {
	/** Empty without a query. */
	keyword: string;
	/** Selected values by facet, known values only. */
	filters: Readonly<Record<string, ReadonlyArray<string>>>;
	page: number;
	count: number;
}

export type SearchCommand =
	| { type: "site-search"; keyword: string; category: string; count: number }
	| { type: "event"; category: string; action: string; name: string; value?: number };

/** The list pages which track searches, filters and paging, as they are named in Matomo. */
export const searchPages = ["search", "resources", "projects", "news", "events"] as const;

export type SearchPage = (typeof searchPages)[number];

/** Event categories. */
export const searchEventCategories = {
	filter: "Search filter",
	pagination: "Pagination",
	search: "Site search",
} as const;

/**
 * Event actions are `page: subject` - `resources: keyword`, `resources: type`, `search: page` - and unique across
 * categories, so the analytics page can read them all from one Events report, with the event names as its subtable:
 * Matomo groups events by action across categories, and its segments select whole visits rather than events, so a
 * category cannot be picked out reliably.
 */
export function getSearchEventAction(page: SearchPage, subject: string): string {
	return `${page}: ${subject}`;
}

/** Subjects for the keyword and the page of results, which are no facet's name. */
export const searchEventSubjects = { keyword: "keyword", page: "page" } as const;

/**
 * What to tell Matomo about a list page's state, given the state it was last told about - `null` when the user has just
 * arrived on the page:
 *
 * - A new keyword, as a site search, with the page as its category, and as an event, with the page in its action. Both
 *   with the number of results. Matomo's segments select whole visits, so a visit which searched on two pages would
 *   show up under both: the site search category tells searches per page apart in the Site search categories report,
 *   the event does in the keywords per page, which the Events report has exactly. The keyword is lowercased in the
 *   event, as Matomo does for site searches.
 * - An event for each newly selected filter value, with the number of results it leads to.
 * - An event for a page of results past the first, so it is known how far users page through them.
 *
 * None of these is a page view in Matomo's reports. A filter value deselected is not tracked, nor is the same keyword
 * with other filters: the filter events say how a search was narrowed down.
 */
export function getSearchCommands(
	page: SearchPage,
	previous: SearchState | null,
	next: SearchState,
): Array<SearchCommand> {
	const commands: Array<SearchCommand> = [];

	if (next.keyword.length > 0 && next.keyword !== previous?.keyword) {
		commands.push(
			{ type: "site-search", keyword: next.keyword, category: page, count: next.count },
			{
				type: "event",
				category: searchEventCategories.search,
				action: getSearchEventAction(page, searchEventSubjects.keyword),
				name: next.keyword.toLowerCase(),
				value: next.count,
			},
		);
	}

	for (const [filter, values] of Object.entries(next.filters)) {
		const previousValues = previous?.filters[filter] ?? [];

		for (const value of values) {
			if (!previousValues.includes(value)) {
				commands.push({
					type: "event",
					category: searchEventCategories.filter,
					action: getSearchEventAction(page, filter),
					name: value,
					value: next.count,
				});
			}
		}
	}

	if (next.page > 1 && next.page !== (previous?.page ?? 1)) {
		commands.push({
			type: "event",
			category: searchEventCategories.pagination,
			action: getSearchEventAction(page, searchEventSubjects.page),
			name: String(next.page),
		});
	}

	return commands;
}
