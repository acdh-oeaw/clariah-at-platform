import type { Metadata, ResolvingMetadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { Card } from "@/components/card";
import { MainContent } from "@/components/main-content";
import type { Locale } from "@/config/i18n.config";
import { createCollectionResource, createSingletonResource } from "@/lib/keystatic/resources";

interface EventsOverviewPageProps {
	params: {
		locale: Locale;
	};
}

export async function generateMetadata(
	props: Readonly<EventsOverviewPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = params;

	const eventsOverview = await createSingletonResource("events-overview", locale).read();

	const metadata: Metadata = {
		title: eventsOverview.data.title,
	};

	return metadata;
}

export default async function EventsOverviewPage(
	props: Readonly<EventsOverviewPageProps>,
): Promise<ReactNode> {
	const { params } = props;

	const { locale } = params;

	setRequestLocale(locale);

	const eventsOverview = await createSingletonResource("events-overview", locale).read();
	const events = await createCollectionResource("events", locale).all();

	return (
		<MainContent className="layout-grid content-start">
			<section className="layout-subgrid relative gap-y-12 py-16 xs:py-24">
				<header>
					<h1 className="text-balance font-heading text-heading-1 font-strong text-text-strong">
						{eventsOverview.data.title}
					</h1>
					<p className="mt-6 font-heading text-heading-4 text-text-weak">
						{eventsOverview.data.lead}
					</p>
				</header>
				<ul
					className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))] gap-8"
					role="list"
				>
					{events.map(async (event) => {
						const id = event.id;
						const eventItem = await createCollectionResource("events", locale).read(id);
						const link = { label: "", href: `/events/${id}` };
						return (
							<li key={id}>
								<Card
									className="grid h-full grid-rows-[13rem,auto]"
									{...eventItem.data}
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
