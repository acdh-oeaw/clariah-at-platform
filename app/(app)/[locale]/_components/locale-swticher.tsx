"use client";

import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { type ReactNode, Suspense, useEffect, useState } from "react";

import { linkStyles } from "#/components/link.tsx";
import { buildEntityRoutePath, matchEntityRoute } from "#/lib/i18n/entity-routes.ts";
import { type IntlLocale, getIntlLanguage, locales } from "#/lib/i18n/locales.ts";
import { stripLocalePrefix } from "#/lib/i18n/pathname.ts";
import { localePrefix } from "#/lib/i18n/routing.ts";

/** Language names are shown in their own language, so they are not translated. */
const languageNames = {
	"de-AT": "Deutsch",
	"en-GB": "English",
} as const satisfies Record<IntlLocale, string>;

/** What `usePathname` returns on `global-not-found`, instead of the url which matched no route. */
const globalNotFoundPathname = "/_not-found";

/** Swap the locale prefix of `pathname`, keeping the rest of the path. */
function getLocalizedPathname(pathname: string, current: IntlLocale, target: IntlLocale): string {
	const targetPrefix = localePrefix.prefixes[target];

	if (pathname === globalNotFoundPathname) {
		return targetPrefix;
	}

	const suffix = stripLocalePrefix(pathname, current);

	if (suffix != null) {
		return suffix === "" ? targetPrefix : `${targetPrefix}${suffix}`;
	}

	return pathname === "/" ? targetPrefix : `${targetPrefix}${pathname}`;
}

interface LocaleSwitcherProps {
	/** Accessible name of the group, e.g. "Language". */
	label: string;
}

interface TranslationsResponse {
	translations: Array<{ locale: string; slug: string }>;
}

function isTranslationsResponse(value: unknown): value is TranslationsResponse {
	return (
		typeof value === "object" &&
		value !== null &&
		"translations" in value &&
		Array.isArray((value as TranslationsResponse).translations)
	);
}

interface LocaleLinksProps extends LocaleSwitcherProps {
	getHref: (locale: IntlLocale) => string;
}

function LocaleLinks(props: Readonly<LocaleLinksProps>): ReactNode {
	const { getHref, label } = props;

	const currentLocale = useLocale();

	return (
		<div aria-label={label} className="flex items-center gap-x-3" role="group">
			{locales.map((locale) => {
				const isCurrent = locale === currentLocale;
				const language = getIntlLanguage(locale);

				/** A full page load: `<html lang>`, the messages and react-aria's localized strings are set once per document. */
				return (
					<a
						key={locale}
						aria-current={isCurrent ? "true" : undefined}
						className={linkStyles({
							/** Always bold, so switching locale does not change the width. */
							className: isCurrent ? "font-bold underline underline-offset-[24%]" : "font-bold",
							variant: "primary",
						})}
						href={getHref(locale)}
						hrefLang={language}
					>
						<span lang={language}>
							{language.toUpperCase()}
							{/* Text rather than `aria-label`: the name must contain the visible label (wcag 2.5.3, label in name). */}
							<span className="sr-only"> {languageNames[locale]}</span>
						</span>
					</a>
				);
			})}
		</div>
	);
}

function getLocaleHomeHref(locale: IntlLocale): string {
	return localePrefix.prefixes[locale];
}

function CurrentPageLocaleLinks(props: Readonly<LocaleSwitcherProps>): ReactNode {
	const currentLocale = useLocale();
	const pathname = usePathname();

	const suffix = stripLocalePrefix(pathname, currentLocale);
	const match = suffix != null ? matchEntityRoute(suffix) : null;
	const matchKey = match != null ? `${match.type}:${match.slug}:${currentLocale}` : null;

	/**
	 * Entity detail routes have a translated slug per locale. Keyed by route, so a stale fetch for the previous route no
	 * longer applies.
	 */
	const [fetched, setFetched] = useState<{ key: string; paths: Record<string, string> } | null>(null);
	const translatedPaths = fetched?.key === matchKey ? fetched.paths : null;

	useEffect(() => {
		/** Not the render-scope `match`, which is a new object on every render and would re-trigger the effect. */
		const effectSuffix = stripLocalePrefix(pathname, currentLocale);
		const effectMatch = effectSuffix != null ? matchEntityRoute(effectSuffix) : null;

		if (effectMatch == null) {
			return;
		}

		const controller = new AbortController();
		const key = `${effectMatch.type}:${effectMatch.slug}:${currentLocale}`;
		const query = new URLSearchParams({
			type: effectMatch.type,
			slug: effectMatch.slug,
			locale: currentLocale,
		});

		fetch(`/api/translations?${query.toString()}`, { signal: controller.signal })
			.then((response) => (response.ok ? response.json() : null))
			.then((data: unknown) => {
				if (!isTranslationsResponse(data)) {
					return undefined;
				}

				const paths: Record<string, string> = {};
				for (const translation of data.translations) {
					paths[translation.locale] = buildEntityRoutePath(effectMatch.type, translation.slug);
				}

				setFetched({ key, paths });

				return undefined;
			})
			.catch(() => {
				// Aborted (route changed again) or a network error — the prefix-swap fallback still works.
			});

		return () => {
			controller.abort();
		};
	}, [pathname, currentLocale]);

	function getHref(locale: IntlLocale): string {
		const translatedPath = translatedPaths?.[locale];

		return translatedPath != null
			? `${localePrefix.prefixes[locale]}${translatedPath}`
			: getLocalizedPathname(pathname, currentLocale, locale);
	}

	return <LocaleLinks {...props} getHref={getHref} />;
}

/**
 * The pathname suspends on routes with a param missing from `generateStaticParams`. The switcher is part of the header,
 * so without a boundary here such a route would lose its whole shell. The shell links to the home page of each locale
 * instead, until the pathname is known.
 */
export function LocaleSwitcher(props: Readonly<LocaleSwitcherProps>): ReactNode {
	return (
		<Suspense fallback={<LocaleLinks {...props} getHref={getLocaleHomeHref} />}>
			<CurrentPageLocaleLinks {...props} />
		</Suspense>
	);
}
