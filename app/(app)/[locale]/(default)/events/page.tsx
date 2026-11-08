import type { Metadata } from "next";
import { getExtracted } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import { type ReactNode, Suspense } from "react";

import { SearchFallback } from "#/app/(app)/[locale]/(default)/_components/search-form";
import { EventsSearch } from "#/app/(app)/[locale]/(default)/events/_components/events-search.tsx";
import { PageContent } from "#/app/(app)/[locale]/_components/page-content";
import { PageLayout } from "#/app/(app)/[locale]/_components/page-layout";
import { isValidLocale } from "#/lib/i18n/locales";
import { createMetadata } from "#/lib/metadata.ts";

/** The whole page is static, for initial loads and navigations alike: the build fails if that changes. */
export const ensureStatic = "navigation";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getExtracted();

	return createMetadata({ pathname: "/events", title: t("Events") });
}

// No props needed: the locale comes from `i18n/request.ts`, which reads it via
// `next/root-params`. No `params`, no `setRequestLocale`.
export default async function EventsPage(): Promise<ReactNode> {
	const t = await getExtracted();
	const currentLocale = await locale();
	if (!isValidLocale(currentLocale)) {
		notFound();
	}

	return (
		<PageLayout title={t("Events")}>
			<PageContent>
				<Suspense fallback={<SearchFallback label={t("Events filtern")} />}>
					<EventsSearchSection />
				</Suspense>
			</PageContent>
		</PageLayout>
	);
}

async function EventsSearchSection(): Promise<ReactNode> {
	const currentLocale = await locale();
	if (!isValidLocale(currentLocale)) {
		notFound();
	}
	return <EventsSearch locale={currentLocale} />;
}
