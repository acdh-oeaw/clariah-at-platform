import type { DocumentSchema, SearchParams, SearchResponse, SearchResponseFacetCountSchema } from "typesense";

import {
	type SearchFieldTypes,
	type SearchFilter,
	type SearchFilterValue,
	type SearchValueFilter,
	getFieldTypes,
	serializeFilters,
} from "#/lib/search/filters.ts";
import type {
	Collection,
	CollectionFacetableFieldName,
	CollectionFieldConfig,
	CollectionFilterableFieldName,
	CollectionQueryableFieldName,
	CollectionSearchableFieldName,
	CollectionSortableFieldName,
} from "#/lib/search/schema.ts";

export interface SearchableCollection {
	fields: ReadonlyArray<CollectionFieldConfig>;
}

export interface SearchSort<Field extends string> {
	field: Field;
	direction: "asc" | "desc";
}

/**
 * How the values selected for a single facet are combined.
 *
 * - `"or"` (disjunctive, the default): a document matches when it has any of the selected values. Counts are calculated
 *   with this facet's own selection removed, so they show how many results selecting an additional value would add.
 *   This is what a multi-select facet widget needs.
 * - `"and"` (conjunctive): a document matches only when it has all of the selected values. Counts are calculated with
 *   this facet's own selection applied, so they show how many results selecting an additional value would leave.
 */
export type SearchFacetOperator = "and" | "or";

export interface SearchFacetConfig {
	operator?: SearchFacetOperator;
	/** Currently selected values. Include the facet with no values to only request its counts. */
	values?: ReadonlyArray<SearchFilterValue>;
	/** Sort facet values by descending count (the default), or alphabetically ascending. */
	sort?: "alpha" | "count";
}

export type SearchFacetsConfig<C extends SearchableCollection> = Partial<
	Record<CollectionFacetableFieldName<C>, SearchFacetConfig>
>;

/**
 * A join onto a collection which this one references.
 *
 * The join is always emitted into `filter_by`, falling back to `id:*` when there is nothing to filter on: typesense
 * 30.0 crashes on a `facet_by` over a collection which is not joined in `filter_by`.
 */
export interface SearchJoin<C extends SearchableCollection> {
	/** The `collection` key of the reference declared on the searched collection. Resolves to its runtime name. */
	key: string;
	collection: C;
	filters?: ReadonlyArray<SearchFilter<CollectionFilterableFieldName<C>>>;
	facets?: SearchFacetsConfig<C>;
	sortBy?: ReadonlyArray<SearchSort<CollectionSortableFieldName<C>>>;
	/** Fields of the joined document to return. Typesense returns all of them by default. */
	include?: ReadonlyArray<CollectionQueryableFieldName<C>>;
}

/** A {@link SearchJoin} with its field names widened. Build one with {@link defineJoin}, which checks them. */
export interface AnySearchJoin {
	key: string;
	collection: SearchableCollection;
	filters?: ReadonlyArray<SearchFilter<string>>;
	facets?: Partial<Record<string, SearchFacetConfig>>;
	sortBy?: ReadonlyArray<SearchSort<string>>;
	include?: ReadonlyArray<string>;
}

export function defineJoin<C extends SearchableCollection>(join: SearchJoin<C>): AnySearchJoin {
	return join;
}

export interface SearchCollectionParams<C extends SearchableCollection> {
	/** Use `"*"` to match every document. */
	query: string;
	/** Defaults to every searchable field of the collection. */
	queryBy?: ReadonlyArray<CollectionSearchableFieldName<C>>;
	page?: number;
	perPage?: number;
	sortBy?: ReadonlyArray<SearchSort<CollectionSortableFieldName<C>>>;
	/** Combined with `and`, and applied to hits as well as to every facet count. */
	filters?: ReadonlyArray<SearchFilter<CollectionFilterableFieldName<C>>>;
	/** The facets to return counts for, and which of their values are currently selected. */
	facets?: SearchFacetsConfig<C>;
	/** Joins onto referenced collections, to filter, facet and sort on their fields. */
	joins?: ReadonlyArray<AnySearchJoin>;
	maxFacetValues?: number;
}

export interface SearchFacetValuesParams<C extends SearchableCollection> {
	/** The facet whose values to search. */
	facet: CollectionFacetableFieldName<C>;
	/** Matched against facet values as a prefix, with typo tolerance. */
	facetQuery: string;
	limit?: number;
	/**
	 * The rest of the current search, so the returned counts match what the user would get by selecting one of the
	 * values.
	 */
	query: string;
	queryBy?: ReadonlyArray<CollectionSearchableFieldName<C>>;
	filters?: ReadonlyArray<SearchFilter<CollectionFilterableFieldName<C>>>;
	facets?: SearchFacetsConfig<C>;
}

export interface SearchFacetValue {
	count: number;
	highlighted: string;
	value: string;
	parent?: Record<string, boolean | number | string>;
}

export interface SearchFacetStats {
	avg?: number;
	max?: number;
	min?: number;
	sum?: number;
	totalValues?: number;
}

export interface SearchFacet {
	values: Array<SearchFacetValue>;
	sampled: boolean;
	stats: SearchFacetStats;
}

/**
 * Mirrors the shape of the document, with every matched value replaced by its highlighted snippet, so a `string` field
 * highlights to a `string` and an `Array<{ name: string }>` field to an `Array<{ name?: string }>`.
 */
export type SearchHighlight<T> = T extends boolean | number | string
	? string
	: T extends ReadonlyArray<infer Element>
		? Array<SearchHighlight<Element>>
		: T extends object
			? { [K in keyof T]?: SearchHighlight<T[K]> }
			: never;

export interface SearchItem<Document> {
	document: Document;
	highlight: SearchHighlight<Document>;
	/** The documents a join pulled in, keyed by the join key rather than the collection's runtime name. */
	joined: Record<string, unknown>;
}

export interface SearchPagination {
	page: number;
	perPage: number;
	total: number;
	totalPages: number;
}

export interface SearchResult<Document, FacetField extends string = string> {
	items: Array<SearchItem<Document>>;
	pagination: SearchPagination;
	facets: Partial<Record<FacetField, SearchFacet>>;
	/**
	 * Counts for facets on joined collections, keyed `<join key>.<field>`. These count documents of the referenced
	 * collection, not hits.
	 */
	joinedFacets: Partial<Record<string, SearchFacet>>;
}

type FacetFieldName<F extends ReadonlyArray<CollectionFieldConfig>> = CollectionFacetableFieldName<Collection<F>>;

/**
 * Typesense has no way to exclude a filter from a single facet's counts, so every disjunctive facet with a selection
 * needs a request of its own, which repeats the search without that facet's filter. The requests are dispatched as a
 * `multi_search`, unless there is only the main one.
 */
/** A facet on a joined collection: the `field_name` typesense reports, and the key it is returned under. */
export interface JoinedFacetField {
	name: string;
	key: string;
}

export interface SearchPlan<Document extends DocumentSchema, FacetField extends string> {
	/** Provides hits, pagination and counts for every facet in `facetFields` and `joinedFacetFields`. */
	main: SearchParams<Document>;
	facetFields: Array<FacetField>;
	joinedFacetFields: Array<JoinedFacetField>;
	/** Each provides counts for a single facet, with that facet's own selection removed. */
	facetRequests: Array<{ field: FacetField; params: SearchParams<Document> }>;
	joinedFacetRequests: Array<{ field: JoinedFacetField; params: SearchParams<Document> }>;
	/** The joins the search ran with, so their documents can be moved onto a stable key. */
	joins: Array<{ key: string; name: string }>;
}

function createFacetFilter<Field extends string>(field: Field, config: SearchFacetConfig): SearchFilter<Field> | null {
	const values = config.values ?? [];

	if (values.length === 0) {
		return null;
	}

	if (config.operator === "and") {
		return {
			operator: "all",
			filters: values.map((value): SearchValueFilter<Field> => {
				return { operator: "equals", field, value };
			}),
		};
	}

	return { operator: "equals", field, value: values };
}

function createFacetByExpression(field: string, config: SearchFacetConfig | undefined): string {
	return config?.sort === "alpha" ? `${field}(sort_by: _alpha:asc)` : field;
}

interface FilterContext<FacetField extends string> {
	fieldTypes: SearchFieldTypes;
	baseFilters: Array<SearchFilter<string>>;
	/** Filters derived from the selected facet values, keyed by facet, so they can be left out. */
	facetFilters: Map<FacetField, SearchFilter<string>>;
	/** Facets whose counts must be calculated without their own selection applied. */
	disjunctiveFields: Array<FacetField>;
}

function createFilterContext<F extends ReadonlyArray<CollectionFieldConfig>>(
	collection: Collection<F>,
	fieldTypes: SearchFieldTypes,
	params: Pick<SearchCollectionParams<Collection<F>>, "facets" | "filters">,
): FilterContext<FacetFieldName<F>> {
	const facets: SearchFacetsConfig<Collection<F>> = params.facets ?? {};

	const facetFilters = new Map<FacetFieldName<F>, SearchFilter<string>>();
	const disjunctiveFields: Array<FacetFieldName<F>> = [];

	for (const field of collection.facetableFields) {
		const config = facets[field];

		if (config == null) {
			continue;
		}

		const filter = createFacetFilter(field, config);

		if (filter == null) {
			continue;
		}

		facetFilters.set(field, filter);

		if (config.operator !== "and") {
			disjunctiveFields.push(field);
		}
	}

	return { fieldTypes, baseFilters: [...(params.filters ?? [])], facetFilters, disjunctiveFields };
}

interface JoinContext {
	key: string;
	/** The runtime name of the joined collection. */
	name: string;
	fieldTypes: SearchFieldTypes;
	baseFilters: Array<SearchFilter<string>>;
	facetFilters: Map<string, SearchFilter<string>>;
	disjunctiveFields: Array<string>;
	/** Every facet requested on the joined collection, in the joined collection's field order. */
	requestedFields: Array<string>;
	facets: Partial<Record<string, SearchFacetConfig>>;
	sortBy: ReadonlyArray<SearchSort<string>>;
	include: ReadonlyArray<string>;
}

function createJoinContexts(
	joins: ReadonlyArray<AnySearchJoin>,
	referencedNames: Readonly<Record<string, string>>,
): Array<JoinContext> {
	return joins.map((join) => {
		const name = referencedNames[join.key];

		if (name == null) {
			throw new Error(`Join on "${join.key}" cannot be resolved, because no name was given for that collection.`);
		}

		const fieldTypes = getFieldTypes(join.collection.fields);
		const facets: Partial<Record<string, SearchFacetConfig>> = join.facets ?? {};

		const facetFilters = new Map<string, SearchFilter<string>>();
		const disjunctiveFields: Array<string> = [];
		const requestedFields: Array<string> = [];

		for (const field of join.collection.fields) {
			const config = facets[field.name];

			if (config == null) {
				continue;
			}

			requestedFields.push(field.name);

			const filter = createFacetFilter(field.name, config);

			if (filter == null) {
				continue;
			}

			facetFilters.set(field.name, filter);

			if (config.operator !== "and") {
				disjunctiveFields.push(field.name);
			}
		}

		return {
			key: join.key,
			name,
			fieldTypes,
			baseFilters: [...(join.filters ?? [])],
			facetFilters,
			disjunctiveFields,
			requestedFields,
			facets,
			sortBy: join.sortBy ?? [],
			include: join.include ?? [],
		};
	});
}

/** A join with nothing to filter on still has to appear in `filter_by`; `id:*` matches every referenced document. */
function serializeJoin(join: JoinContext, excludedFacetField?: string): string {
	const filters = [...join.baseFilters];

	for (const [field, filter] of join.facetFilters) {
		if (field !== excludedFacetField) {
			filters.push(filter);
		}
	}

	return `$${join.name}(${serializeFilters(join.fieldTypes, filters) ?? "id:*"})`;
}

function serializeFilterContext<FacetField extends string>(
	context: FilterContext<FacetField>,
	excludedFacetField?: FacetField,
): string | undefined {
	const filters = [...context.baseFilters];

	for (const [field, filter] of context.facetFilters) {
		if (field !== excludedFacetField) {
			filters.push(filter);
		}
	}

	return serializeFilters(context.fieldTypes, filters);
}

function createFilterBy<FacetField extends string>(
	context: FilterContext<FacetField>,
	joins: ReadonlyArray<JoinContext>,
	excludedFacetField?: FacetField,
	excludedJoinFacet?: { key: string; field: string },
): string | undefined {
	const expressions: Array<string> = [];

	const own = serializeFilterContext(context, excludedFacetField);
	if (own != null) {
		expressions.push(own);
	}

	for (const join of joins) {
		expressions.push(serializeJoin(join, excludedJoinFacet?.key === join.key ? excludedJoinFacet.field : undefined));
	}

	return expressions.length > 0 ? expressions.join(" && ") : undefined;
}

function createJoinedFacetField(join: JoinContext, field: string): JoinedFacetField {
	return { name: `$${join.name}(${field})`, key: `${join.key}.${field}` };
}

function resolveQueryBy<F extends ReadonlyArray<CollectionFieldConfig>>(
	collection: Collection<F>,
	queryBy: ReadonlyArray<CollectionSearchableFieldName<Collection<F>>> | undefined,
): Array<string> {
	return [...(queryBy ?? collection.searchableFields)];
}

export function createSearchPlan<F extends ReadonlyArray<CollectionFieldConfig>, Document extends DocumentSchema>(
	collection: Collection<F>,
	fieldTypes: SearchFieldTypes,
	params: SearchCollectionParams<Collection<F>>,
	/** The runtime name of every collection this one references, keyed as in the reference. */
	referencedNames: Readonly<Record<string, string>> = {},
): SearchPlan<Document, FacetFieldName<F>> {
	const { maxFacetValues, page = 1, perPage = 20, query, queryBy, sortBy } = params;
	const facets: SearchFacetsConfig<Collection<F>> = params.facets ?? {};

	const context = createFilterContext(collection, fieldTypes, params);
	const joins = createJoinContexts(params.joins ?? [], referencedNames);
	const queryByFields = resolveQueryBy(collection, queryBy);

	const requestedFields = collection.facetableFields.filter((field) => facets[field] != null);
	const facetFields = requestedFields.filter((field) => !context.disjunctiveFields.includes(field));

	const joinedFacetFields: Array<JoinedFacetField> = [];
	for (const join of joins) {
		for (const field of join.requestedFields) {
			if (!join.disjunctiveFields.includes(field)) {
				joinedFacetFields.push(createJoinedFacetField(join, field));
			}
		}
	}

	const facetBy = [
		...facetFields.map((field) => createFacetByExpression(field, facets[field])),
		...joinedFacetFields.map((field) => field.name),
	];

	const main: SearchParams<Document> = {
		q: query,
		query_by: queryByFields,
		page,
		per_page: perPage,
	};

	const filterBy = createFilterBy(context, joins);
	if (filterBy != null) {
		main.filter_by = filterBy;
	}

	const sortExpressions = [
		...(sortBy ?? []).map(({ field, direction }) => `${field}:${direction}`),
		...joins.flatMap((join) => join.sortBy.map(({ field, direction }) => `$${join.name}(${field}:${direction})`)),
	];
	if (sortExpressions.length > 0) {
		main.sort_by = sortExpressions;
	}

	if (facetBy.length > 0) {
		main.facet_by = facetBy;
	}

	const includes = joins.filter((join) => join.include.length > 0);
	if (includes.length > 0) {
		main.include_fields = ["*", ...includes.map((join) => `$${join.name}(${join.include.join(",")})`)];
	}

	if (maxFacetValues != null) {
		main.max_facet_values = maxFacetValues;
	}

	/** A disjunctive facet's counts have to ignore its own selection, which needs a request of its own. */
	function createFacetRequest(
		facetByExpression: string,
		filterByExpression: string | undefined,
	): SearchParams<Document> {
		const facetParams: SearchParams<Document> = {
			q: query,
			query_by: queryByFields,
			page: 1,
			/** Only the facet counts of this request are used. */
			per_page: 0,
			facet_by: [facetByExpression],
		};

		if (filterByExpression != null) {
			facetParams.filter_by = filterByExpression;
		}

		if (maxFacetValues != null) {
			facetParams.max_facet_values = maxFacetValues;
		}

		return facetParams;
	}

	const facetRequests = context.disjunctiveFields.map((field) => {
		return {
			field,
			params: createFacetRequest(createFacetByExpression(field, facets[field]), createFilterBy(context, joins, field)),
		};
	});

	const joinedFacetRequests: Array<{ field: JoinedFacetField; params: SearchParams<Document> }> = [];
	for (const join of joins) {
		for (const field of join.disjunctiveFields) {
			const joinedField = createJoinedFacetField(join, field);
			joinedFacetRequests.push({
				field: joinedField,
				params: createFacetRequest(
					joinedField.name,
					createFilterBy(context, joins, undefined, { key: join.key, field }),
				),
			});
		}
	}

	return {
		main,
		facetFields,
		joinedFacetFields,
		facetRequests,
		joinedFacetRequests,
		joins: joins.map((join) => {
			return { key: join.key, name: join.name };
		}),
	};
}

export function createFacetValuesRequest<
	F extends ReadonlyArray<CollectionFieldConfig>,
	Document extends DocumentSchema,
>(
	collection: Collection<F>,
	fieldTypes: SearchFieldTypes,
	params: SearchFacetValuesParams<Collection<F>>,
): SearchParams<Document> {
	const { facet, facetQuery, limit, query, queryBy } = params;

	const context = createFilterContext(collection, fieldTypes, params);

	const request: SearchParams<Document> = {
		q: query,
		query_by: resolveQueryBy(collection, queryBy),
		page: 1,
		/** A response carrying `facet_query` has an empty `hits` array, so this is a request of its own. */
		per_page: 0,
		facet_by: [createFacetByExpression(facet, params.facets?.[facet])],
		facet_query: `${facet}:${facetQuery}`,
	};

	/** A facet's own selection must not constrain its values, unless its values are conjunctive. */
	const filterBy = serializeFilterContext(context, context.disjunctiveFields.includes(facet) ? facet : undefined);
	if (filterBy != null) {
		request.filter_by = filterBy;
	}

	if (limit != null) {
		request.max_facet_values = limit;
	}

	return request;
}

function toFacet<Document extends DocumentSchema>(facetCount: SearchResponseFacetCountSchema<Document>): SearchFacet {
	return {
		values: facetCount.counts,
		sampled: facetCount.sampled,
		stats: {
			avg: facetCount.stats.avg,
			max: facetCount.stats.max,
			min: facetCount.stats.min,
			sum: facetCount.stats.sum,
			totalValues: facetCount.stats.total_values,
		},
	};
}

export function getFacet<Document extends DocumentSchema>(
	response: SearchResponse<Document>,
	field: string,
): SearchFacet {
	for (const facetCount of response.facet_counts ?? []) {
		if (String(facetCount.field_name) === field) {
			return toFacet(facetCount);
		}
	}

	return { values: [], sampled: false, stats: {} };
}

function toFacets<Document extends DocumentSchema, FacetField extends string>(
	response: SearchResponse<Document>,
	fields: ReadonlyArray<FacetField>,
): Partial<Record<FacetField, SearchFacet>> {
	const facetCounts = new Map<string, SearchResponseFacetCountSchema<Document>>();

	for (const facetCount of response.facet_counts ?? []) {
		facetCounts.set(String(facetCount.field_name), facetCount);
	}

	const facets: Partial<Record<FacetField, SearchFacet>> = {};

	for (const field of fields) {
		const facetCount = facetCounts.get(field);

		if (facetCount != null) {
			facets[field] = toFacet(facetCount);
		}
	}

	return facets;
}

/**
 * Walks the `highlight` tree of a hit, which mirrors the document. The flat `highlights` array omits array and nested
 * fields.
 */
function toHighlight(value: unknown): unknown {
	if (Array.isArray(value)) {
		return value.map((element) => toHighlight(element));
	}

	if (typeof value !== "object" || value == null) {
		return undefined;
	}

	if ("matched_tokens" in value) {
		return "snippet" in value && typeof value.snippet === "string" ? value.snippet : undefined;
	}

	const highlight: Record<string, unknown> = {};

	for (const [key, child] of Object.entries(value)) {
		const childHighlight = toHighlight(child);

		if (childHighlight !== undefined) {
			highlight[key] = childHighlight;
		}
	}

	return highlight;
}

function toJoinedFacets<Document extends DocumentSchema>(
	response: SearchResponse<Document>,
	fields: ReadonlyArray<JoinedFacetField>,
): Partial<Record<string, SearchFacet>> {
	const facetCounts = new Map<string, SearchResponseFacetCountSchema<Document>>();

	for (const facetCount of response.facet_counts ?? []) {
		facetCounts.set(String(facetCount.field_name), facetCount);
	}

	const facets: Partial<Record<string, SearchFacet>> = {};

	for (const field of fields) {
		const facetCount = facetCounts.get(field.name);

		if (facetCount != null) {
			facets[field.key] = toFacet(facetCount);
		}
	}

	return facets;
}

function toItems<Document extends DocumentSchema>(
	response: SearchResponse<Document>,
	joins: ReadonlyArray<{ key: string; name: string }>,
): Array<SearchItem<Document>> {
	return (response.hits ?? []).map((hit) => {
		const joined: Record<string, unknown> = {};

		for (const join of joins) {
			/** Typesense nests the joined document under the runtime name of its collection. */
			const document: Record<string, unknown> = hit.document;
			const value = document[join.name];

			if (value !== undefined) {
				joined[join.key] = value;
			}
		}

		return {
			joined,
			document: hit.document,
			/** The shape is only knowable at runtime, so the walk above is what makes this hold. */
			highlight: toHighlight(hit.highlight) as SearchHighlight<Document>,
		};
	});
}

export function mapSearchResult<Document extends DocumentSchema, FacetField extends string>(
	plan: SearchPlan<Document, FacetField>,
	responses: {
		main: SearchResponse<Document>;
		facets: Array<SearchResponse<Document>>;
		joinedFacets: Array<SearchResponse<Document>>;
	},
): SearchResult<Document, FacetField> {
	const perPage = responses.main.request_params.per_page ?? responses.main.hits?.length ?? 0;
	const total = responses.main.found;

	const facets = toFacets(responses.main, plan.facetFields);
	const joinedFacets = toJoinedFacets(responses.main, plan.joinedFacetFields);

	for (const [index, facetRequest] of plan.facetRequests.entries()) {
		const response = responses.facets[index];

		if (response != null) {
			Object.assign(facets, toFacets(response, [facetRequest.field]));
		}
	}

	for (const [index, facetRequest] of plan.joinedFacetRequests.entries()) {
		const response = responses.joinedFacets[index];

		if (response != null) {
			Object.assign(joinedFacets, toJoinedFacets(response, [facetRequest.field]));
		}
	}

	return {
		items: toItems(responses.main, plan.joins),
		pagination: {
			page: responses.main.page,
			perPage,
			total,
			totalPages: perPage > 0 ? Math.ceil(total / perPage) : 0,
		},
		facets,
		joinedFacets,
	};
}
