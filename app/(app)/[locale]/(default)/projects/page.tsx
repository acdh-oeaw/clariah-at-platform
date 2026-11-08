import type { Metadata } from "next";
import { getExtracted, getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import { type ReactNode, Suspense } from "react";

import { SearchFallback } from "#/app/(app)/[locale]/(default)/_components/search-form";
import { ProjectsSearch } from "#/app/(app)/[locale]/(default)/projects/_components/projects-search.tsx";
import { PageContent } from "#/app/(app)/[locale]/_components/page-content";
import { PageLayout } from "#/app/(app)/[locale]/_components/page-layout";
import { ContentBlocks } from "#/components/content-blocks";
import { cachedPage } from "#/lib/data/api-cache";
import { type IntlLocale, isValidLocale } from "#/lib/i18n/locales";
import { createMetadata } from "#/lib/metadata.ts";

function getIntroPageSlug(locale: IntlLocale): string {
	return locale === "de-AT" ? "projekte" : "projects";
}

/** The whole page is static, for initial loads and navigations alike: the build fails if that changes. */
export const ensureStatic = "navigation";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getExtracted();
	const currentLocale = await getLocale();
	const page = await cachedPage(getIntroPageSlug(currentLocale), currentLocale);

	return createMetadata({
		pathname: "/projects",
		title: t("Projekte"),
		description: page?.summary,
		image: page?.image,
	});
}

export default async function ProjectPage(): Promise<ReactNode> {
	const t = await getExtracted();
	const currentLocale = await locale();
	if (!isValidLocale(currentLocale)) {
		notFound();
	}
	const page = await cachedPage(getIntroPageSlug(currentLocale), currentLocale);

	return (
		<PageLayout title={t("Projekte")}>
			<PageContent>
				<div className="flex flex-col gap-y-8">
					<div className="max-w-prose">{page?.content && <ContentBlocks blocks={page.content} />}</div>
					<Suspense fallback={<SearchFallback label={t("Projekte filtern")} />}>
						<ProjectsSearch locale={currentLocale} />
					</Suspense>
				</div>
			</PageContent>
		</PageLayout>
	);
}
