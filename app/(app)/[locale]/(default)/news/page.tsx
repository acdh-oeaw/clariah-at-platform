import { getExtracted } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import { type ReactNode, Suspense } from "react";

import { NewsSearch } from "#/app/(app)/[locale]/(default)/news/_components/news-search";
import { Main } from "#/components/main";
import { isValidLocale } from "#/lib/i18n/locales";

// No props needed: the locale comes from `i18n/request.ts`, which reads it via
// `next/root-params`. No `params`, no `setRequestLocale`.
export default async function NewsPage(): Promise<ReactNode> {
	const t = await getExtracted();
	const currentLocale = await locale();
	if (!isValidLocale(currentLocale)) {
		notFound();
	}

	return (
		<Main className="flex flex-col gap-y-12 bg-primary-100">
			<div className="bg-primary-1000 px-28 py-4">
				<h1 className="flex relative items-end text-h2 text-white">{t("Aktuelles")}</h1>
			</div>
			<div className="container  max-w-7xl">
				<Suspense>
					<NewsSearch locale={currentLocale} />
				</Suspense>
			</div>
		</Main>
	);
}
