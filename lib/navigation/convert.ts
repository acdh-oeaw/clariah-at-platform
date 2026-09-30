import { isNonEmptyString } from "@acdh-oeaw/lib";

import type { cachedNavigation } from "#/lib/data/api-cache.ts";
import type { IntlLocale } from "#/lib/i18n/locales.ts";
import { localePrefix } from "#/lib/i18n/routing.ts";
import type { NavigationConfig, NavigationLink } from "#/lib/navigation/navigation.ts";

type NavigationMenuItem = Awaited<ReturnType<typeof cachedNavigation>>[number]["items"][number];

/**
 * Prefix root-relative, locale-less hrefs with the locale. External urls, `mailto:`, `#anchors` and hrefs which already
 * carry a locale prefix are left alone.
 */
export function localizeHref(href: string, locale: IntlLocale): string {
	if (!href.startsWith("/") || href.startsWith("//")) {
		return href;
	}

	const hasLocalePrefix = Object.values(localePrefix.prefixes).some(
		(prefix) => href === prefix || href.startsWith(`${prefix}/`) || href.startsWith(`${prefix}?`),
	);

	if (hasLocalePrefix) {
		return href;
	}

	const prefix = localePrefix.prefixes[locale];

	return href === "/" ? prefix : `${prefix}${href}`;
}

/** An explicit `href` wins; otherwise fall back to the linked entity's page. `null` means there is nothing to link to. */
function getHref(item: Pick<NavigationMenuItem, "href" | "entity">): string | null {
	if (isNonEmptyString(item.href)) {
		return item.href;
	}

	if (isNonEmptyString(item.entity?.href)) {
		return item.entity.href;
	}

	return null;
}

export function convertNavigationMenu(
	items: Awaited<ReturnType<typeof cachedNavigation>>[number]["items"],
	locale: IntlLocale,
): NavigationConfig {
	const config: NavigationConfig = {};

	for (const item of items.toSorted((a, b) => a.position - b.position)) {
		if (item.children.length > 0) {
			const children: Record<string, NavigationLink> = {};

			for (const child of item.children.toSorted((a, b) => a.position - b.position)) {
				const href = getHref(child);
				if (href == null) {
					continue;
				}

				children[child.id] = {
					type: "link",
					label: child.label,
					href: localizeHref(href, locale),
					target: child.isExternal ? "_blank" : undefined,
				};
			}

			config[item.id] = {
				type: "menu",
				label: item.label,
				children,
			};
		} else {
			const href = getHref(item);
			if (href == null) {
				continue;
			}

			config[item.id] = {
				type: "link",
				label: item.label,
				href: localizeHref(href, locale),
				target: item.isExternal ? "_blank" : undefined,
			};
		}
	}

	return config;
}
