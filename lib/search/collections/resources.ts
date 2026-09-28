import {
	type CollectionDocument,
	type CollectionFacetableFieldName,
	type CollectionFilterableFieldName,
	type CollectionSearchableFieldName,
	type CollectionSortableFieldName,
	defineCollection,
} from "#/lib/search/schema.ts";
import type { SearchCollectionParams, SearchFacetValuesParams, SearchItem, SearchResult } from "#/lib/search/search.ts";

export const resourcesCollection = defineCollection({
	fields: [
		{ name: "id", type: "string", index: false },
		{ name: "source", type: "string", index: true, facet: true },
		{ name: "source_id", type: "string", index: false },
		{ name: "source_updated_at", type: "int64", index: true, optional: true, sort: true },
		{ name: "national_consortia", type: "string", array: true, index: true, facet: true, optional: true },
		{ name: "working_groups", type: "string", array: true, index: true, facet: true, optional: true },
		{ name: "institutions", type: "string", array: true, index: true, facet: true, optional: true },
		{ name: "upstream_sources", type: "string", array: true, index: true, facet: true, optional: true },
		{ name: "imported_at", type: "int64", index: false },
		{ name: "type", type: "string", index: true, facet: true },
		{ name: "label", type: "string", index: true, sort: true },
		{ name: "description", type: "string", index: true },
		{ name: "keywords", type: "string", array: true, index: true, facet: true },
		{ name: "kind", type: "string", index: false, optional: true },
		{ name: "source_url", type: "string", index: false, optional: true },
		{ name: "links", type: "string", array: true, index: false },
		{ name: "authors", type: "string", array: true, index: false, optional: true },
		{ name: "year", type: "int32", index: true, facet: true, optional: true },
		{ name: "pid", type: "string", index: false, optional: true },
	] as const,
});

export const resourceSources = ["dariah-campus", "ssh-open-marketplace", "zenodo"] as const;
export type ResourceSource = (typeof resourceSources)[number];

export const resourceTypes = ["publication", "service", "software", "training-material", "workflow"] as const;
export type ResourceType = (typeof resourceTypes)[number];

export const resourceServiceKinds = ["community", "core"] as const;
export type ResourceServiceKind = (typeof resourceServiceKinds)[number];

interface ResourceDocumentBase extends CollectionDocument<typeof resourcesCollection> {
	type: ResourceType;
	source: ResourceSource;
	/** Link to the resource's details page on the ingest source (e.g. its sshoc or zenodo page). */
	source_url: string | null;
}

export interface PublicationResourceDocument extends ResourceDocumentBase {
	type: "publication";
	kind: string | null;
	source: "zenodo";
	national_consortia: Array<string>;
	working_groups: Array<string>;
	institutions: Array<string>;
	upstream_sources: Array<string> | null;
	authors: Array<string>;
	year: number | null;
	pid: string | null;
}

export interface ServiceResourceDocument extends ResourceDocumentBase {
	type: "service";
	kind: ResourceServiceKind;
	source: "ssh-open-marketplace";
	national_consortia: Array<string>;
	working_groups: Array<string>;
	institutions: Array<string>;
	upstream_sources: null;
	authors: null;
	year: null;
	pid: null;
}

export interface SoftwareResourceDocument extends ResourceDocumentBase {
	type: "software";
	kind: null;
	source: "ssh-open-marketplace";
	national_consortia: Array<string>;
	working_groups: Array<string>;
	institutions: Array<string>;
	upstream_sources: null;
	authors: null;
	year: null;
	pid: null;
}

export interface TrainingMaterialResourceDocument extends ResourceDocumentBase {
	type: "training-material";
	kind: null;
	source: "dariah-campus" | "ssh-open-marketplace";
	national_consortia: Array<string>;
	working_groups: Array<string>;
	institutions: Array<string>;
	upstream_sources: Array<string>;
	authors: Array<string> | null;
	year: number | null;
	pid: string | null;
}

export interface WorkflowResourceDocument extends ResourceDocumentBase {
	type: "workflow";
	kind: null;
	source: "ssh-open-marketplace";
	national_consortia: Array<string>;
	working_groups: Array<string>;
	institutions: Array<string>;
	upstream_sources: null;
	authors: null;
	year: null;
	pid: null;
}

export type ResourceDocument =
	| PublicationResourceDocument
	| ServiceResourceDocument
	| SoftwareResourceDocument
	| TrainingMaterialResourceDocument
	| WorkflowResourceDocument;

export type ResourcesCollection = typeof resourcesCollection;

export type ResourceSearchField = CollectionSearchableFieldName<ResourcesCollection>;
export type ResourceFilterField = CollectionFilterableFieldName<ResourcesCollection>;
export type ResourceSortField = CollectionSortableFieldName<ResourcesCollection>;
export type ResourceFacetField = CollectionFacetableFieldName<ResourcesCollection>;

export type SearchResourcesParams = SearchCollectionParams<ResourcesCollection>;
export type SearchResourcesFacetValuesParams = SearchFacetValuesParams<ResourcesCollection>;
export type ResourceItem = SearchItem<ResourceDocument>;
export type ResourceSearchResult = SearchResult<ResourceDocument, ResourceFacetField>;
