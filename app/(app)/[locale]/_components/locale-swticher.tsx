"use client";

import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { type LinkProps, linkStyles } from "#/components/link.tsx";
import { type IntlLocale, getIntlLanguage, locales } from "#/lib/i18n/locales.ts";
import { stripLocalePrefix } from "#/lib/i18n/pathname.ts";
import { localePrefix } from "#/lib/i18n/routing.ts";

/** Language names are shown in their own language, so they are not translated. */
const languageNames = {
	"de-AT": "Deutsch",
	"en-GB": "English",
} as const satisfies Record<IntlLocale, string>;

/** Swap the locale prefix of `pathname`, keeping the rest of the path. */
function getLocalizedPathname(pathname: string, current: IntlLocale, target: IntlLocale): string {
	const targetPrefix = localePrefix.prefixes[target];
	const suffix = stripLocalePrefix(pathname, current);

	if (suffix != null) {
		return suffix === "" ? targetPrefix : `${targetPrefix}${suffix}`;
	}

	return pathname === "/" ? targetPrefix : `${targetPrefix}${pathname}`;
}

interface LocaleSwitcherProps {
	/** Accessible name of the group, e.g. "Language". */
	label: string;
	variant?: LinkProps["variant"];
}

export function LocaleSwitcher(props: Readonly<LocaleSwitcherProps>): ReactNode {
	const { label, variant = "primary" } = props;

	const currentLocale = useLocale();
	const pathname = usePathname();

	return (
		<div aria-label={label} className="flex items-center gap-x-3" role="group">
			{locales.map((locale) => {
				const isCurrent = locale === currentLocale;
				const language = getIntlLanguage(locale);

				/**
				 * A plain anchor on purpose: switching locale must be a full page load. The document's `<html lang>`, the
				 * react-aria localized strings (a server-rendered `<script>` in `providers.tsx`) and the messages are all set
				 * up once per document, and a client-side navigation would re-render that script on the client.
				 */
				return (
					<a
						key={locale}
						aria-current={isCurrent ? "true" : undefined}
						aria-label={languageNames[locale]}
						className={linkStyles({
							/**
							 * `font-bold` is constant, not conditional on `isCurrent`: bold and regular glyphs render at different
							 * widths, so toggling it shifted the whole switcher's width — and everything after it in the header's
							 * flex row — on every locale switch. `underline` alone marks the current locale without that.
							 */
							className: isCurrent ? "font-bold underline underline-offset-[24%]" : "font-bold",
							variant,
						})}
						href={getLocalizedPathname(pathname, currentLocale, locale)}
						hrefLang={language}
					>
						<span lang={language}>{language.toUpperCase()}</span>
					</a>
				);
			})}
		</div>
	);
}
