import type { SearchResponse } from "typesense/lib/Typesense/Documents";

import type { SSHOC_ITEM_CATEGORIES } from "@/lib/typesense/constants";

type ResourceLanguage = "de" | "en" | "un";

export interface Link {
	label: string;
	href: string;
}

export interface Resource {
	title: string;
	kind: ResourceCategory;
	description: string;
	links: Array<Link>;
	language: ResourceLanguage;
	keywords: Array<Keyword>;
}

/* SSHOC */

type SShocItemCategory = (typeof SSHOC_ITEM_CATEGORIES)[number];

type ResourceCategory = SShocItemCategory | "publication" | "course";

interface SShocActor {
	id: number;
	name: string;
	externalIds: Array<ExternalId>;
	website: string;
	email: string;
	affiliations: Array<string>;
	items: Array<Item>;
}

export interface ExternalId {
	identifierService: IdentifierService;
	identifier: string;
}

export interface IdentifierService {
	code: string;
	label: string;
	ord: number;
	urlTemplate: string;
}

export interface Item {
	properties: Array<ItemProperties>;
	id: number;
	category: string;
	description: string;
	label: string;
	version: string;
	persistentId: string;
	lastInfoUpdate: string;
}

export interface ToolService {
	id: number;
	category: string;
	label: string;
	persistentId: string;
	lastInfoUpdate: string;
	status: string;
	description: string;
}

export interface ItemProperties {
	type: ItemType;
	concept: Concept;
}

export interface ItemType {
	code: string;
	label: string;
	type: string;
	groupName: string;
	hidden: boolean;
	ord: number;
	allowedVocabularies: Array<AllowedVocabulary>;
}

export interface AllowedVocabulary {
	code: string;
	scheme: string;
	namespace: string;
	label: string;
	closed: boolean;
}

export interface Concept {
	code: string;
	vocabulary: Vocabulary;
	label: string;
	notation: string;
	uri: string;
	candidate: boolean;
}

export interface Vocabulary {
	code: string;
	scheme: string;
	namespace: string;
	label: string;
	closed: boolean;
}

interface ResourceSearchResponse extends SearchResponse {
	hits:
		| Array<{
				document: Resource;
				highlight: Record<string, Array<string>> | null;
		  }>
		| [];
}
