import type { Metadata } from "next";
import { getExtracted, getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import { type ReactNode, Suspense } from "react";

import { ProjectsSearch } from "#/app/(app)/[locale]/(default)/projects/_components/projects-search.tsx";
import { searchParams } from "#/app/(app)/[locale]/(default)/projects/search-params.ts";
import { DetailFallback } from "#/app/(app)/[locale]/_components/detail-fallback";
import { PageContent } from "#/app/(app)/[locale]/_components/page-content";
import { PageLayout } from "#/app/(app)/[locale]/_components/page-layout";
import { ContentBlocks } from "#/components/content-blocks";
import { cachedPage } from "#/lib/data/api-cache";
import { type IntlLocale, isValidLocale } from "#/lib/i18n/locales";
import { createMetadata } from "#/lib/metadata.ts";

interface ProjectPageProps extends PageProps<"/[locale]/projects"> {}

function getIntroPageSlug(locale: IntlLocale): string {
	return locale === "de-AT" ? "projekte" : "projects";
}

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

export default async function ProjectPage(props: Readonly<ProjectPageProps>): Promise<ReactNode> {
	const t = await getExtracted();
	const currentLocale = await locale();
	if (!isValidLocale(currentLocale)) {
		notFound();
	}
	const page = await cachedPage(getIntroPageSlug(currentLocale), currentLocale);

	return (
		<PageLayout title={t("Projekte")}>
			<PageContent>
				<Suspense fallback={<DetailFallback />}>
					<div className="flex flex-col gap-y-8">
						<div className="max-w-prose">{page?.content && <ContentBlocks blocks={page.content} />}</div>
						<ProjectsSearchSection searchParams={props.searchParams} />
					</div>
				</Suspense>
			</PageContent>
		</PageLayout>
	);
}

/**
 * `notFound()` for an invalid locale (or a malformed `q`/`project_call`/`page`) has to run from a component rendered
 * under `<Suspense>`, not from the page itself — calling it before any `<Suspense>` boundary trips next's "instant
 * navigation" validation pass. `ProjectsSearch` re-derives `query`/`projectCall`/`page` itself from
 * `useSearchParams()`, so this only needs to validate, not thread the parsed values down as props.
 */
async function ProjectsSearchSection(props: Pick<ProjectPageProps, "searchParams">): Promise<ReactNode> {
	const currentLocale = await locale();
	if (!isValidLocale(currentLocale)) {
		notFound();
	}

	const query = searchParams.safeParse(await props.searchParams);
	if (!query.success) {
		notFound();
	}

	return <ProjectsSearch locale={currentLocale} />;
}
