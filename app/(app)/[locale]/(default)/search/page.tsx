import { getExtracted } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import { type ReactNode, Suspense } from "react";

import { WebsiteSearch } from "#/app/(app)/[locale]/(default)/search/_components/website-search.tsx";
import { Main } from "#/app/(app)/[locale]/_components/main.tsx";
import { isValidLocale } from "#/lib/i18n/locales.ts";

export default async function SearchPage(): Promise<ReactNode> {
	const t = await getExtracted();
	const currentLocale = await locale();
	if (!isValidLocale(currentLocale)) {
		notFound();
	}

	return (
		<Main className="flex flex-col gap-y-12 bg-primary-100">
			<div className="bg-primary-1000 px-28 py-4">
				<h1 className="flex relative items-end text-h2 text-white">{t("Suche")}</h1>
			</div>
			<div className="container  max-w-7xl">
				<Suspense>
					<WebsiteSearch locale={currentLocale} />
				</Suspense>
			</div>
		</Main>
	);
}
