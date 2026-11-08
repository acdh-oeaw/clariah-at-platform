import { type NextRequest, NextResponse } from "next/server";

import { cachedEvent, cachedInstitution, cachedNewsItem, cachedPage, cachedProject } from "#/lib/data/api-cache.ts";
import { type EntityRouteType, isEntityRouteType } from "#/lib/i18n/entity-routes.ts";
import { isValidLocale } from "#/lib/i18n/locales.ts";

/**
 * Lets `LocaleSwitcher` resolve the translated slugs of an entity detail route. Uses the same cached functions as the
 * pages.
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
			return cachedPage(slug, locale);
		}
		case "institutions": {
			return cachedInstitution(slug, locale);
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
