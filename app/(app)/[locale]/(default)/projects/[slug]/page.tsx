import type { Metadata } from "next";
import { getExtracted } from "next-intl/server";
import { notFound } from "next/navigation";
import { type ReactNode, Suspense } from "react";

import { Project } from "#/app/(app)/[locale]/(default)/projects/_components/project";
import { DetailFallback } from "#/app/(app)/[locale]/_components/detail-fallback";
import { PageLayout } from "#/app/(app)/[locale]/_components/page-layout";
import { cachedProject, staticSlugs } from "#/lib/data/api-cache";
import { createMetadata, getLanguageAlternates } from "#/lib/metadata.ts";

interface ProjectPageProps extends PageProps<"/[locale]/projects/[slug]"> {}

export function generateStaticParams({ params }: { params: { locale: string } }): Promise<Array<{ slug: string }>> {
	return staticSlugs.projects(params.locale);
}

export async function generateMetadata(props: Readonly<ProjectPageProps>): Promise<Metadata> {
	const { locale, slug } = await props.params;
	const item = await cachedProject(slug, locale);

	if (item == null) {
		return {};
	}

	return createMetadata({
		pathname: `/projects/${slug}`,
		title: item.name,
		description: item.summary,
		image: item.image,
		languages: getLanguageAlternates("/projects", item.translations),
	});
}

export default async function ProjectPage(props: Readonly<ProjectPageProps>): Promise<ReactNode> {
	const t = await getExtracted();
	return (
		<PageLayout title={t("Projekte")} titleElement="p">
			<Suspense fallback={<DetailFallback />}>
				<ProjectDetails params={props.params} />
			</Suspense>
		</PageLayout>
	);
}

async function ProjectDetails({ params }: { params: ProjectPageProps["params"] }): Promise<ReactNode> {
	const { locale, slug } = await params;
	const item = await cachedProject(slug, locale);
	if (item == null) {
		notFound();
	}
	return <Project {...item} />;
}
