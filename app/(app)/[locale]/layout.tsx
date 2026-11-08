import "#/styles/index.css";

import { createUrl } from "@acdh-oeaw/lib";
import type { Metadata } from "next";
import { useLocale } from "next-intl";
import { getLocale } from "next-intl/server";
import { type ReactNode, Suspense } from "react";

import { Providers } from "#/app/(app)/[locale]/_components/providers.tsx";
import { HistoryScrollAnchoringFix } from "#/app/(app)/_components/history-scroll-anchoring-fix.tsx";
import { HtmlDocument } from "#/app/(app)/_components/html-document.tsx";
import { MatomoAnalytics } from "#/app/(app)/_components/matomo-analytics.tsx";
import { ReloadOnBfcacheRestore } from "#/app/(app)/_components/reload-on-bfcache-restore.tsx";
import { AlternateLinks } from "#/components/alternate-links.tsx";
import { env } from "#/configs/env.config.ts";
import { cachedSiteMetadata } from "#/lib/data/api-cache.ts";
import { routing } from "#/lib/i18n/routing.ts";
import { createOpenGraph } from "#/lib/metadata.ts";

export { viewport } from "#/app/(app)/_lib/viewport.config.ts";

interface LocaleLayoutProps extends LayoutProps<"/[locale]"> {}

export function generateStaticParams(): Array<Awaited<LocaleLayoutProps["params"]>> {
	return routing.locales.map((locale) => {
		return { locale };
	});
}

export async function generateMetadata(): Promise<Metadata> {
	const locale = await getLocale();

	const [site, openGraph] = await Promise.all([cachedSiteMetadata(locale), createOpenGraph()]);

	return {
		metadataBase: createUrl({ baseUrl: env.NEXT_PUBLIC_APP_BASE_URL }),
		title: { default: site.title, template: `%s | ${site.title}` },
		description: site.description.trim(),
		/** No `title`, `description` or `url`, so each page's own fill them in. */
		openGraph,
		/** Title, description and image are carried over from `openGraph`. */
		twitter: { card: "summary_large_image" },
		...(env.NEXT_PUBLIC_APP_GOOGLE_SITE_VERIFICATION != null
			? { verification: { google: env.NEXT_PUBLIC_APP_GOOGLE_SITE_VERIFICATION } }
			: {}),
	};
}

export default function LocaleLayout(props: Readonly<LocaleLayoutProps>): ReactNode {
	const { children } = props;

	const locale = useLocale();

	return (
		<HtmlDocument locale={locale}>
			<body>
				<Providers>
					<Suspense>
						<AlternateLinks />
					</Suspense>
					{children}
				</Providers>
				<HistoryScrollAnchoringFix />
				<ReloadOnBfcacheRestore />
				{env.NEXT_PUBLIC_APP_MATOMO_ID != null && env.NEXT_PUBLIC_APP_MATOMO_BASE_URL != null ? (
					<MatomoAnalytics baseUrl={env.NEXT_PUBLIC_APP_MATOMO_BASE_URL} id={env.NEXT_PUBLIC_APP_MATOMO_ID} />
				) : null}
			</body>
		</HtmlDocument>
	);
}
