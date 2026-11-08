import type { Metadata } from "next";
import { getExtracted, getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import { type ReactNode, Suspense } from "react";

import { SearchFallback } from "#/app/(app)/[locale]/(default)/_components/search-form.tsx";
import { ResourcesSearch } from "#/app/(app)/[locale]/(default)/resources/_components/resources-search.tsx";
import { PageContent } from "#/app/(app)/[locale]/_components/page-content.tsx";
import { PageLayout } from "#/app/(app)/[locale]/_components/page-layout.tsx";
import { ContentBlocks } from "#/components/content-blocks.tsx";
import { cachedPage } from "#/lib/data/api-cache.ts";
import { isValidLocale } from "#/lib/i18n/locales.ts";
import { createMetadata } from "#/lib/metadata.ts";

/** The whole page is static, for initial loads and navigations alike: the build fails if that changes. */
export const ensureStatic = "navigation";

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
				<div className="flex flex-col gap-y-8">
					<div className="max-w-prose">{page?.content && <ContentBlocks blocks={page.content} />}</div>
					<Suspense fallback={<SearchFallback label={t("Ressourcen durchsuchen")} />}>
						<ResourcesSearchSection />
					</Suspense>
				</div>
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
