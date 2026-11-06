import type { Metadata } from "next";
import { getExtracted } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import { type ReactNode, Suspense } from "react";

import { NewsSearch } from "#/app/(app)/[locale]/(default)/news/_components/news-search";
import { DetailFallback } from "#/app/(app)/[locale]/_components/detail-fallback";
import { PageContent } from "#/app/(app)/[locale]/_components/page-content";
import { PageLayout } from "#/app/(app)/[locale]/_components/page-layout";
import { isValidLocale } from "#/lib/i18n/locales";
import { createMetadata } from "#/lib/metadata.ts";

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
				<Suspense fallback={<DetailFallback />}>
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
