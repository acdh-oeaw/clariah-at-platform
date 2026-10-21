import * as v from "valibot";

import { defineSearchParams } from "#/lib/navigation/search-params.ts";

/** `q` is the free-text query — news has no facets to narrow by. */
export const searchParams = defineSearchParams(
	v.object({
		q: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(200)), ""),
		page: v.optional(v.pipe(v.string(), v.regex(/^\d+$/), v.toNumber(), v.safeInteger(), v.minValue(1)), "1"),
	}),
	{
		stringify: ({ q, page }) => {
			return {
				q: q.length > 0 ? q : undefined,
				page: page === 1 ? undefined : String(page),
			};
		},
	},
);
