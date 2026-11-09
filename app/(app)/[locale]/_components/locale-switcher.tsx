"use client";

import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { type ReactNode, Suspense } from "react";

import { linkStyles } from "#/components/link.tsx";
import { matchEntityRoute } from "#/lib/i18n/entity-routes.ts";
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

interface LocaleLink {
	href: string;
	/** For links through the locale-switch redirect, which crawlers need not follow: hreflang comes from the metadata. */
	rel?: "nofollow";
}

interface LocaleLinksProps extends LocaleSwitcherProps {
	getLink: (locale: IntlLocale) => LocaleLink;
}

function LocaleLinks(props: Readonly<LocaleLinksProps>): ReactNode {
	const { getLink, label } = props;

	const currentLocale = useLocale();

	return (
		<div aria-label={label} className="flex items-center gap-x-3" role="group">
			{locales.map((locale) => {
				const isCurrent = locale === currentLocale;
				const language = getIntlLanguage(locale);
				const { href, rel } = getLink(locale);

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
						href={href}
						hrefLang={language}
						rel={rel}
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

function getLocaleHomeLink(locale: IntlLocale): LocaleLink {
	return { href: localePrefix.prefixes[locale] };
}

function CurrentPageLocaleLinks(props: Readonly<LocaleSwitcherProps>): ReactNode {
	const currentLocale = useLocale();
	const pathname = usePathname();

	const suffix = stripLocalePrefix(pathname, currentLocale);
	const match = suffix != null ? matchEntityRoute(suffix) : null;

	function getLink(locale: IntlLocale): LocaleLink {
		/**
		 * Entity detail routes have a translated slug per locale, which the redirect resolves on click, so the link is
		 * right without javascript and without loading the translations into every page.
		 */
		if (match != null && locale !== currentLocale) {
			const query = new URLSearchParams({ type: match.type, slug: match.slug, from: currentLocale, to: locale });

			return { href: `/api/locale-switch?${query.toString()}`, rel: "nofollow" };
		}

		return { href: getLocalizedPathname(pathname, currentLocale, locale) };
	}

	return <LocaleLinks {...props} getLink={getLink} />;
}

/**
 * The pathname suspends on routes with a param missing from `generateStaticParams`. The switcher is part of the header,
 * so without a boundary here such a route would lose its whole shell. The shell links to the home page of each locale
 * instead, until the pathname is known.
 */
export function LocaleSwitcher(props: Readonly<LocaleSwitcherProps>): ReactNode {
	return (
		<Suspense fallback={<LocaleLinks {...props} getLink={getLocaleHomeLink} />}>
			<CurrentPageLocaleLinks {...props} />
		</Suspense>
	);
}
