import { getExtracted } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import { type ReactNode, Suspense } from "react";

import { EventsSearch } from "#/app/(app)/[locale]/(default)/events/_components/events-search.tsx";
import { PageLayout } from "#/app/(app)/[locale]/_components/page-layout";
import { isValidLocale } from "#/lib/i18n/locales";

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
			<div className="md:py-16 px-4 py-8 container max-w-7xl">
				<Suspense>
					<EventsSearchSection />
				</Suspense>
			</div>
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
