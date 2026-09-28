import { env } from "#/configs/env.config";
import type { components, operations } from "#/lib/openapi/types";

/* -------------------------------------------------------------------------- */
/* Configuration                                                              */
/* -------------------------------------------------------------------------- */

const DEFAULT_BASE_URL = env.NEXT_PUBLIC_API_BASE_URL.replace(/\/+$/, "");

const apiHeaders: HeadersInit | undefined =
	env.API_ACCESS_TOKEN != null ? { "x-api-access-token": env.API_ACCESS_TOKEN } : undefined;

function resolveBaseUrl(override?: string): string {
	const base = (override ?? DEFAULT_BASE_URL).replace(/\/+$/, "");

	if (!base && typeof window === "undefined") {
		throw new Error(
			"No API base URL configured. Set NEXT_PUBLIC_API_BASE_URL (or pass `baseUrl` per request). " +
				"Relative URLs cannot be resolved during server rendering.",
		);
	}

	return base;
}

/* -------------------------------------------------------------------------- */
/* Operation-derived types                                                    */
/* -------------------------------------------------------------------------- */

type OperationId = keyof operations;

/** The `200 application/json` body of an operation, or `never` if it has none. */
type JsonBody<K extends OperationId> = operations[K]["responses"] extends {
	200: { content: { "application/json": infer R } };
}
	? R
	: never;

/**
 * Operations that return JSON. Binary and redirect endpoints (file downloads, image variants) are excluded, so they
 * cannot be wired up as JSON by mistake.
 */
export type JsonOperationId = {
	[K in OperationId]: [JsonBody<K>] extends [never] ? never : K;
}[OperationId];

/** Response body of a JSON operation, e.g. `ApiResponse<"getNews">`. */
export type ApiResponse<K extends JsonOperationId> = JsonBody<K>;

/** Query parameters of an operation, with `undefined` stripped. */
export type ApiQuery<K extends OperationId> = operations[K]["parameters"] extends {
	query?: infer Q;
}
	? NonNullable<Q>
	: never;

export interface PaginatedResponse<T> {
	limit: number;
	offset: number;
	total: number;
	data: Array<T>;
}

/* -------------------------------------------------------------------------- */
/* Request options                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Next.js augments `RequestInit` with `next`. Declared locally so this file also compiles outside a Next app (tests,
 * scripts, a shared package).
 */
export interface NextFetchOptions {
	/** Seconds, or `false` to cache indefinitely. */
	revalidate?: number | false | undefined;
	/** Tags for `revalidateTag()` / `updateTag()`. */
	tags?: Array<string> | undefined;
}

export interface RequestOptions {
	/** Override the configured base URL for a single call. */
	baseUrl?: string | undefined;
	headers?: HeadersInit | undefined;
	signal?: AbortSignal | undefined;
	/**
	 * Next 16 does not cache `fetch` implicitly. Prefer calling these functions from a `"use cache"` scope (see
	 * api-cache.ts) over these options.
	 */
	cache?: RequestCache | undefined;
	next?: NextFetchOptions | undefined;
}

/**
 * Query keys also accept an explicit `undefined`, which the serializer drops. Lets callers forward optional arguments
 * directly under `exactOptionalPropertyTypes` without building the object conditionally.
 */
type LooseQuery<Q> = [Q] extends [never] ? never : { [P in keyof Q]?: Q[P] | undefined };

export type EndpointOptions<K extends JsonOperationId> = RequestOptions & {
	query?: LooseQuery<ApiQuery<K>> | undefined;
};

/* -------------------------------------------------------------------------- */
/* Errors                                                                     */
/* -------------------------------------------------------------------------- */

export class ApiError extends Error {
	override readonly name = "ApiError";
	readonly status: number;
	readonly url: string;
	readonly body: unknown;

	constructor(message: string, status: number, url: string, body: unknown) {
		super(message);
		this.status = status;
		this.url = url;
		this.body = body;
	}

	static async fromResponse(response: Response, url: string): Promise<ApiError> {
		const text = await response.text().catch(() => "");

		let body: unknown;
		try {
			body = text !== "" ? JSON.parse(text) : null;
		} catch {
			body = text !== "" ? text : null;
		}

		const message =
			body != null && typeof body === "object" && "message" in body
				? String(body.message)
				: response.statusText || `Request failed with status ${String(response.status)}`;

		return new ApiError(`${String(response.status)} ${message}`, response.status, url, body);
	}
}

export function isApiError(error: unknown): error is ApiError {
	return error instanceof ApiError;
}

export function isNotFound(error: unknown): boolean {
	return isApiError(error) && error.status === 404;
}

/**
 * Turn a 404 into `null`.
 *
 * Do not attach this to the result of a `"use cache"` function — handle the 404 inside the cached scope instead
 * (api-cache.ts does this for you).
 */
export async function orNull<T>(promise: Promise<T>): Promise<T | null> {
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
/* Request plumbing                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Array values are serialised as repeated keys (`?type=news&type=opportunities`), which is what the API expects for
 * every repeatable filter.
 */

function isDate(value: unknown): value is Date {
	return Object.prototype.toString.call(value) === "[object Date]";
}

function serializeQueryValue(value: unknown): string {
	switch (typeof value) {
		case "string": {
			return value;
		}
		case "number":
		case "boolean":
		case "bigint": {
			return String(value);
		}
		case "object": {
			return isDate(value) ? value.toISOString() : JSON.stringify(value);
		}
		case "function":
		case "symbol":
		case "undefined": {
			throw new TypeError(`Cannot serialise a ${typeof value} as a query parameter.`);
		}
	}
}
function serializeQuery(query: unknown): string {
	if (query == null || typeof query !== "object") {
		return "";
	}

	const params = new URLSearchParams();

	for (const [key, value] of Object.entries(query as Record<string, unknown>)) {
		if (value == null) {
			continue;
		}

		if (Array.isArray(value)) {
			for (const item of value) {
				if (item != null) {
					params.append(key, serializeQueryValue(item));
				}
			}
			continue;
		}

		params.append(key, serializeQueryValue(value));
	}

	const serialized = params.toString();
	return serialized !== "" ? `?${serialized}` : "";
}

function buildHeaders(init: HeadersInit | undefined, accept: string): Headers {
	const headers = new Headers(apiHeaders);
	// Per-request headers win over the defaults above, same as the `accept` fallback below.
	if (init != null) {
		for (const [key, value] of new Headers(init)) {
			headers.set(key, value);
		}
	}

	if (!headers.has("accept")) {
		headers.set("accept", accept);
	}

	return headers;
}

function buildInit(options: RequestOptions, accept: string): RequestInit {
	return {
		method: "GET",
		headers: buildHeaders(options.headers, accept),
		signal: options.signal,
		...(options.cache != null ? { cache: options.cache } : {}),
		...(options.next != null ? { next: options.next } : {}),
	};
}

async function requestJson<T>(path: string, options: RequestOptions & { query?: unknown } = {}): Promise<T> {
	const url = `${resolveBaseUrl(options.baseUrl)}${path}${serializeQuery(options.query)}`;
	const response = await fetch(url, buildInit(options, "application/json"));

	if (!response.ok) {
		throw await ApiError.fromResponse(response, url);
	}
	if (response.status === 204) {
		return undefined as T;
	}

	return (await response.json()) as T;
}

async function requestBinary(url: string, options: RequestOptions): Promise<Response> {
	const response = await fetch(url, buildInit(options, "application/pdf, application/octet-stream, */*"));

	if (!response.ok) {
		throw await ApiError.fromResponse(response, url);
	}

	return response;
}

/** JSON endpoint without path parameters. */
function endpoint<K extends JsonOperationId>(path: string) {
	return (options?: EndpointOptions<K>): Promise<ApiResponse<K>> => requestJson<ApiResponse<K>>(path, options);
}

/** JSON endpoint with a single path parameter (`id` or `slug`). */
function endpointWithParam<K extends JsonOperationId>(toPath: (value: string) => string) {
	return (value: string, options?: EndpointOptions<K>): Promise<ApiResponse<K>> =>
		requestJson<ApiResponse<K>>(toPath(encodeURIComponent(value)), options);
}

/* -------------------------------------------------------------------------- */
/* Announcements                                                              */
/* -------------------------------------------------------------------------- */

/** News, opportunities and funding calls in one feed; featured items first. */
export const getAnnouncements = endpoint<"getAnnouncements">("/api/v1/announcements");

/* -------------------------------------------------------------------------- */
/* Assets                                                                     */
/* -------------------------------------------------------------------------- */

type AssetDownloadPath = operations["getAssetDownload"]["parameters"]["path"];
type ImageQuery = ApiQuery<"getAssetImage">;

export type AssetPrefix = AssetDownloadPath["prefix"];
type AssetImagePath = operations["getAssetImage"]["parameters"]["path"];
export type AssetImageVersion = AssetImagePath["version"];
export type ImageWidth = NonNullable<ImageQuery["w"]>;
export type ImageAspectRatio = NonNullable<ImageQuery["ar"]>;

/** Widths the image-variant endpoint accepts; anything else is a 400. */
export const imageWidths = [
	320, 480, 640, 960, 1280, 1600, 2048, 2560, 3200, 3840,
] as const satisfies ReadonlyArray<ImageWidth>;

const largestImageWidth: ImageWidth = 3840;

/** Round up to the nearest width the API supports. */
export function snapImageWidth(width: number): ImageWidth {
	return imageWidths.find((candidate) => candidate >= width) ?? largestImageWidth;
}

function absolutize(url: string): string {
	if (/^https?:\/\//.test(url)) {
		return url;
	}
	return `${resolveBaseUrl()}/${url.replace(/^\/+/, "")}`;
}

/**
 * Build a rendition URL from an image's `srcUrl`. The endpoint answers with a redirect to a signed rendition, so the
 * result can go straight into `src`.
 *
 * Omit `width` to serve the source as stored — the only rendition a vector image has. `aspectRatio` crops against the
 * width, so it is ignored without one; the API rejects the combination.
 */
export function getImageUrl(srcUrl: string, width?: number, aspectRatio?: ImageAspectRatio): string {
	const base = absolutize(srcUrl);

	if (width == null) {
		return base;
	}

	const params = new URLSearchParams({ w: String(snapImageWidth(width)) });
	if (aspectRatio != null) {
		params.set("ar", aspectRatio);
	}

	return `${base}${base.includes("?") ? "&" : "?"}${params.toString()}`;
}

/** The source file as stored, unresized. Use for SVGs and other vectors. */
export function getImageSourceUrl(srcUrl: string): string {
	return absolutize(srcUrl);
}

/** A `srcset` covering every supported width (or the subset you pass). */
export function getImageSrcSet(
	srcUrl: string,
	aspectRatio?: ImageAspectRatio,
	widths: ReadonlyArray<ImageWidth> = imageWidths,
): string {
	return widths.map((width) => `${getImageUrl(srcUrl, width, aspectRatio)} ${String(width)}w`).join(", ");
}

/**
 * Storage-key form of the image-variant endpoint: the `{prefix}/{name}/{version}` the API docs describe, rather than an
 * image's `srcUrl`.
 *
 * The URL points at the endpoint, which answers with a 302 to the signed imgproxy rendition — put it straight in `src`.
 * To get the signed URL itself, pass the result to `resolveSignedImageUrl`.
 */
export function getAssetImageUrl(
	prefix: AssetPrefix,
	name: string,
	options: {
		width?: number | undefined;
		aspectRatio?: ImageAspectRatio | undefined;
		version?: AssetImageVersion | undefined;
		baseUrl?: string | undefined;
	} = {},
): string {
	// A storage key may contain slashes; keep them as path separators.
	const key = name
		.split("/")
		.map((segment) => encodeURIComponent(segment))
		.join("/");
	const version = options.version ?? "v1";

	return getImageUrl(
		`${resolveBaseUrl(options.baseUrl)}/api/v1/assets/${key}/image/${version}`,
		options.width,
		options.aspectRatio,
	);
}

export function getAssetDownloadUrl(prefix: AssetPrefix, name: string, baseUrl?: string): string {
	return `${resolveBaseUrl(baseUrl)}/api/v1/assets/${prefix}/${encodeURIComponent(name)}/download`;
}

/** Streams the stored file. Returns the raw `Response` so you can pipe it on. */
export function getAssetDownload(prefix: AssetPrefix, name: string, options: RequestOptions = {}): Promise<Response> {
	return requestBinary(getAssetDownloadUrl(prefix, name, options.baseUrl), options);
}

/* -------------------------------------------------------------------------- */
/* DARIAH projects                                                            */
/* -------------------------------------------------------------------------- */

export const getDariahProjects = endpoint<"getDariahProjects">("/api/v1/dariah-projects");
export const getDariahProjectSlugs = endpoint<"getDariahProjectSlugs">("/api/v1/dariah-projects/slugs");
export const getDariahProjectById = endpointWithParam<"getDariahProjectById">((id) => `/api/v1/dariah-projects/${id}`);
export const getDariahProjectBySlug = endpointWithParam<"getDariahProjectBySlug">(
	(slug) => `/api/v1/dariah-projects/slugs/${slug}`,
);

/* -------------------------------------------------------------------------- */
/* Documents & policies                                                       */
/* -------------------------------------------------------------------------- */

export const getDocumentsPolicies = endpoint<"getDocumentsPolicies">("/api/v1/documents-policies");
export const getDocumentsPoliciesTree = endpoint<"getDocumentsPoliciesTree">("/api/v1/documents-policies/tree");
export const getDocumentOrPolicySlugs = endpoint<"getDocumentOrPolicySlugs">("/api/v1/documents-policies/slugs");
export const getDocumentOrPolicyById = endpointWithParam<"getDocumentOrPolicyById">(
	(id) => `/api/v1/documents-policies/${id}`,
);
export const getDocumentOrPolicyBySlug = endpointWithParam<"getDocumentOrPolicyBySlug">(
	(slug) => `/api/v1/documents-policies/slugs/${slug}`,
);

export function getDocumentOrPolicyFileUrlById(id: string, baseUrl?: string): string {
	return `${resolveBaseUrl(baseUrl)}/api/v1/documents-policies/${encodeURIComponent(id)}/document`;
}

export function getDocumentOrPolicyFileUrlBySlug(slug: string, baseUrl?: string): string {
	return `${resolveBaseUrl(baseUrl)}/api/v1/documents-policies/slugs/${encodeURIComponent(slug)}/document`;
}

export function getDocumentOrPolicyFileById(id: string, options: RequestOptions = {}): Promise<Response> {
	return requestBinary(getDocumentOrPolicyFileUrlById(id, options.baseUrl), options);
}

export function getDocumentOrPolicyFileBySlug(slug: string, options: RequestOptions = {}): Promise<Response> {
	return requestBinary(getDocumentOrPolicyFileUrlBySlug(slug, options.baseUrl), options);
}

/* -------------------------------------------------------------------------- */
/* Site-wide                                                                  */
/* -------------------------------------------------------------------------- */

export const getNavigation = endpoint<"getNavigation">("/api/v1/navigation");
export const getSiteMetadata = endpoint<"getSiteMetadata">("/api/v1/site-metadata");
export const getSitemap = endpoint<"getSitemap">("/api/v1/sitemap");
export const getStatistics = endpoint<"getStatistics">("/api/v1/statistics");
export const getFeaturedEntities = endpoint<"getFeaturedEntities">("/api/v1/featured-entities");

/* -------------------------------------------------------------------------- */
/* Events                                                                     */
/* -------------------------------------------------------------------------- */

export const getEvents = endpoint<"getEvents">("/api/v1/events");
export const getEventSlugs = endpoint<"getEventSlugs">("/api/v1/events/slugs");
export const getEventById = endpointWithParam<"getEventById">((id) => `/api/v1/events/${id}`);
export const getEventBySlug = endpointWithParam<"getEventBySlug">((slug) => `/api/v1/events/slugs/${slug}`);

/* -------------------------------------------------------------------------- */
/* Funding calls                                                              */
/* -------------------------------------------------------------------------- */

export const getFundingCalls = endpoint<"getFundingCalls">("/api/v1/funding-calls");
export const getFundingCallSlugs = endpoint<"getFundingCallSlugs">("/api/v1/funding-calls/slugs");
export const getFundingCallById = endpointWithParam<"getFundingCallById">((id) => `/api/v1/funding-calls/${id}`);
export const getFundingCallBySlug = endpointWithParam<"getFundingCallBySlug">(
	(slug) => `/api/v1/funding-calls/slugs/${slug}`,
);

/* -------------------------------------------------------------------------- */
/* Governance bodies                                                          */
/* -------------------------------------------------------------------------- */

export const getGovernanceBodies = endpoint<"getGovernanceBodies">("/api/v1/governance-bodies");
export const getGovernanceBodySlugs = endpoint<"getGovernanceBodySlugs">("/api/v1/governance-bodies/slugs");
export const getGovernanceBodyById = endpointWithParam<"getGovernanceBodyById">(
	(id) => `/api/v1/governance-bodies/${id}`,
);
export const getGovernanceBodyBySlug = endpointWithParam<"getGovernanceBodyBySlug">(
	(slug) => `/api/v1/governance-bodies/slugs/${slug}`,
);

/* -------------------------------------------------------------------------- */
/* Impact case studies                                                        */
/* -------------------------------------------------------------------------- */

export const getImpactCaseStudies = endpoint<"getImpactCaseStudies">("/api/v1/impact-case-studies");
export const getImpactCaseStudySlugs = endpoint<"getImpactCaseStudySlugs">("/api/v1/impact-case-studies/slugs");
export const getImpactCaseStudyById = endpointWithParam<"getImpactCaseStudyById">(
	(id) => `/api/v1/impact-case-studies/${id}`,
);
export const getImpactCaseStudyBySlug = endpointWithParam<"getImpactCaseStudyBySlug">(
	(slug) => `/api/v1/impact-case-studies/slugs/${slug}`,
);

/* -------------------------------------------------------------------------- */
/* Institutions                                                               */
/* -------------------------------------------------------------------------- */

export const getInstitutions = endpoint<"getInstitutions">("/api/v1/institutions");
export const getInstitutionSlugs = endpoint<"getInstitutionSlugs">("/api/v1/institutions/slugs");
export const getInstitutionById = endpointWithParam<"getInstitutionById">((id) => `/api/v1/institutions/${id}`);
export const getInstitutionBySlug = endpointWithParam<"getInstitutionBySlug">(
	(slug) => `/api/v1/institutions/slugs/${slug}`,
);

/* -------------------------------------------------------------------------- */
/* Members & partners                                                         */
/* -------------------------------------------------------------------------- */

export const getMembersAndPartners = endpoint<"getMembersAndPartners">("/api/v1/members-partners");
export const getMemberOrPartnerSlugs = endpoint<"getMemberOrPartnerSlugs">("/api/v1/members-partners/slugs");
export const getMembersAndPartnersById = endpointWithParam<"getMembersAndPartnersById">(
	(id) => `/api/v1/members-partners/${id}`,
);
export const getMemberOrPartnerBySlug = endpointWithParam<"getMemberOrPartnerBySlug">(
	(slug) => `/api/v1/members-partners/slugs/${slug}`,
);

/* -------------------------------------------------------------------------- */
/* News                                                                       */
/* -------------------------------------------------------------------------- */

export const getNews = endpoint<"getNews">("/api/v1/news");
export const getNewsItemSlugs = endpoint<"getNewsItemSlugs">("/api/v1/news/slugs");
export const getNewsItemById = endpointWithParam<"getNewsItemById">((id) => `/api/v1/news/${id}`);
export const getNewsItemBySlug = endpointWithParam<"getNewsItemBySlug">((slug) => `/api/v1/news/slugs/${slug}`);

/* -------------------------------------------------------------------------- */
/* National consortia                                                         */
/* -------------------------------------------------------------------------- */

export const getNationalConsortia = endpoint<"getNationalConsortia">("/api/v1/national-consortia");
export const getNationalConsortiumSlugs = endpoint<"getNationalConsortiumSlugs">("/api/v1/national-consortia/slugs");
export const getNationalConsortiumById = endpointWithParam<"getNationalConsortiumById">(
	(id) => `/api/v1/national-consortia/${id}`,
);
export const getNationalConsortiumBySlug = endpointWithParam<"getNationalConsortiumBySlug">(
	(slug) => `/api/v1/national-consortia/slugs/${slug}`,
);

/* -------------------------------------------------------------------------- */
/* Opportunities                                                              */
/* -------------------------------------------------------------------------- */

export const getOpportunities = endpoint<"getOpportunities">("/api/v1/opportunities");
export const getOpportunitySlugs = endpoint<"getOpportunitySlugs">("/api/v1/opportunities/slugs");
export const getOpportunityById = endpointWithParam<"getOpportunityById">((id) => `/api/v1/opportunities/${id}`);
export const getOpportunityBySlug = endpointWithParam<"getOpportunityBySlug">(
	(slug) => `/api/v1/opportunities/slugs/${slug}`,
);

/* -------------------------------------------------------------------------- */
/* Pages                                                                      */
/* -------------------------------------------------------------------------- */

export const getPages = endpoint<"getPages">("/api/v1/pages");
export const getPageSlugs = endpoint<"getPageSlugs">("/api/v1/pages/slugs");
export const getPageById = endpointWithParam<"getPageById">((id) => `/api/v1/pages/${id}`);
export const getPageBySlug = endpointWithParam<"getPageBySlug">((slug) => `/api/v1/pages/slugs/${slug}`);

/* -------------------------------------------------------------------------- */
/* Persons                                                                    */
/* -------------------------------------------------------------------------- */

export const getPersons = endpoint<"getPersons">("/api/v1/persons");
export const getPersonSlugs = endpoint<"getPersonSlugs">("/api/v1/persons/slugs");
export const getPersonById = endpointWithParam<"getPersonById">((id) => `/api/v1/persons/${id}`);
export const getPersonBySlug = endpointWithParam<"getPersonBySlug">((slug) => `/api/v1/persons/slugs/${slug}`);

/* -------------------------------------------------------------------------- */
/* Projects                                                                   */
/* -------------------------------------------------------------------------- */

export const getProjects = endpoint<"getProjects">("/api/v1/projects");
export const getProjectSlugs = endpoint<"getProjectSlugs">("/api/v1/projects/slugs");
export const getProjectById = endpointWithParam<"getProjectById">((id) => `/api/v1/projects/${id}`);
export const getProjectBySlug = endpointWithParam<"getProjectBySlug">((slug) => `/api/v1/projects/slugs/${slug}`);

/* -------------------------------------------------------------------------- */
/* Social media                                                               */
/* -------------------------------------------------------------------------- */

export const getSocialMediaList = endpoint<"getSocialMediaList">("/api/v1/social-media");
export const getSocialMediaById = endpointWithParam<"getSocialMediaById">((id) => `/api/v1/social-media/${id}`);

/* -------------------------------------------------------------------------- */
/* Spotlight articles                                                         */
/* -------------------------------------------------------------------------- */

export const getSpotlightArticles = endpoint<"getSpotlightArticles">("/api/v1/spotlight-articles");
export const getSpotlightArticleSlugs = endpoint<"getSpotlightArticleSlugs">("/api/v1/spotlight-articles/slugs");
export const getSpotlightArticleById = endpointWithParam<"getSpotlightArticleById">(
	(id) => `/api/v1/spotlight-articles/${id}`,
);
export const getSpotlightArticleBySlug = endpointWithParam<"getSpotlightArticleBySlug">(
	(slug) => `/api/v1/spotlight-articles/slugs/${slug}`,
);

/* -------------------------------------------------------------------------- */
/* Working groups                                                             */
/* -------------------------------------------------------------------------- */

export const getWorkingGroups = endpoint<"getWorkingGroups">("/api/v1/working-groups");
export const getWorkingGroupSlugs = endpoint<"getWorkingGroupSlugs">("/api/v1/working-groups/slugs");
export const getWorkingGroupById = endpointWithParam<"getWorkingGroupById">((id) => `/api/v1/working-groups/${id}`);
export const getWorkingGroupBySlug = endpointWithParam<"getWorkingGroupBySlug">(
	(slug) => `/api/v1/working-groups/slugs/${slug}`,
);

/* -------------------------------------------------------------------------- */
/* Pagination helper                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Walks every page of a paginated endpoint — mostly for `generateStaticParams`.
 *
 * ```ts
 * const slugs = await fetchAll(getEventSlugs, { query: { locale: "de" } });
 * ```
 */
export async function fetchAll<T>(
	// `any` keeps each endpoint's own narrow options type from fighting inference.
	// oxlint-disable-next-line typescript/no-explicit-any
	endpointFn: (options?: any) => Promise<PaginatedResponse<T>>,
	options: RequestOptions & {
		pageSize?: number | undefined;
		/** Extra query parameters (e.g. `{ locale: "de" }`), minus limit/offset. */
		query?: Record<string, unknown> | undefined;
		/** Safety valve against an endpoint that never advances. */
		maxPages?: number | undefined;
	} = {},
): Promise<Array<T>> {
	const { pageSize = 100, query, maxPages = 100, ...requestOptions } = options;

	const items: Array<T> = [];
	let offset = 0;

	for (let page = 0; page < maxPages; page++) {
		// oxlint-disable-next-line no-await-in-loop
		const response = await endpointFn({
			...requestOptions,
			query: { ...query, limit: pageSize, offset },
		});

		items.push(...response.data);
		offset += response.limit > 0 ? response.limit : pageSize;

		if (response.data.length === 0 || items.length >= response.total) {
			break;
		}
	}

	return items;
}

/* -------------------------------------------------------------------------- */
/* Grouped namespace (optional convenience)                                   */
/* -------------------------------------------------------------------------- */

export const api = {
	announcements: { list: getAnnouncements },
	assets: {
		imageUrl: getImageUrl,
		imageSourceUrl: getImageSourceUrl,
		imageSrcSet: getImageSrcSet,
		download: getAssetDownload,
		downloadUrl: getAssetDownloadUrl,
	},
	dariahProjects: {
		list: getDariahProjects,
		slugs: getDariahProjectSlugs,
		byId: getDariahProjectById,
		bySlug: getDariahProjectBySlug,
	},
	documentsPolicies: {
		list: getDocumentsPolicies,
		tree: getDocumentsPoliciesTree,
		slugs: getDocumentOrPolicySlugs,
		byId: getDocumentOrPolicyById,
		bySlug: getDocumentOrPolicyBySlug,
		fileById: getDocumentOrPolicyFileById,
		fileBySlug: getDocumentOrPolicyFileBySlug,
		fileUrlById: getDocumentOrPolicyFileUrlById,
		fileUrlBySlug: getDocumentOrPolicyFileUrlBySlug,
	},
	events: { list: getEvents, slugs: getEventSlugs, byId: getEventById, bySlug: getEventBySlug },
	featuredEntities: { get: getFeaturedEntities },
	fundingCalls: {
		list: getFundingCalls,
		slugs: getFundingCallSlugs,
		byId: getFundingCallById,
		bySlug: getFundingCallBySlug,
	},
	governanceBodies: {
		list: getGovernanceBodies,
		slugs: getGovernanceBodySlugs,
		byId: getGovernanceBodyById,
		bySlug: getGovernanceBodyBySlug,
	},
	impactCaseStudies: {
		list: getImpactCaseStudies,
		slugs: getImpactCaseStudySlugs,
		byId: getImpactCaseStudyById,
		bySlug: getImpactCaseStudyBySlug,
	},
	institutions: {
		list: getInstitutions,
		slugs: getInstitutionSlugs,
		byId: getInstitutionById,
		bySlug: getInstitutionBySlug,
	},
	membersPartners: {
		list: getMembersAndPartners,
		slugs: getMemberOrPartnerSlugs,
		byId: getMembersAndPartnersById,
		bySlug: getMemberOrPartnerBySlug,
	},
	nationalConsortia: {
		list: getNationalConsortia,
		slugs: getNationalConsortiumSlugs,
		byId: getNationalConsortiumById,
		bySlug: getNationalConsortiumBySlug,
	},
	navigation: { get: getNavigation },
	news: { list: getNews, slugs: getNewsItemSlugs, byId: getNewsItemById, bySlug: getNewsItemBySlug },
	opportunities: {
		list: getOpportunities,
		slugs: getOpportunitySlugs,
		byId: getOpportunityById,
		bySlug: getOpportunityBySlug,
	},
	pages: { list: getPages, slugs: getPageSlugs, byId: getPageById, bySlug: getPageBySlug },
	persons: { list: getPersons, slugs: getPersonSlugs, byId: getPersonById, bySlug: getPersonBySlug },
	projects: {
		list: getProjects,
		slugs: getProjectSlugs,
		byId: getProjectById,
		bySlug: getProjectBySlug,
	},
	siteMetadata: { get: getSiteMetadata },
	sitemap: { get: getSitemap },
	socialMedia: { list: getSocialMediaList, byId: getSocialMediaById },
	spotlightArticles: {
		list: getSpotlightArticles,
		slugs: getSpotlightArticleSlugs,
		byId: getSpotlightArticleById,
		bySlug: getSpotlightArticleBySlug,
	},
	statistics: { get: getStatistics },
	workingGroups: {
		list: getWorkingGroups,
		slugs: getWorkingGroupSlugs,
		byId: getWorkingGroupById,
		bySlug: getWorkingGroupBySlug,
	},
} as const;

/* -------------------------------------------------------------------------- */
/* Re-exported schema types                                                   */
/* -------------------------------------------------------------------------- */

export type Schemas = components["schemas"];

/** A top-level image: chosen rendition, `srcUrl` for others, source dimensions. */
export type Image = Schemas["Image"];
/** An image inside a content block — like `Image`, minus the caption the block reports. */
export type BlockImage = Schemas["BlockImage"];

export type Announcement = Schemas["Announcement"];
export type AnnouncementType = Announcement["type"];
export type NewsAnnouncement = Schemas["NewsAnnouncement"];
export type OpportunityAnnouncement = Schemas["OpportunityAnnouncement"];
export type FundingCallAnnouncement = Schemas["FundingCallAnnouncement"];

export type EntityRef = Schemas["EntityRef"];
export type EntityType = EntityRef["type"];

export type FeaturedEntities = Schemas["FeaturedEntities"];
export type FeaturedEvent = Schemas["FeaturedEvent"];
export type FeaturedProject = Schemas["FeaturedProject"];

export type SitemapEntry = Schemas["SitemapEntry"];

export type DariahProject = Schemas["DariahProject"];
export type DariahProjectBase = Schemas["DariahProjectBase"];
export type DocumentOrPolicy = Schemas["DocumentOrPolicy"];
export type DocumentOrPolicyBase = Schemas["DocumentOrPolicyBase"];
export type DocumentOrPolicyTree = Schemas["DocumentOrPolicyTree"];
export type Event = Schemas["Event"];
export type EventBase = Schemas["EventBase"];
export type EventLink = Schemas["EventLink"];
export type FundingCall = Schemas["FundingCall"];
export type FundingCallBase = Schemas["FundingCallBase"];
export type GovernanceBody = Schemas["GovernanceBody"];
export type GovernanceBodyBase = Schemas["GovernanceBodyBase"];
export type ImpactCaseStudy = Schemas["ImpactCaseStudy"];
export type ImpactCaseStudyBase = Schemas["ImpactCaseStudyBase"];
export type Institution = Schemas["Institution"];
export type MemberOrPartner = Schemas["MemberOrPartner"];
export type MemberOrPartnerBase = Schemas["MemberOrPartnerBase"];
export type MemberOrObserver = Schemas["MemberOrObserver"];
export type CooperatingPartner = Schemas["CooperatingPartner"];
export type Contributor = Schemas["Contributor"];
export type NationalConsortium = Schemas["NationalConsortium"];
export type NavigationMenu = Schemas["NavigationMenu"];
export type NavigationItem = Schemas["NavigationItem"];
export type NewsItem = Schemas["NewsItem"];
export type NewsItemBase = Schemas["NewsItemBase"];
export type Opportunity = Schemas["Opportunity"];
export type OpportunityBase = Schemas["OpportunityBase"];
export type Page = Schemas["Page"];
export type PageBase = Schemas["PageBase"];
export type Person = Schemas["Person"];
export type PersonBase = Schemas["PersonBase"];
export type PersonArticle = Schemas["PersonArticle"];
export type PersonSocialMedia = Schemas["PersonSocialMedia"];
export type Project = Schemas["Project"];
export type ProjectBase = Schemas["ProjectBase"];
export type ProjectPerson = Schemas["ProjectPerson"];
export type SiteMetadata = Schemas["SiteMetadata"];
export type SocialMedia = Schemas["SocialMedia"];
export type SpotlightArticle = Schemas["SpotlightArticle"];
export type SpotlightArticleBase = Schemas["SpotlightArticleBase"];
export type Statistics = Schemas["GetStatistics"];
export type WorkingGroup = Schemas["WorkingGroup"];
export type WorkingGroupBase = Schemas["WorkingGroupBase"];

/** The shared content-block union used by `content` / `description` / `biography`. */
export type ContentBlock = Page["content"][number];
export type ContentBlockType = ContentBlock["type"];
export type RelatedResource = Page["relatedResources"][number];

/** @deprecated Use `Image`, which the schema now names directly. */
export type ImageAsset = Image;
