import { getExtracted } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import { type ReactNode, Suspense } from "react";

import { EventsSearch } from "#/app/(app)/[locale]/(default)/events/_components/events-search.tsx";
import { Main } from "#/components/main";
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
		<Main className="flex flex-col gap-y-12 bg-primary-100">
			<div className="bg-primary-1000 px-28 py-4">
				<h1 className="flex relative items-end text-h2 text-white">{t("Events")}</h1>
			</div>
			<div className="container max-w-6xl p-12">
				<Suspense>
					<EventsSearch locale={currentLocale} />
				</Suspense>
			</div>
		</Main>
	);
}
