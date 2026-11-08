"use client";

import { createUrl } from "@acdh-oeaw/lib";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { Fragment, type ReactNode } from "react";

import { env } from "#/configs/env.config.ts";
import { matchEntityRoute } from "#/lib/i18n/entity-routes.ts";
import { locales } from "#/lib/i18n/locales.ts";
import { stripLocalePrefix } from "#/lib/i18n/pathname.ts";
import { localePrefix } from "#/lib/i18n/routing.ts";

function toAbsoluteUrl(pathname: string): string {
	return String(createUrl({ baseUrl: env.NEXT_PUBLIC_APP_BASE_URL, pathname }));
}

/** Instead of next-intl's `Link` response header, see `alternateLinks: false` in `lib/i18n/routing.ts`. */
export function AlternateLinks(): ReactNode {
	const currentLocale = useLocale();
	const pathname = usePathname();

	const suffix = stripLocalePrefix(pathname, currentLocale) ?? pathname;

	if (matchEntityRoute(suffix) != null) {
		return null;
	}

	const isHomepage = suffix === "" || suffix === "/";

	return (
		<Fragment>
			{locales.map((locale) => {
				const prefix = localePrefix.prefixes[locale];
				const href = suffix === "" ? prefix : `${prefix}${suffix}`;

				return <link key={locale} href={toAbsoluteUrl(href)} hrefLang={locale} rel="alternate" />;
			})}
			{isHomepage ? <link href={toAbsoluteUrl("/")} hrefLang="x-default" rel="alternate" /> : null}
		</Fragment>
	);
}
