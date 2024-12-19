import type { Metadata, ResolvingMetadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { MainContent } from "@/components/main-content";
import { env } from "@/config/env.config";
import type { Locale } from "@/config/i18n.config";
import { createCollectionResource } from "@/lib/keystatic/resources";

interface ProjectPageProps {
	params: {
		id: string;
		locale: Locale;
	};
}

export const dynamicParams = false;

export async function generateStaticParams(props: {
	params: Pick<ProjectPageProps["params"], "locale">;
}): Promise<Awaited<Array<Pick<ProjectPageProps["params"], "id">>>> {
	const { params } = props;

	const { locale } = params;

	const ids = await createCollectionResource("projects", locale).list();

	return ids.map((id) => {
		/** @see https://github.com/vercel/next.js/issues/63002 */
		return { id: env.NODE_ENV === "production" ? id : encodeURIComponent(id) };
	});
}

export async function generateMetadata(
	props: Readonly<ProjectPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = params;
	const id = decodeURIComponent(params.id);

	const project = await createCollectionResource("projects", locale).read(id);

	const metadata: Metadata = {
		title: project.data.title,
	};

	return metadata;
}

export default async function ProjectPage(props: Readonly<ProjectPageProps>): Promise<ReactNode> {
	const { params } = props;

	const { locale } = params;
	const id = decodeURIComponent(params.id);

	setRequestLocale(locale);

	const project = await createCollectionResource("projects", locale).read(id);
	const { default: Content } = await project.compile(project.data.content);

	return (
		<MainContent className="layout-grid content-start">
			<section className="layout-subgrid relative bg-fill-weaker py-16 xs:py-24">
				<h1>{project.data.title}</h1>
				<Content />
			</section>
		</MainContent>
	);
}
