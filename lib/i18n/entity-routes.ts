/**
 * Entity detail routes whose slug differs per locale. The locale switcher links these through
 * `app/(api)/api/locale-switch/route.ts`, which redirects to the translated slug.
 */
const entityRoutes = [
	{ type: "news", base: "/news/", pattern: /^\/news\/[^/]+$/ },
	{ type: "events", base: "/events/", pattern: /^\/events\/[^/]+$/ },
	{ type: "projects", base: "/projects/", pattern: /^\/projects\/[^/]+$/ },
	{ type: "pages", base: "/pages/", pattern: /^\/pages\/[^/]+$/ },
	{ type: "institutions", base: "/consortium/", pattern: /^\/consortium\/[^/]+$/ },
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

/** The section index an entity's detail pages live below, e.g. `/news`. */
export function getEntitySectionPath(type: EntityRouteType): string {
	const route = entityRoutes.find((candidate) => candidate.type === type);

	return route == null ? "/" : route.base.slice(0, -1);
}
