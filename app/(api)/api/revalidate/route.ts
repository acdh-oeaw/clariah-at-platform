import { log } from "@acdh-oeaw/lib";
import { type NextRequest, NextResponse } from "next/server";

import { env } from "#/configs/env.config.ts";
import { expire, revalidateEntity, tags } from "#/lib/data/api-cache.ts";

/**
 * Cache-tag vocabulary the upstream CMS dispatches (its `x-cache-tags` OpenAPI annotations), not this app's own
 * `EntityType` — mapped in `revalidate` below. Mirrors the receiver in the sibling DARIAH-ERIC/dariah-website app, fed
 * by the same CMS.
 */
const apiCacheTags = [
	"documents-policies",
	"events",
	"featured-entities",
	"funding-calls",
	"governance-bodies",
	"impact-case-studies",
	"navigation",
	"news",
	"opportunities",
	"pages",
	"persons",
	"projects",
	"site-metadata",
	"spotlight-articles",
	"working-groups",
] as const;

type ApiCacheTag = (typeof apiCacheTags)[number];

const apiCacheTagSet: ReadonlySet<string> = new Set(apiCacheTags);

function isApiCacheTag(value: unknown): value is ApiCacheTag {
	return typeof value === "string" && apiCacheTagSet.has(value);
}

interface RevalidationWebhookPayload {
	tags: Array<ApiCacheTag>;
}

/**
 * Parses an untrusted webhook body. Returns `null` when it is not a `{ tags }` object or any tag is outside the
 * vocabulary, so an unrecognized tag fails loudly instead of silently leaving stale cache.
 */
function parseRevalidationWebhookPayload(value: unknown): RevalidationWebhookPayload | null {
	if (typeof value !== "object" || value === null || !("tags" in value)) {
		return null;
	}

	const { tags: incoming } = value;

	if (!Array.isArray(incoming) || incoming.length === 0 || !incoming.every((value) => isApiCacheTag(value))) {
		return null;
	}

	return { tags: [...new Set(incoming)] };
}

/**
 * `revalidateEntity` already cascades to that type's sitemap/navigation/announcements/featured/statistics tags where
 * they apply, so most cases are a single call. Three tags aren't entity-shaped, so they expire their own standalone tag
 * directly. "members-partners" isn't its own entity type here: `cachedMembersAndPartners` and `cachedMemberOrPartner`
 * both tag under `collection:country`/`entities:country`, not a dedicated tag.
 */
function revalidate(tag: ApiCacheTag): void {
	switch (tag) {
		case "documents-policies": {
			revalidateEntity("documents_policies");
			return;
		}
		case "events": {
			revalidateEntity("events");
			return;
		}
		case "featured-entities": {
			expire(tags.featured);
			return;
		}
		case "funding-calls": {
			revalidateEntity("funding_calls");
			return;
		}
		case "governance-bodies": {
			revalidateEntity("governance_body");
			return;
		}
		case "impact-case-studies": {
			revalidateEntity("impact_case_studies");
			return;
		}
		case "navigation": {
			expire(tags.navigation);
			return;
		}
		case "news": {
			revalidateEntity("news");
			return;
		}
		case "opportunities": {
			revalidateEntity("opportunities");
			return;
		}
		case "pages": {
			revalidateEntity("pages");
			return;
		}
		case "persons": {
			revalidateEntity("persons");
			return;
		}
		case "projects": {
			revalidateEntity("projects");
			return;
		}
		case "site-metadata": {
			expire(tags.siteMetadata);
			return;
		}
		case "spotlight-articles": {
			revalidateEntity("spotlight_articles");
			return;
		}
		case "working-groups": {
			revalidateEntity("working_group");
			return;
		}
	}
}

export async function POST(request: NextRequest): Promise<NextResponse> {
	const secret = env.REVALIDATION_WEBHOOK_SECRET;
	/** 404, not 401: an unconfigured secret means this deployment never registered for the webhook at all. */
	if (secret == null) {
		return new NextResponse(null, { status: 404 });
	}

	const authorization = request.headers.get("authorization");
	if (authorization !== `Bearer ${secret}`) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const payload = parseRevalidationWebhookPayload(await request.json().catch(() => null));

	if (payload == null) {
		return NextResponse.json({ message: "Bad Request" }, { status: 400 });
	}

	for (const tag of payload.tags) {
		revalidate(tag);
	}

	log.info(`[revalidation webhook] received request for tags: ${payload.tags.join(", ")}.`);

	return NextResponse.json({ revalidated: true });
}
