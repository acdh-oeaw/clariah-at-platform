import { type NextRequest, NextResponse } from "next/server";

import { cachedEvent, cachedInstitution, cachedNewsItem, cachedPage, cachedProject } from "#/lib/data/api-cache.ts";
import {
	type EntityRouteType,
	buildEntityRoutePath,
	getEntitySectionPath,
	isEntityRouteType,
} from "#/lib/i18n/entity-routes.ts";
import { isValidLocale } from "#/lib/i18n/locales.ts";
import { localizeHref } from "#/lib/navigation/convert.ts";

/**
 * The locale switcher's target on entity detail routes, whose slug differs per locale: redirects to the entity's page
 * in the target locale. The switcher's links are plain `<a>` (a full page load), so resolving the slug here, on click,
 * keeps them correct without javascript and without loading the translations into every page. Uses the same cached
 * functions as the pages.
 */
function getEntity(type: EntityRouteType, slug: string, locale: string) {
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

/** A relative `Location`, so the redirect stays on whatever host the reverse proxy serves. */
function redirect(pathname: string): NextResponse {
	return new NextResponse(null, { status: 307, headers: { Location: pathname } });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
	const { searchParams } = request.nextUrl;
	const type = searchParams.get("type");
	const slug = searchParams.get("slug");
	const from = searchParams.get("from");
	const to = searchParams.get("to");

	if (!isEntityRouteType(type) || slug == null || slug === "" || !isValidLocale(from) || !isValidLocale(to)) {
		return NextResponse.json({ message: "Bad Request" }, { status: 400 });
	}

	const item = await getEntity(type, slug, from);
	const translation = item?.translations.find((candidate) => candidate.locale === to);

	/** No page in the target locale, or the source slug is gone: the section index exists in every locale. */
	if (translation == null) {
		return redirect(localizeHref(getEntitySectionPath(type), to));
	}

	return redirect(localizeHref(buildEntityRoutePath(type, translation.slug), to));
}
