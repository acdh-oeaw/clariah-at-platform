import { assert } from "@acdh-oeaw/lib";

import { env } from "#/configs/env.config.ts";
import { type SearchService, createSearchService } from "#/lib/search/index.ts";

let service: SearchService | undefined;

/**
 * Created lazily, so a missing search key only fails the pages that actually search, not every build that imports this
 * module.
 */
export function getSearchService(): SearchService {
	if (service == null) {
		const apiKey = env.NEXT_PUBLIC_TYPESENSE_SEARCH_API_KEY;
		assert(apiKey != null, "Missing NEXT_PUBLIC_TYPESENSE_SEARCH_API_KEY.");

		service = createSearchService({
			apiKey,
			nodes: [
				{
					host: env.NEXT_PUBLIC_TYPESENSE_HOST,
					port: env.NEXT_PUBLIC_TYPESENSE_PORT,
					protocol: env.NEXT_PUBLIC_TYPESENSE_PROTOCOL,
				},
			],
			collections: {
				resources: env.NEXT_PUBLIC_TYPESENSE_COLLECTION_NAME_RESOURCES,
				website: env.NEXT_PUBLIC_TYPESENSE_COLLECTION_NAME_WEBSITE,
			},
		});
	}

	return service;
}
