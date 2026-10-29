import { getExtracted } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import { type ReactNode, Suspense } from "react";

import { ResourcesSearch } from "#/app/(app)/[locale]/(default)/resources/_components/resources-search";
import { PageLayout } from "#/app/(app)/[locale]/_components/page-layout";
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
		<PageLayout title={t("Ressourcen")}>
			<div className="container max-w-7xl p-12">
				<Suspense>
					<div className="flex flex-col gap-y-8">
						<div className="max-w-prose">{page?.content && <ContentBlocks blocks={page.content} />}</div>
						<ResourcesSearchSection />
					</div>
				</Suspense>
			</div>
		</PageLayout>
	);
}

async function ResourcesSearchSection(): Promise<ReactNode> {
	const currentLocale = await locale();
	if (!isValidLocale(currentLocale)) {
		notFound();
	}
	return <ResourcesSearch />;
}
