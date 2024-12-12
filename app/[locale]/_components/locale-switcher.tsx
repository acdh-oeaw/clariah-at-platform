import { useLocale, useTranslations } from "next-intl";
import { Fragment, type ReactNode, Suspense, useMemo } from "react";

import {
	LocaleSwitcherLink,
	LocaleSwitcherLinkFallback,
} from "@/app/[locale]/_components/locale-switcher-link";
import { type Locale, locales } from "@/config/i18n.config";

export function LocaleSwitcher(): ReactNode {
	const currentLocale = useLocale();
	const t = useTranslations("LocaleSwitcher");

	const items = useMemo(() => {
		const displayNames = new Intl.DisplayNames([currentLocale], { type: "language" });

		return Object.fromEntries(
			locales.map((locale) => {
				return [locale, displayNames.of(locale)];
			}),
		) as Record<Locale, string>;
	}, [currentLocale]);

	return (
		<div className="flex items-center gap-x-2 text-tiny">
			{locales.map((locale, index) => {
				const label = items[locale];

				const separator = index !== 0 ? <span className="cursor-default">|</span> : null;

				if (locale === currentLocale) {
					return (
						<Fragment key={locale}>
							{separator}

							<span className="sr-only">{t("current-locale", { locale: label })}</span>
							<span aria-hidden={true} className="cursor-default font-strong">
								{locale.toUpperCase()}
							</span>
						</Fragment>
					);
				}

				const children = (
					<Fragment>
						<span className="sr-only">{t("switch-locale-to", { locale: label })}</span>
						<span aria-hidden={true}>{locale.toUpperCase()}</span>
					</Fragment>
				);

				/**
				 * Suspense boundary is necessary to avoid client-side deoptimisation caused by `useSearchParams`.
				 *
				 * @see https://nextjs.org/docs/messages/deopted-into-client-rendering
				 */
				return (
					<Fragment key={locale}>
						{separator}

						<Suspense
							fallback={
								<LocaleSwitcherLinkFallback locale={locale}>{children}</LocaleSwitcherLinkFallback>
							}
						>
							<LocaleSwitcherLink locale={locale}>{children}</LocaleSwitcherLink>
						</Suspense>
					</Fragment>
				);
			})}
		</div>
	);
}
