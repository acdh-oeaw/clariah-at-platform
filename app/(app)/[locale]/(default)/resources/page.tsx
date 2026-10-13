import { getExtracted } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import { type ReactNode, Suspense } from "react";

import { ResourcesSearch } from "#/app/(app)/[locale]/(default)/resources/_components/resources-search";
import { Main } from "#/app/(app)/[locale]/_components/main.tsx";
import { ContentBlocks } from "#/components/content-blocks";
import { cachedPage } from "#/lib/data/api-cache";
import { isValidLocale } from "#/lib/i18n/locales";

export default async function ResourcesPage(): Promise<ReactNode> {
	const t = await getExtracted();
	const currentLocale = await locale();
	if (!isValidLocale(currentLocale)) {
		notFound();
	}
	const page = await cachedPage("resources", currentLocale);

	return (
		<Main className="flex flex-col gap-y-12 bg-primary-100">
			<div className="bg-primary-1000 px-28 py-4">
				<h1 className="flex relative items-end text-h2 text-white">{t("Ressourcen")}</h1>
			</div>
			<div className="container max-w-7xl p-12">
				<Suspense>
					<div className="flex flex-col gap-y-8">
						<div className="max-w-prose">{page?.content && <ContentBlocks fields={page.content} />}</div>
						<ResourcesSearch />
					</div>
				</Suspense>
			</div>
		</Main>
	);
}
