import "server-only";

import { cacheLife, cacheTag, revalidateTag } from "next/cache";

import {
	type AnnouncementType,
	type ApiQuery,
	type ApiResponse,
	type CacheTag,
	type EntityType,
	type JsonOperationId,
	type PaginatedResponse,
	fetchAll,
	getAnnouncements,
	getDariahProjectBySlug,
	getDariahProjects,
	getDocumentOrPolicyBySlug,
	getDocumentOrPolicySlugs,
	getDocumentsPoliciesTree,
	getEventBySlug,
	getEventSlugs,
	getEvents,
	getFeaturedEntities,
	getFundingCallBySlug,
	getFundingCallSlugs,
	getFundingCalls,
	getImpactCaseStudies,
	getImpactCaseStudyBySlug,
	getImpactCaseStudySlugs,
	getMemberOrPartnerBySlug,
	getMemberOrPartnerSlugs,
	getMembersAndPartners,
	getNavigation,
	getNews,
	getNewsItemBySlug,
	getNewsItemSlugs,
	getOpportunities,
	getOpportunityBySlug,
	getOpportunitySlugs,
	getPageBySlug,
	getPageSlugs,
	getPersonBySlug,
	getPersonSlugs,
	getProjectBySlug,
	getProjectSlugs,
	getProjects,
	getSiteMetadata,
	getSitemap,
	getSpotlightArticleBySlug,
	getSpotlightArticleSlugs,
	getSpotlightArticles,
	getStatistics,
	getWorkingGroupBySlug,
	getWorkingGroupSlugs,
	getWorkingGroups,
	isNotFound,
} from "#/lib/data/api-client.ts";
import { operationCacheTags } from "#/lib/openapi/cache-tags.ts";

/**
 * Cached read layer. Requires `cacheComponents: true` in next.config.ts.
 *
 * Every function declares its return type from `ApiResponse<"operationId">`, so the cached layer cannot drift from the
 * generated schema.
 *
 * Rules for everything below:
 *
 * - Arguments are the cache key, so they must be serializable. Never thread `RequestOptions` (AbortSignal, Headers)
 *   through here.
 * - No request-time data inside a cached scope: no `cookies()`, `headers()` or `new Date()`. Time-dependent values are
 *   arguments.
 * - The locale is an explicit argument, so `de-AT` and `en` never share an entry, and the same functions work where root
 *   params are unavailable.
 * - 404s become `null` _inside_ the scope — an `ApiError` cannot cross the cache boundary, and callers must never
 *   `.catch()` a cached call.
 */

/* -------------------------------------------------------------------------- */
/* Cache tags                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Three levels per entity type: - `collection` — list endpoints for that type - `entities` — every detail entry of that
 * type - `entity` — one detail entry so a single edit expires its lists and its own page, not every page of the type.
 */
export const tags = {
	collection: (type: EntityType): string => `collection:${type}`,
	entities: (type: EntityType): string => `entities:${type}`,
	entity: (type: EntityType, slug: string): string => `entity:${type}:${slug}`,

	announcements: "announcements",
	assets: "assets",
	featured: "featured",
	navigation: "navigation",
	siteMetadata: "site-metadata",
	sitemap: "sitemap",
	socialMedia: "social-media",
	statistics: "statistics",
} as const;

function detailTags(type: EntityType, slug: string): [string, string] {
	return [tags.entities(type), tags.entity(type, slug)];
}

/**
 * Maps the api's own `CacheTag` vocabulary (see `lib/openapi/cache-tags.ts`) to the `EntityType` `expireByCacheTag`
 * below expires for it — also what the `revalidate` webhook's payload validates against, so
 * `app/(api)/api/revalidate/route.ts` calls `expireByCacheTag` directly instead of keeping a second copy of this
 * mapping. "members-partners" isn't its own entity type here: `cachedMembersAndPartners`/`cachedMemberOrPartner` both
 * tag under `collection:country`/`entities:country`.
 */
const entityTypeByCacheTag: Partial<Record<CacheTag, EntityType>> = {
	"documents-policies": "documents_policies",
	events: "events",
	"funding-calls": "funding_calls",
	"governance-bodies": "governance_body",
	"impact-case-studies": "impact_case_studies",
	"members-partners": "country",
	news: "news",
	opportunities: "opportunities",
	pages: "pages",
	persons: "persons",
	projects: "projects",
	"spotlight-articles": "spotlight_articles",
	"working-groups": "working_group",
};

/** `CacheTag` values with no backing `EntityType`. */
const standaloneTagsByCacheTag: Partial<Record<CacheTag, string>> = {
	assets: tags.assets,
	"featured-entities": tags.featured,
	navigation: tags.navigation,
	"site-metadata": tags.siteMetadata,
	"social-media": tags.socialMedia,
};

/**
 * Resolves an operation's `x-cache-tags` — the api's own declaration of every entity type its response transitively
 * depends on, including embedded/joined data (e.g. a person's response embeds governance-body and working-group
 * affiliations) — into this app's own cache tags. Pass the result to `cacheTag()` alongside a function's own
 * `detailTags`/`collection` tag: this only adds the dependencies the api declares beyond the entity's own type, it
 * carries no slug-level granularity of its own.
 */
function relatedTags(operationId: JsonOperationId): ReadonlyArray<string> {
	return operationCacheTags[operationId].flatMap((apiCacheTag) => {
		const entityType = entityTypeByCacheTag[apiCacheTag];
		if (entityType != null) {
			return [tags.entities(entityType)];
		}

		const standaloneTag = standaloneTagsByCacheTag[apiCacheTag];
		return standaloneTag != null ? [standaloneTag] : [];
	});
}

async function nullOn404<T>(promise: Promise<T>): Promise<T | null> {
	try {
		return await promise;
	} catch (error) {
		if (isNotFound(error)) {
			return null;
		}
		throw error;
	}
}

/* -------------------------------------------------------------------------- */
/* Site-wide                                                                  */
/* -------------------------------------------------------------------------- */

export async function cachedSiteMetadata(locale: string): Promise<ApiResponse<"getSiteMetadata">> {
	"use cache";
	cacheLife("days");
	cacheTag(tags.siteMetadata, ...relatedTags("getSiteMetadata"));

	return getSiteMetadata({ query: { locale } });
}

export async function cachedNavigation(locale: string, menu?: string): Promise<ApiResponse<"getNavigation">> {
	"use cache";
	cacheLife("days");
	cacheTag(tags.navigation, ...relatedTags("getNavigation"));

	return getNavigation({ query: { locale, menu } });
}

export async function cachedStatistics(): Promise<ApiResponse<"getStatistics">> {
	"use cache";
	cacheLife("hours");
	cacheTag(tags.statistics, ...relatedTags("getStatistics"));

	return getStatistics();
}

/**
 * `data.news` is `Announcement[]` (a union — switch on `type`), alongside `data.events` (`FeaturedEvent[]`) and
 * `data.projects` (`FeaturedProject[]`).
 */
export async function cachedFeaturedEntities(locale: string): Promise<ApiResponse<"getFeaturedEntities">> {
	"use cache";
	cacheLife("hours");
	cacheTag(tags.featured, ...relatedTags("getFeaturedEntities"));

	return getFeaturedEntities({ query: { locale } });
}

/** For `app/sitemap.ts`. `href`s are locale-less — prefix every locale. */
export async function cachedSitemap(): Promise<ApiResponse<"getSitemap">> {
	"use cache";
	cacheLife("hours");
	cacheTag(tags.sitemap, ...relatedTags("getSitemap"));

	return getSitemap();
}

/* -------------------------------------------------------------------------- */
/* Collections                                                                */
/* -------------------------------------------------------------------------- */

/**
 * News, opportunities and funding calls, featured first. The endpoint takes no locale. Pass types as a sorted array so
 * equal filters share one cache entry.
 */
export async function cachedAnnouncements(
	types?: Array<AnnouncementType>,
	limit = 12,
	offset = 0,
): Promise<ApiResponse<"getAnnouncements">> {
	"use cache";
	cacheLife("hours");
	cacheTag(tags.announcements, ...relatedTags("getAnnouncements"));

	return getAnnouncements({ query: { type: types, limit, offset } });
}

export async function cachedNews(locale: string, limit = 12, offset = 0): Promise<ApiResponse<"getNews">> {
	"use cache";
	cacheLife("hours");
	cacheTag(tags.collection("news"), ...relatedTags("getNews"));

	return getNews({ query: { locale, limit, offset } });
}

/**
 * `from` is a YYYY-MM-DD argument: read the clock in a dynamic scope (after `await connection()`) and pass it in, so
 * the day is the cache key.
 */
export async function cachedUpcomingEvents(
	from: string,
	locale: string,
	limit = 10,
	offset = 0,
): Promise<ApiResponse<"getEvents">> {
	"use cache";
	cacheLife("hours");
	cacheTag(tags.collection("events"), ...relatedTags("getEvents"));

	return getEvents({ query: { from, locale, limit, offset } });
}

/** Past events, most recently started first. */
export async function cachedPastEvents(
	until: string,
	locale: string,
	limit = 10,
	offset = 0,
): Promise<ApiResponse<"getEvents">> {
	"use cache";
	cacheLife("hours");
	cacheTag(tags.collection("events"), ...relatedTags("getEvents"));

	return getEvents({ query: { until, locale, limit, offset } });
}

export async function cachedProjects(
	locale: string,
	status?: ApiQuery<"getProjects">["status"],
	limit = 50,
	offset = 0,
): Promise<ApiResponse<"getProjects">> {
	"use cache";
	cacheLife("hours");
	cacheTag(tags.collection("projects"), ...relatedTags("getProjects"));

	return getProjects({ query: { locale, status, limit, offset } });
}

export async function cachedDariahProjects(
	locale: string,
	status?: ApiQuery<"getDariahProjects">["status"],
	limit = 50,
	offset = 0,
): Promise<ApiResponse<"getDariahProjects">> {
	"use cache";
	cacheLife("hours");
	cacheTag(tags.collection("projects"), ...relatedTags("getDariahProjects"));

	return getDariahProjects({ query: { locale, status, limit, offset } });
}

export async function cachedWorkingGroups(
	locale: string,
	status?: ApiQuery<"getWorkingGroups">["status"],
): Promise<ApiResponse<"getWorkingGroups">> {
	"use cache";
	cacheLife("days");
	cacheTag(tags.collection("working_group"), ...relatedTags("getWorkingGroups"));

	return getWorkingGroups({ query: { locale, status, limit: 100 } });
}

export async function cachedMembersAndPartners(locale: string): Promise<ApiResponse<"getMembersAndPartners">> {
	"use cache";
	cacheLife("days");
	cacheTag(tags.collection("country"), ...relatedTags("getMembersAndPartners"));

	return getMembersAndPartners({ query: { locale, limit: 100 } });
}

export async function cachedFundingCalls(
	locale: string,
	status: ApiQuery<"getFundingCalls">["status"] = ["upcoming", "open"],
	limit = 20,
	offset = 0,
): Promise<ApiResponse<"getFundingCalls">> {
	"use cache";
	cacheLife("hours");
	cacheTag(tags.collection("funding_calls"), ...relatedTags("getFundingCalls"));

	return getFundingCalls({ query: { locale, status, limit, offset } });
}

export async function cachedOpportunities(
	locale: string,
	status: ApiQuery<"getOpportunities">["status"] = ["upcoming", "open"],
	source?: ApiQuery<"getOpportunities">["source"],
	limit = 20,
	offset = 0,
): Promise<ApiResponse<"getOpportunities">> {
	"use cache";
	cacheLife("hours");
	cacheTag(tags.collection("opportunities"), ...relatedTags("getOpportunities"));

	return getOpportunities({ query: { locale, status, source, limit, offset } });
}

export async function cachedSpotlightArticles(
	locale: string,
	limit = 12,
	offset = 0,
): Promise<ApiResponse<"getSpotlightArticles">> {
	"use cache";
	cacheLife("hours");
	cacheTag(tags.collection("spotlight_articles"), ...relatedTags("getSpotlightArticles"));

	return getSpotlightArticles({ query: { locale, limit, offset } });
}

export async function cachedImpactCaseStudies(
	locale: string,
	limit = 12,
	offset = 0,
): Promise<ApiResponse<"getImpactCaseStudies">> {
	"use cache";
	cacheLife("hours");
	cacheTag(tags.collection("impact_case_studies"), ...relatedTags("getImpactCaseStudies"));

	return getImpactCaseStudies({ query: { locale, limit, offset } });
}

export async function cachedDocumentsPoliciesTree(locale: string): Promise<ApiResponse<"getDocumentsPoliciesTree">> {
	"use cache";
	cacheLife("days");
	cacheTag(tags.collection("documents_policies"), ...relatedTags("getDocumentsPoliciesTree"));

	return getDocumentsPoliciesTree({ query: { locale } });
}

/* -------------------------------------------------------------------------- */
/* Detail views — `null` means 404, call `notFound()`                         */
/* -------------------------------------------------------------------------- */

export async function cachedPage(slug: string, locale: string): Promise<ApiResponse<"getPageBySlug"> | null> {
	"use cache";
	cacheLife("days");
	cacheTag(...detailTags("pages", slug), ...relatedTags("getPageBySlug"));

	return nullOn404(getPageBySlug(slug, { query: { locale } }));
}

export async function cachedNewsItem(slug: string, locale: string): Promise<ApiResponse<"getNewsItemBySlug"> | null> {
	"use cache";
	cacheLife("days");
	cacheTag(...detailTags("news", slug), ...relatedTags("getNewsItemBySlug"));

	return nullOn404(getNewsItemBySlug(slug, { query: { locale } }));
}

export async function cachedEvent(slug: string, locale: string): Promise<ApiResponse<"getEventBySlug"> | null> {
	"use cache";
	cacheLife("days");
	// prev/next links point at neighbours, so a new event must expire these too.
	cacheTag(...detailTags("events", slug), tags.collection("events"), ...relatedTags("getEventBySlug"));

	return nullOn404(getEventBySlug(slug, { query: { locale } }));
}

export async function cachedFundingCall(
	slug: string,
	locale: string,
): Promise<ApiResponse<"getFundingCallBySlug"> | null> {
	"use cache";
	cacheLife("days");
	cacheTag(...detailTags("funding_calls", slug), ...relatedTags("getFundingCallBySlug"));

	return nullOn404(getFundingCallBySlug(slug, { query: { locale } }));
}

export async function cachedOpportunity(
	slug: string,
	locale: string,
): Promise<ApiResponse<"getOpportunityBySlug"> | null> {
	"use cache";
	cacheLife("days");
	cacheTag(...detailTags("opportunities", slug), ...relatedTags("getOpportunityBySlug"));

	return nullOn404(getOpportunityBySlug(slug, { query: { locale } }));
}

export async function cachedProject(slug: string, locale: string): Promise<ApiResponse<"getProjectBySlug"> | null> {
	"use cache";
	cacheLife("days");
	cacheTag(...detailTags("projects", slug), ...relatedTags("getProjectBySlug"));

	return nullOn404(getProjectBySlug(slug, { query: { locale } }));
}

export async function cachedDariahProject(
	slug: string,
	locale: string,
): Promise<ApiResponse<"getDariahProjectBySlug"> | null> {
	"use cache";
	cacheLife("days");
	cacheTag(...detailTags("projects", slug), ...relatedTags("getDariahProjectBySlug"));

	return nullOn404(getDariahProjectBySlug(slug, { query: { locale } }));
}

export async function cachedPerson(slug: string, locale: string): Promise<ApiResponse<"getPersonBySlug"> | null> {
	"use cache";
	cacheLife("days");
	cacheTag(...detailTags("persons", slug), ...relatedTags("getPersonBySlug"));

	return nullOn404(getPersonBySlug(slug, { query: { locale } }));
}

export async function cachedWorkingGroup(
	slug: string,
	locale: string,
): Promise<ApiResponse<"getWorkingGroupBySlug"> | null> {
	"use cache";
	cacheLife("days");
	cacheTag(...detailTags("working_group", slug), ...relatedTags("getWorkingGroupBySlug"));

	return nullOn404(getWorkingGroupBySlug(slug, { query: { locale } }));
}

/** Resolves to a `MemberOrObserver` or `CooperatingPartner` — narrow on `status`. */
export async function cachedMemberOrPartner(
	slug: string,
	locale: string,
): Promise<ApiResponse<"getMemberOrPartnerBySlug"> | null> {
	"use cache";
	cacheLife("days");
	cacheTag(...detailTags("country", slug), ...relatedTags("getMemberOrPartnerBySlug"));

	return nullOn404(getMemberOrPartnerBySlug(slug, { query: { locale } }));
}

export async function cachedSpotlightArticle(
	slug: string,
	locale: string,
): Promise<ApiResponse<"getSpotlightArticleBySlug"> | null> {
	"use cache";
	cacheLife("days");
	cacheTag(...detailTags("spotlight_articles", slug), ...relatedTags("getSpotlightArticleBySlug"));

	return nullOn404(getSpotlightArticleBySlug(slug, { query: { locale } }));
}

export async function cachedImpactCaseStudy(
	slug: string,
	locale: string,
): Promise<ApiResponse<"getImpactCaseStudyBySlug"> | null> {
	"use cache";
	cacheLife("days");
	cacheTag(...detailTags("impact_case_studies", slug), ...relatedTags("getImpactCaseStudyBySlug"));

	return nullOn404(getImpactCaseStudyBySlug(slug, { query: { locale } }));
}

export async function cachedDocumentOrPolicy(
	slug: string,
	locale: string,
): Promise<ApiResponse<"getDocumentOrPolicyBySlug"> | null> {
	"use cache";
	cacheLife("days");
	cacheTag(...detailTags("documents_policies", slug), ...relatedTags("getDocumentOrPolicyBySlug"));

	return nullOn404(getDocumentOrPolicyBySlug(slug, { query: { locale } }));
}

/* -------------------------------------------------------------------------- */
/* Static params                                                              */
/* -------------------------------------------------------------------------- */

/**
 * For `generateStaticParams`. Runs at build time, which is cached by the build itself, so these deliberately skip `"use
 * cache"`.
 */
async function collectSlugs<T extends { entity: { slug: string } }>(
	// oxlint-disable-next-line typescript/no-explicit-any
	endpointFn: (options?: any) => Promise<PaginatedResponse<T>>,
	locale?: string,
): Promise<Array<{ slug: string }>> {
	const items = await fetchAll(endpointFn, {
		query: locale != null ? { locale } : undefined,
	});

	return items.map((item) => {
		return { slug: item.entity.slug };
	});
}

export const staticSlugs = {
	documentsPolicies: (locale?: string) => collectSlugs(getDocumentOrPolicySlugs, locale),
	events: (locale?: string) => collectSlugs(getEventSlugs, locale),
	fundingCalls: (locale?: string) => collectSlugs(getFundingCallSlugs, locale),
	impactCaseStudies: (locale?: string) => collectSlugs(getImpactCaseStudySlugs, locale),
	membersPartners: (locale?: string) => collectSlugs(getMemberOrPartnerSlugs, locale),
	news: (locale?: string) => collectSlugs(getNewsItemSlugs, locale),
	opportunities: (locale?: string) => collectSlugs(getOpportunitySlugs, locale),
	pages: (locale?: string) => collectSlugs(getPageSlugs, locale),
	persons: (locale?: string) => collectSlugs(getPersonSlugs, locale),
	projects: (locale?: string) => collectSlugs(getProjectSlugs, locale),
	spotlightArticles: (locale?: string) => collectSlugs(getSpotlightArticleSlugs, locale),
	workingGroups: (locale?: string) => collectSlugs(getWorkingGroupSlugs, locale),
} as const;

/* -------------------------------------------------------------------------- */
/* Invalidation                                                               */
/* -------------------------------------------------------------------------- */

const announcementEntityTypes = new Set<EntityType>(["news", "opportunities", "funding_calls"]);
const featuredEntityTypes = new Set<EntityType>(["news", "opportunities", "funding_calls", "events", "projects"]);
const statisticsEntityTypes = new Set<EntityType>(["country", "institution", "working_group"]);

/**
 * Uses the "max" profile (stale-while-revalidate): the next visitor gets the stale entry while a fresh one is fetched.
 * In a Server Action where the user must see their own write immediately, use `updateTag` instead.
 */
export function expire(tag: string): void {
	revalidateTag(tag, "max");
}

/**
 * Call from a CMS webhook route handler, passing the `EntityRef.type` of what changed. Omit `slug` to expire every
 * detail entry of that type.
 */
export function revalidateEntity(type: EntityType, slug?: string): void {
	expire(tags.collection(type));
	expire(slug != null ? tags.entity(type, slug) : tags.entities(type));

	// Derived views that embed this entity.
	expire(tags.sitemap);
	expire(tags.navigation); // menu labels come from entity titles

	if (announcementEntityTypes.has(type)) {
		expire(tags.announcements);
	}
	if (featuredEntityTypes.has(type)) {
		expire(tags.featured);
	}
	if (statisticsEntityTypes.has(type)) {
		expire(tags.statistics);
	}
}

/**
 * Call from the CMS webhook route handler, passing one of the api's own `CacheTag` values (see
 * `lib/openapi/cache-tags.ts`) — the single source of truth this and `relatedTags` both resolve against, so the
 * webhook's invalidation and a cached response's own tags can never drift apart.
 */
export function expireByCacheTag(apiCacheTag: CacheTag): void {
	const entityType = entityTypeByCacheTag[apiCacheTag];
	if (entityType != null) {
		revalidateEntity(entityType);
		return;
	}

	const standaloneTag = standaloneTagsByCacheTag[apiCacheTag];
	if (standaloneTag != null) {
		expire(standaloneTag);
	}
}
