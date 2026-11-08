import * as v from "valibot";

import { defineSearchParams } from "#/lib/navigation/search-params.ts";
import { websiteEntityTypes, websiteResourceTypes } from "#/lib/search/collections/website.ts";

export const searchTypes = [...websiteEntityTypes, ...websiteResourceTypes] as const;

/**
 * `q` is the free-text query, `type` narrows results to one document type; a missing `type` searches all of them. The
 * search form submits an empty `type` for "all types", which is treated the same as a missing one.
 */
export const searchParams = defineSearchParams(
	v.object({
		q: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(200)), ""),
		type: v.optional(
			v.union([
				v.pipe(
					v.literal(""),
					v.transform(() => undefined),
				),
				v.picklist(searchTypes),
			]),
		),
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
