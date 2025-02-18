import { assert } from "@acdh-oeaw/lib";
import type TypesenseInstantsearchAdapter from "typesense-instantsearch-adapter";
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter";

import { env } from "@/config/env.config";

import { typesenseSettings } from "./typesense-client";

assert(env.NEXT_PUBLIC_TYPESENSE_SEARCH_API_KEY, "NEXT_PUBLIC_TYPESENSE_SEARCH_API_KEY not set");

const apiKey = env.NEXT_PUBLIC_TYPESENSE_SEARCH_API_KEY;

export const typesenseInstantsearchAdapter: TypesenseInstantsearchAdapter =
	new TypesenseInstantSearchAdapter({
		server: { ...typesenseSettings, apiKey },
		additionalSearchParameters: {
			query_by: "title",
			per_page: 25,
		},
	});
