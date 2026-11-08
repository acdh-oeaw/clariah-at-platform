import type { Metadata } from "next";
import { getExtracted } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import { type ReactNode, Suspense } from "react";

import { SearchFallback } from "#/app/(app)/[locale]/(default)/_components/search-form.tsx";
import { WebsiteSearch } from "#/app/(app)/[locale]/(default)/search/_components/website-search.tsx";
import { PageContent } from "#/app/(app)/[locale]/_components/page-content.tsx";
import { PageLayout } from "#/app/(app)/[locale]/_components/page-layout.tsx";
import { isValidLocale } from "#/lib/i18n/locales.ts";
import { createMetadata } from "#/lib/metadata.ts";

/** The whole page is static, for initial loads and navigations alike: the build fails if that changes. */
export const ensureStatic = "navigation";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getExtracted();

	return createMetadata({ pathname: "/search", title: t("Suche"), noindex: true });
}

export default async function SearchPage(): Promise<ReactNode> {
	const t = await getExtracted();
	const currentLocale = await locale();
	if (!isValidLocale(currentLocale)) {
		notFound();
	}

	return (
		<PageLayout title={t("Suche")}>
			<PageContent>
				<Suspense fallback={<SearchFallback label={t("Website durchsuchen")} />}>
					<WebsiteSearch locale={currentLocale} />
				</Suspense>
			</PageContent>
		</PageLayout>
	);
}
