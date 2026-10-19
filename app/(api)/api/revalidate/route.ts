import { log } from "@acdh-oeaw/lib";
import { type NextRequest, NextResponse } from "next/server";

import { env } from "#/configs/env.config.ts";
import { expireByCacheTag } from "#/lib/data/api-cache.ts";
import type { CacheTag, RevalidationWebhookPayload } from "#/lib/data/api-client.ts";
import { cacheTags } from "#/lib/openapi/cache-tags.ts";

const cacheTagSet: ReadonlySet<string> = new Set(cacheTags);

function isCacheTag(value: unknown): value is CacheTag {
	return typeof value === "string" && cacheTagSet.has(value);
}

/**
 * Parses an untrusted revalidation webhook body. Returns `null` when it is not a `{ tags }` object, or any tag is
 * outside the api's `CacheTag` vocabulary (see its own description in `lib/openapi/types.ts`: "the `revalidate` webhook
 * delivers the tags a content change touched"), so an unrecognized tag fails loudly instead of silently leaving stale
 * cache. A single dispatch can carry more than one tag — e.g. an organisational unit touches `governance-bodies`,
 * `members-partners` and `working-groups` at once.
 */
function parseRevalidationWebhookPayload(value: unknown): RevalidationWebhookPayload | null {
	if (typeof value !== "object" || value === null || !("tags" in value)) {
		return null;
	}

	const { tags } = value;

	if (!Array.isArray(tags) || tags.length === 0 || !tags.every((tag) => isCacheTag(tag))) {
		return null;
	}

	return { tags };
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
		expireByCacheTag(tag);
	}

	log.info(`[revalidation webhook] received request for tags: ${payload.tags.join(", ")}.`);

	return NextResponse.json({ revalidated: true });
}
