import { ArrowRightIcon } from "lucide-react";
import { getExtracted } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import type { ReactNode } from "react";

import { Card } from "#/components/card";
import { LinkButton } from "#/components/ui/button";
import { cachedFeaturedEntities } from "#/lib/data/api-cache";
import type { EntityType } from "#/lib/data/api-client.ts";
import { isValidLocale } from "#/lib/i18n/locales.ts";
import { localizeHref } from "#/lib/navigation/convert.ts";

interface FeaturedSectionProps {
	title: string;
	entityType: Extract<EntityType, "events" | "news" | "projects">;
}

export async function FeaturedSection(props: FeaturedSectionProps): Promise<ReactNode> {
	const { entityType, title } = props;
	const t = await getExtracted();
	const currentLocale = await locale();
	if (!isValidLocale(currentLocale)) {
		notFound();
	}
	const featuredEntities = await cachedFeaturedEntities(currentLocale);
	let items;

	switch (entityType) {
		case "events": {
			items = featuredEntities.data.events;
			break;
		}
		case "news": {
			items = featuredEntities.data.news;
			break;
		}
		case "projects": {
			items = featuredEntities.data.projects;
			break;
		}
	}

	return (
		<section>
			<h2 className="flex relative items-end text-h2 font-light">{title}</h2>
			<div className="mb-2 h-0.5 bg-primary-1000 flex-1"></div>
			<ul className="mt-12 grid grid-cols-[repeat(auto-fill,minmax(min(100%,20rem),1fr))] gap-8" role="list">
				{items.map((item) => {
					const title = item.type === "projects" ? item.name : item.title;
					const link = localizeHref(`/${item.type}/${item.entity.slug}`, currentLocale);
					return (
						<li key={item.id}>
							<Card image={item.image} summary={item.summary} title={title} link={link} />
						</li>
					);
				})}
			</ul>
			<div className="mt-8 flex justify-end">
				<LinkButton endIcon={<ArrowRightIcon />} href={localizeHref(`/${entityType}`, currentLocale)} variant="outline">
					{t("Alle Artikel anzeigen")}
				</LinkButton>
			</div>
		</section>
	);
}
