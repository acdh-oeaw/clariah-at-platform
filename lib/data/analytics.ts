import "server-only";

import { cacheLife } from "next/cache";
import * as v from "valibot";

import { env } from "#/configs/env.config.ts";
import { type SearchPage, getSearchEventAction, searchEventSubjects, searchPages } from "#/lib/analytics/search.ts";

/** How many months the analytics page shows, up to and including the current one. */
export const analyticsMonths = 12;

/** How many days, up to and including today, the analytics page reports searches and filters for. */
export const searchAnalyticsDays = 90;

/**
 * Keywords are only listed when searched in at least this many visits: they are free text, which may say who searched
 * for them, and the analytics page is public.
 */
export const minKeywordVisits = 3;

/** How many keywords, and filter values, the analytics page lists per page at most. */
const maxRows = 15;

export interface MonthlyVisits {
	/** `YYYY-MM`, in the time zone of the site in matomo. */
	month: string;
	visits: number;
	/**
	 * `null` when matomo does not process unique visitors for months - see `enable_processing_unique_visitors_month` in
	 * its `config.ini.php`.
	 */
	uniqueVisitors: number | null;
	/** Searches on the list pages. `null` for months before the first with any, taken to be before they were tracked. */
	searches: number | null;
}

/** Matomo answers a failed api call with a `200`, and the error in the body. */
const ErrorResponseSchema = v.object({ result: v.literal("error"), message: v.string() });

const MonthSchema = v.union([
	v.object({ nb_visits: v.number(), nb_uniq_visitors: v.optional(v.number()) }),
	/** A month without visits, including those before the site was added to matomo. */
	v.pipe(
		v.tuple([]),
		v.transform(() => {
			return { nb_visits: 0, nb_uniq_visitors: 0 };
		}),
	),
]);

const MonthKeySchema = v.pipe(v.string(), v.regex(/^\d{4}-\d{2}$/));

/** Keyed by `YYYY-MM`. */
const MonthsResponseSchema = v.record(MonthKeySchema, MonthSchema);

const ActionsMonthSchema = v.union([
	v.object({ nb_searches: v.optional(v.number(), 0) }),
	/** A month without actions. */
	v.pipe(
		v.tuple([]),
		v.transform(() => {
			return { nb_searches: 0 };
		}),
	),
]);

/** Keyed by `YYYY-MM`. */
const ActionsMonthsResponseSchema = v.record(MonthKeySchema, ActionsMonthSchema);

const EventRowSchema = v.object({
	label: v.string(),
	nb_events: v.number(),
	nb_visits: v.number(),
	/** `null` for events tracked without a value, e.g. pagination. */
	max_event_value: v.nullish(v.number()),
});

/** Events by action, each with its events by name as a subtable - asked for with `expanded`. */
const EventsResponseSchema = v.array(
	v.object({ ...EventRowSchema.entries, subtable: v.optional(v.array(EventRowSchema), []) }),
);

/**
 * Calls a method of Matomo's reporting api for the site. `null` when no matomo token, base url or site id is
 * configured.
 *
 * The token is sent in the request body, never in the url, where it would end up in access logs.
 */
async function callMatomo(method: string, params: Record<string, string>): Promise<unknown> {
	const token = env.MATOMO_API_TOKEN;
	const baseUrl = env.NEXT_PUBLIC_APP_MATOMO_BASE_URL;
	const siteId = env.NEXT_PUBLIC_APP_MATOMO_ID;

	if (token == null || baseUrl == null || siteId == null) {
		return null;
	}

	const url = new URL("./index.php", baseUrl);
	url.search = new URLSearchParams({
		module: "API",
		method,
		idSite: String(siteId),
		format: "JSON",
		...params,
	}).toString();

	const response = await fetch(url, {
		method: "POST",
		headers: { accept: "application/json" },
		body: new URLSearchParams({ token_auth: token }),
	});

	if (!response.ok) {
		throw new Error(`Matomo api error: ${String(response.status)} ${response.statusText}`);
	}

	const data: unknown = await response.json();

	const error = v.safeParse(ErrorResponseSchema, data);
	if (error.success) {
		throw new Error(`Matomo api error: ${error.output.message}`);
	}

	return data;
}

/**
 * Visits, unique visitors and searches per month, oldest first, ending with the current month, which is still in
 * progress. `null` when analytics are not configured.
 *
 * Matomo archives the current month's reports periodically - by default at most every 15 minutes, or on its cron job's
 * schedule - so an hour's cache leaves the numbers about an hour behind at most.
 */
export async function getMonthlyVisits(): Promise<Array<MonthlyVisits> | null> {
	"use cache";
	cacheLife("hours");

	const params = { period: "month", date: `last${String(analyticsMonths)}` };

	const [visits, actions] = await Promise.all([
		callMatomo("VisitsSummary.get", params),
		callMatomo("Actions.get", params),
	]);

	if (visits == null || actions == null) {
		return null;
	}

	const searches = v.parse(ActionsMonthsResponseSchema, actions);
	let isSearchTracked = false;

	return Object.entries(v.parse(MonthsResponseSchema, visits))
		.toSorted(([a], [b]) => a.localeCompare(b))
		.map(([month, value]) => {
			const monthSearches = searches[month]?.nb_searches ?? 0;
			isSearchTracked ||= monthSearches > 0;

			return {
				month,
				visits: value.nb_visits,
				uniqueVisitors: value.nb_uniq_visitors ?? null,
				searches: isSearchTracked ? monthSearches : null,
			};
		});
}

export interface KeywordUsage {
	keyword: string;
	searches: number;
}

export interface FilterUsage {
	/** The facet's name in the page's url, e.g. `type`. */
	filter: string;
	value: string;
	/** How often the value was selected. */
	selections: number;
}

export interface PageSearchAnalytics {
	page: SearchPage;
	searches: number;
	/** Searches which found nothing. */
	searchesWithoutResults: number;
	/** The most searched keywords, lowercased, searched in at least `minKeywordVisits` visits. */
	keywords: Array<KeywordUsage>;
	/** The filter values selected most often. */
	filters: Array<FilterUsage>;
}

/**
 * Searches and filters per list page over the last `searchAnalyticsDays` days, read from the events `SearchTracker`
 * tracks - see `getSearchCommands`. Matomo's site search reports do not tell the list pages apart, nor would a segment:
 * segments select whole visits. `null` when analytics are not configured.
 *
 * A keyword counts as without results when none of its searches found anything, which is close enough: the number of
 * results only changes as content is added or removed.
 */
export async function getSearchAnalytics(): Promise<Array<PageSearchAnalytics> | null> {
	"use cache";
	cacheLife("hours");

	const data = await callMatomo("Events.getAction", {
		period: "range",
		date: `last${String(searchAnalyticsDays)}`,
		secondaryDimension: "eventName",
		expanded: "1",
		filter_limit: "-1",
	});

	if (data == null) {
		return null;
	}

	const actions = new Map(v.parse(EventsResponseSchema, data).map((row) => [row.label, row.subtable]));

	return searchPages.map((page) => {
		const keywords = actions.get(getSearchEventAction(page, searchEventSubjects.keyword)) ?? [];
		const prefix = getSearchEventAction(page, "");

		const filters: Array<FilterUsage> = [];
		for (const [action, names] of actions) {
			const filter = action.slice(prefix.length);

			if (!action.startsWith(prefix) || filter === searchEventSubjects.keyword || filter === searchEventSubjects.page) {
				continue;
			}

			for (const row of names) {
				filters.push({ filter, value: row.label, selections: row.nb_events });
			}
		}

		return {
			page,
			searches: keywords.reduce((sum, row) => sum + row.nb_events, 0),
			searchesWithoutResults: keywords
				.filter((row) => row.max_event_value === 0)
				.reduce((sum, row) => sum + row.nb_events, 0),
			keywords: keywords
				.filter((row) => row.nb_visits >= minKeywordVisits)
				.toSorted((a, b) => b.nb_events - a.nb_events)
				.slice(0, maxRows)
				.map((row) => {
					return { keyword: row.label, searches: row.nb_events };
				}),
			filters: filters.toSorted((a, b) => b.selections - a.selections).slice(0, maxRows),
		};
	});
}
