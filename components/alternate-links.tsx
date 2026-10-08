"use client";

import { createUrl } from "@acdh-oeaw/lib";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { env } from "#/configs/env.config.ts";
import { matchEntityRoute } from "#/lib/i18n/entity-routes.ts";
import { locales } from "#/lib/i18n/locales.ts";
import { stripLocalePrefix } from "#/lib/i18n/pathname.ts";
import { localePrefix } from "#/lib/i18n/routing.ts";

function toAbsoluteUrl(pathname: string): string {
	return String(createUrl({ baseUrl: env.NEXT_PUBLIC_APP_BASE_URL, pathname }));
}

/**
 * Renders locale alternate links as `<link>` tags (hoisted into `<head>` by React) instead of the `Link` response
 * header next-intl's middleware would otherwise set — disabled via `alternateLinks: false` in `routing.ts`. See the
 * comment there for why: a still-open Next.js bug repeatedly appends a full duplicate set of header-based alternate
 * links after every Cache Components revalidation, eventually growing the response header large enough to 502 behind a
 * reverse proxy.
 *
 * @see {@link https://github.com/vercel/next.js/issues/94945}
 */
export function AlternateLinks(): ReactNode {
	const currentLocale = useLocale();
	const pathname = usePathname();

	const suffix = stripLocalePrefix(pathname, currentLocale) ?? pathname;

	if (matchEntityRoute(suffix) != null) {
		return null;
	}

	const isHomepage = suffix === "" || suffix === "/";

	return (
		<>
			{locales.map((locale) => {
				const prefix = localePrefix.prefixes[locale];
				const href = suffix === "" ? prefix : `${prefix}${suffix}`;

				return <link key={locale} href={toAbsoluteUrl(href)} hrefLang={locale} rel="alternate" />;
			})}
			{isHomepage ? <link href={toAbsoluteUrl("/")} hrefLang="x-default" rel="alternate" /> : null}
		</>
	);
}
