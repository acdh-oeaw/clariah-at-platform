import { log } from "@acdh-oeaw/lib";
import { type NextRequest, NextResponse } from "next/server";

import { env } from "#/configs/env.config.ts";
import { expire, revalidateEntity, tags } from "#/lib/data/api-cache.ts";

const webhookEntityTypes = [
	"dariah-projects",
	"documents-policies",
	"events",
	"featured-entities",
	"funding-calls",
	"governance-bodies",
	"impact-case-studies",
	"navigation",
	"opportunities",
	"news",
	"pages",
	"persons",
	"site-metadata",
	"spotlight-articles",
	"working-groups",
] as const;

type WebhookEntityType = (typeof webhookEntityTypes)[number];

const webhookEntityTypeSet: ReadonlySet<string> = new Set(webhookEntityTypes);

function isWebhookEntityType(value: unknown): value is WebhookEntityType {
	return typeof value === "string" && webhookEntityTypeSet.has(value);
}

interface RevalidationWebhookPayload {
	type: WebhookEntityType;
}

/**
 * Parses an untrusted webhook body. Returns `null` when it is not a `{ type }` object or `type` is outside the
 * vocabulary, so an unrecognized type fails loudly instead of silently leaving stale cache.
 */
function parseRevalidationWebhookPayload(value: unknown): RevalidationWebhookPayload | null {
	if (typeof value !== "object" || value === null || !("type" in value) || !isWebhookEntityType(value.type)) {
		return null;
	}

	return { type: value.type };
}

/**
 * `revalidateEntity` already cascades to that type's sitemap/navigation/announcements/featured/statistics tags where
 * they apply, so most cases are a single call. Three types aren't entity-shaped, so they expire their own standalone
 * tag directly. "members-partners" isn't its own entity type here: `cachedMembersAndPartners`/`cachedMemberOrPartner`
 * both tag under `collection:country`/`entities:country`. "dariah-projects" is this app's plain "projects" —
 * `cachedProjects` and `cachedDariahProjects` share that tag.
 */
function revalidate(type: WebhookEntityType): void {
	switch (type) {
		case "dariah-projects": {
			revalidateEntity("projects");
			return;
		}
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

	revalidate(payload.type);

	log.info(`[revalidation webhook] received request for type: ${payload.type}.`);

	return NextResponse.json({ revalidated: true });
}
