import type { Metadata, ResolvingMetadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { Card } from "@/components/card";
import { MainContent } from "@/components/main-content";
import type { Locale } from "@/config/i18n.config";
import { createCollectionResource, createSingletonResource } from "@/lib/keystatic/resources";

interface ProjectOverviewPageProps {
	params: {
		locale: Locale;
	};
}

export async function generateMetadata(
	props: Readonly<ProjectOverviewPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = params;

	const projectsOverview = await createSingletonResource("projects-overview", locale).read();

	const metadata: Metadata = {
		title: projectsOverview.data.title,
	};

	return metadata;
}

export default async function ProjectPage(
	props: Readonly<ProjectOverviewPageProps>,
): Promise<ReactNode> {
	const { params } = props;

	const { locale } = params;

	setRequestLocale(locale);

	const projectsOverview = await createSingletonResource("projects-overview", locale).read();
	const projects = await createCollectionResource("projects", locale).all();

	return (
		<MainContent className="layout-grid content-start">
			<section className="layout-subgrid relative gap-y-12 py-16 xs:py-24">
				<header>
					<h1 className="text-balance font-heading text-heading-1 font-strong text-text-strong">
						{projectsOverview.data.title}
					</h1>
					<p className="mt-6 font-heading text-heading-4 text-text-weak">
						{projectsOverview.data.lead}
					</p>
				</header>
				<ul
					className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))] gap-8"
					role="list"
				>
					{projects.map(async (project) => {
						const id = project.id;
						const projectItem = await createCollectionResource("projects", locale).read(id);
						const link = { label: "", href: `/projects/${id}` };
						return (
							<li key={id}>
								<Card
									className="grid h-full grid-rows-[13rem,auto] overflow-hidden rounded-4 border border-stroke-weak bg-background-raised shadow-raised"
									{...projectItem.data}
									id={id}
									link={link}
								></Card>
							</li>
						);
					})}
				</ul>
			</section>
		</MainContent>
	);
}
