import type { Metadata } from "next";
import { getExtracted, getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import { type ReactNode, Suspense } from "react";

import { ResourcesSearch } from "#/app/(app)/[locale]/(default)/resources/_components/resources-search";
import { DetailFallback } from "#/app/(app)/[locale]/_components/detail-fallback";
import { PageContent } from "#/app/(app)/[locale]/_components/page-content";
import { PageLayout } from "#/app/(app)/[locale]/_components/page-layout";
import { ContentBlocks } from "#/components/content-blocks";
import { cachedPage } from "#/lib/data/api-cache";
import { isValidLocale } from "#/lib/i18n/locales";
import { createMetadata } from "#/lib/metadata.ts";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getExtracted();
	const page = await cachedPage("resources", await getLocale());

	return createMetadata({
		pathname: "/resources",
		title: t("Ressourcen"),
		description: page?.summary,
		image: page?.image,
	});
}

export default async function ResourcesPage(): Promise<ReactNode> {
	const t = await getExtracted();
	const currentLocale = await locale();
	if (!isValidLocale(currentLocale)) {
		notFound();
	}
	const page = await cachedPage("resources", currentLocale);

	return (
		<PageLayout title={t("Ressourcen")}>
			<PageContent>
				<Suspense fallback={<DetailFallback />}>
					<div className="flex flex-col gap-y-8">
						<div className="max-w-prose">{page?.content && <ContentBlocks blocks={page.content} />}</div>
						<ResourcesSearchSection />
					</div>
				</Suspense>
			</PageContent>
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
