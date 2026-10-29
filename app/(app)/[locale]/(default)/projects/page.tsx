import { getExtracted } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import { type ReactNode, Suspense } from "react";

import { ProjectsSearch } from "#/app/(app)/[locale]/(default)/projects/_components/projects-search.tsx";
import { searchParams } from "#/app/(app)/[locale]/(default)/projects/search-params.ts";
import { PageLayout } from "#/app/(app)/[locale]/_components/page-layout";
import { isValidLocale } from "#/lib/i18n/locales";

interface ProjectPageProps extends PageProps<"/[locale]/projects"> {}

export default async function ProjectPage(props: Readonly<ProjectPageProps>): Promise<ReactNode> {
	const t = await getExtracted();

	return (
		<PageLayout title={t("Projekte")}>
			<div className="md:py-16 px-4 py-8 container max-w-7xl">
				<Suspense>
					<ProjectsSearchSection searchParams={props.searchParams} />
				</Suspense>
			</div>
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
