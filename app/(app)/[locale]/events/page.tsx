import { cn } from "@acdh-oeaw/style-variants";
import type { Metadata, ResolvingMetadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { Image } from "@/components/image";
import { Link } from "@/components/link";
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
						const { image, summary, title } = eventItem.data;
						return (
							<li key={id}>
								<article className="grid h-full grid-rows-[13rem,auto] overflow-hidden rounded-4 border border-stroke-weak bg-background-raised shadow-raised">
									<Image
										alt=""
										className="size-full border-b border-stroke-weak object-cover"
										height={300}
										/** Preload image because it's the largest contentful paint (lcp) element. */
										priority={true}
										src={image}
										unoptimized={true}
										width={400}
									/>
									<div className="grid gap-y-6 p-8">
										<div className="flex flex-col">
											<h3 className="font-heading text-heading-4 font-strong text-text-strong">
												{title}
											</h3>
											<p className="grow text-small text-text-weak">{summary}</p>
											<footer>
												<Link
													className={cn(
														"my-4 inline-flex min-h-12 w-fit rounded-2 border border-stroke-strong bg-fill-strong px-4 py-2.5 font-strong text-text-inverse-strong",
														"interactive focus-visible:focus-outline hover:hover-overlay pressed:press-overlay",
													)}
													href={`events/${event.id}`}
												>
													Mehr Info
												</Link>
											</footer>
										</div>
									</div>
								</article>
							</li>
						);
					})}
				</ul>
			</section>
		</MainContent>
	);
}
