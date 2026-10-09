import type { Metadata } from "next";
import { getExtracted } from "next-intl/server";
import { notFound } from "next/navigation";
import { type ReactNode, Suspense } from "react";

import { Project } from "#/app/(app)/[locale]/(default)/projects/_components/project";
import { Main } from "#/app/(app)/[locale]/_components/main";
import { cachedProject, staticSlugs } from "#/lib/data/api-cache";
import { isValidLocale } from "#/lib/i18n/locales";
import { localizeHref } from "#/lib/navigation/convert";

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

	const languages: Record<string, string> = {};

	for (const translation of item.translations) {
		if (!isValidLocale(translation.locale)) {
			continue;
		}

		languages[translation.locale] = localizeHref(`/projects/${translation.slug}`, translation.locale);
	}

	return { alternates: { languages } };
}

export default async function ProjectPage(props: Readonly<ProjectPageProps>): Promise<ReactNode> {
	const t = await getExtracted();
	return (
		<Main className="flex flex-col gap-y-12 bg-primary-100">
			<div className="bg-primary-1000 px-28 py-4">
				<p className="flex relative items-end text-h2 text-white">{t("Projekte")}</p>
			</div>
			<Suspense fallback={<p>Loading</p>}>
				<ProjectDetails params={props.params} />
			</Suspense>
		</Main>
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
