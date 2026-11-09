import type { Metadata } from "next";
import { getExtracted } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import { type ReactNode, Suspense } from "react";

import { SearchFallback } from "#/app/(app)/[locale]/(default)/_components/search-form.tsx";
import { NewsSearch } from "#/app/(app)/[locale]/(default)/news/_components/news-search.tsx";
import { PageContent } from "#/app/(app)/[locale]/_components/page-content.tsx";
import { PageLayout } from "#/app/(app)/[locale]/_components/page-layout.tsx";
import { SearchPreconnect } from "#/components/preconnect.tsx";
import { isValidLocale } from "#/lib/i18n/locales.ts";
import { createMetadata } from "#/lib/metadata.ts";

/** The whole page is static, for initial loads and navigations alike: the build fails if that changes. */
export const ensureStatic = "navigation";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getExtracted();

	return createMetadata({ pathname: "/news", title: t("News") });
}

// No props needed: the locale comes from `i18n/request.ts`, which reads it via
// `next/root-params`. No `params`, no `setRequestLocale`.
export default async function NewsPage(): Promise<ReactNode> {
	const t = await getExtracted();
	const currentLocale = await locale();
	if (!isValidLocale(currentLocale)) {
		notFound();
	}

	return (
		<PageLayout title={t("News")}>
			<PageContent>
				<SearchPreconnect />
				<Suspense fallback={<SearchFallback label={t("Aktuelles durchsuchen")} />}>
					<NewsSearchSection />
				</Suspense>
			</PageContent>
		</PageLayout>
	);
}

async function NewsSearchSection(): Promise<ReactNode> {
	const currentLocale = await locale();
	if (!isValidLocale(currentLocale)) {
		notFound();
	}
	return <NewsSearch locale={currentLocale} />;
}
