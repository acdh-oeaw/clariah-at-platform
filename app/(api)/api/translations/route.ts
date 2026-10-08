import { type NextRequest, NextResponse } from "next/server";

import { cachedEvent, cachedNewsItem, cachedProject } from "#/lib/data/api-cache.ts";
import { type EntityRouteType, isEntityRouteType } from "#/lib/i18n/entity-routes.ts";
import { isValidLocale } from "#/lib/i18n/locales.ts";

/**
 * Lets `LocaleSwitcher` (a client component, with no access to server-cached data) resolve the real, per-locale slug
 * for an entity detail route, instead of its naive same-slug-every-locale fallback. Hits the same `"use cache"`-backed
 * functions the page itself uses, so a cache hit here costs nothing extra — this data changes only when the CMS does,
 * via the same webhook that revalidates everything else.
 *
 * "projects" uses `cachedProject` (`getProjectBySlug`), not `cachedDariahProject` — unverified against the actual page,
 * which isn't visible from here; swap it if the real `/projects/[slug]` page uses the other one.
 */
function getTranslatedEntity(type: EntityRouteType, slug: string, locale: string) {
	switch (type) {
		case "news": {
			return cachedNewsItem(slug, locale);
		}
		case "events": {
			return cachedEvent(slug, locale);
		}
		case "projects": {
			return cachedProject(slug, locale);
		}
		case "pages": {
			return cachedProject(slug, locale);
		}
	}
}

export async function GET(request: NextRequest): Promise<NextResponse> {
	const { searchParams } = request.nextUrl;
	const type = searchParams.get("type");
	const slug = searchParams.get("slug");
	const locale = searchParams.get("locale");

	if (!isEntityRouteType(type) || slug == null || slug === "" || !isValidLocale(locale)) {
		return NextResponse.json({ message: "Bad Request" }, { status: 400 });
	}

	const item = await getTranslatedEntity(type, slug, locale);

	if (item == null) {
		return NextResponse.json({ message: "Not Found" }, { status: 404 });
	}

	return NextResponse.json({ translations: item.translations });
}
