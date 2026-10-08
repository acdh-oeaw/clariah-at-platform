/**
 * Entity detail routes whose own `translations` (locale -> real slug) make the naive same-slug-every-locale assumption
 * `AlternateLinks`/`LocaleSwitcher` otherwise fall back to actually wrong. Extend this array as more entity types get
 * the same treatment; `app/(api)/api/translations/route.ts` has the matching fetch side (its own switch dispatches
 * `type` to the right `cachedXxx` function).
 */
const entityRoutes = [
	{ type: "news", base: "/news/", pattern: /^\/news\/[^/]+$/ },
	{ type: "events", base: "/events/", pattern: /^\/events\/[^/]+$/ },
	{ type: "projects", base: "/projects/", pattern: /^\/projects\/[^/]+$/ },
	{ type: "pages", base: "/pages/", pattern: /^\/pages\/[^/]+$/ },
] as const;

export type EntityRouteType = (typeof entityRoutes)[number]["type"];

const entityRouteTypes = new Set<string>(entityRoutes.map((route) => route.type));

export function isEntityRouteType(value: unknown): value is EntityRouteType {
	return typeof value === "string" && entityRouteTypes.has(value);
}

export interface EntityRouteMatch {
	type: EntityRouteType;
	slug: string;
}

/** `suffix` is the path with the locale prefix already stripped, e.g. `/news/some-article`. */
export function matchEntityRoute(suffix: string): EntityRouteMatch | null {
	for (const route of entityRoutes) {
		if (route.pattern.test(suffix)) {
			return { type: route.type, slug: suffix.slice(route.base.length) };
		}
	}

	return null;
}

export function buildEntityRoutePath(type: EntityRouteType, slug: string): string {
	const route = entityRoutes.find((candidate) => candidate.type === type);

	return route == null ? `/${slug}` : `${route.base}${slug}`;
}
