import type { IntlLocale } from "#/lib/i18n/locales.ts";
import { localePrefix } from "#/lib/i18n/routing.ts";

/**
 * Strips `locale`'s prefix from `pathname`, returning the rest of the path (`""` for the root). `null` when `pathname`
 * doesn't start with either form of `locale`'s prefix.
 *
 * Recognizes both the public, short prefix (`localePrefix.prefixes[locale]`, e.g. `/en`) and next-intl's internally
 * rewritten one (`/${locale}`, e.g. `/en-GB`) — `usePathname()` (from "next/navigation", not next-intl's own
 * locale-aware one) can return either, since `localePrefix.prefixes` is shorter than the locale codes themselves.
 */
export function stripLocalePrefix(pathname: string, locale: IntlLocale): string | null {
	for (const prefix of [localePrefix.prefixes[locale], `/${locale}`]) {
		if (pathname === prefix || pathname === `${prefix}/`) {
			return "";
		}

		if (pathname.startsWith(`${prefix}/`)) {
			return pathname.slice(prefix.length);
		}
	}

	return null;
}
