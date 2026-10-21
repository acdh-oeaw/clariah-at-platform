import * as v from "valibot";

import { defineSearchParams } from "#/lib/navigation/search-params.ts";

/**
 * `q` is the free-text query, `project_call` narrows results to one funding call (the facet field's own name, not
 * translated — see `lib/search/collections/website.ts`); a missing `project_call` searches every call.
 */
export const searchParams = defineSearchParams(
	v.object({
		q: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(200)), ""),
		project_call: v.optional(v.pipe(v.string(), v.trim(), v.nonEmpty())),
		page: v.optional(v.pipe(v.string(), v.regex(/^\d+$/), v.toNumber(), v.safeInteger(), v.minValue(1)), "1"),
	}),
	{
		stringify: ({ q, project_call, page }) => {
			return {
				q: q.length > 0 ? q : undefined,
				project_call,
				page: page === 1 ? undefined : String(page),
			};
		},
	},
);
