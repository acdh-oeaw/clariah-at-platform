import { getExtracted } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import { type ReactNode, Suspense } from "react";

import { ProjectsSearch } from "#/app/(app)/[locale]/(default)/projects/_components/projects-search.tsx";
import { searchParams } from "#/app/(app)/[locale]/(default)/projects/search-params.ts";
import { Main } from "#/components/main";
import { isValidLocale } from "#/lib/i18n/locales";

interface ProjectPageProps extends PageProps<"/[locale]/projects"> {}

export default async function ProjectPage(props: Readonly<ProjectPageProps>): Promise<ReactNode> {
	const t = await getExtracted();

	return (
		<Main className="flex flex-col gap-y-12 bg-primary-100">
			<div className="bg-primary-1000 px-28 py-4">
				<div>
					<h1 className="flex relative items-end text-h2 text-white">{t("Projekte")}</h1>
				</div>
			</div>
			<div className="md:py-16 px-4 py-8 container max-w-7xl">
				<Suspense>
					<ProjectsSearchSection searchParams={props.searchParams} />
				</Suspense>
			</div>
		</Main>
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
