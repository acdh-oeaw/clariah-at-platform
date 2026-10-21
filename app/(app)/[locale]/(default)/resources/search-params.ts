import * as v from "valibot";

import { defineSearchParams } from "#/lib/navigation/search-params.ts";
import { resourceTypes } from "#/lib/search/collections/resources.ts";

/** `q` is the free-text query, `type` narrows results to one resource type; a missing `type` searches every type. */
export const searchParams = defineSearchParams(
	v.object({
		q: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(200)), ""),
		type: v.optional(v.picklist(resourceTypes)),
		page: v.optional(v.pipe(v.string(), v.regex(/^\d+$/), v.toNumber(), v.safeInteger(), v.minValue(1)), "1"),
	}),
	{
		stringify: ({ q, type, page }) => {
			return {
				q: q.length > 0 ? q : undefined,
				type,
				page: page === 1 ? undefined : String(page),
			};
		},
	},
);
