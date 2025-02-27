import type { CollectionCreateSchema } from "typesense/lib/Typesense/Collections";
import type { KeyCreateSchema } from "typesense/lib/Typesense/Key";

import { env } from "@/config/env.config";

export const collectionSchema: CollectionCreateSchema = {
	name: env.NEXT_PUBLIC_TYPESENSE_COLLECTION_NAME,
	enable_nested_fields: true,
	fields: [
		{
			name: "title",
			type: "string",
			facet: false,
		},
		{
			name: "kind",
			type: "string",
			facet: true,
		},
		{
			name: "description",
			type: "string",
			facet: false,
		},
		{
			name: "language",
			type: "string",
			facet: true,
		},
		{
			name: "keywords",
			type: "string[]",
			facet: true,
		},
		{
			name: "links",
			type: "object[]",
			facet: false,
		},
	],
};

export const searchKeySchema: KeyCreateSchema = {
	description: "Search-only key.",
	actions: ["documents:export", "documents:get", "documents:search"],
	collections: [env.NEXT_PUBLIC_TYPESENSE_COLLECTION_NAME],
};
