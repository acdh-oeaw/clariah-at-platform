import * as v from "valibot";

import { defineSearchParams, repeatedSearchParam } from "#/lib/navigation/search-params.ts";
import { websiteEntityTypes, websiteResourceTypes } from "#/lib/search/collections/website.ts";

export const searchTypes = [...websiteEntityTypes, ...websiteResourceTypes] as const;
export type SearchType = (typeof searchTypes)[number];

/**
 * `q` is the free-text query, `type` narrows results to the given document types (repeated as `?type=a&type=b`); a
 * missing or empty `type` searches all of them.
 */
export const searchParams = defineSearchParams(
	v.object({
		q: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(200)), ""),
		type: repeatedSearchParam(v.picklist(searchTypes)),
		page: v.optional(v.pipe(v.string(), v.regex(/^\d+$/), v.toNumber(), v.safeInteger(), v.minValue(1)), "1"),
	}),
	{
		stringify: ({ q, type, page }) => {
			return {
				q: q.length > 0 ? q : undefined,
				type: type.length > 0 ? type : undefined,
				page: page === 1 ? undefined : String(page),
			};
		},
	},
);
