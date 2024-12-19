import { cn } from "@acdh-oeaw/style-variants";
import type { Entry } from "@keystatic/core/reader";
import { ArrowRightIcon } from "lucide-react";
import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { Image } from "@/components/image";
import { Link } from "@/components/link";
import { MainContent } from "@/components/main-content";
import type { Locale } from "@/config/i18n.config";
import type keystaticConfig from "@/keystatic.config";
import { createCollectionResource, createSingletonResource } from "@/lib/keystatic/resources";

interface IndexPageProps {
	params: {
		locale: Locale;
	};
}

type IndexPage = Entry<(typeof keystaticConfig)["singletons"]["de:index-page"]>;

type HeroSectionProps = IndexPage["hero"];
type FeatureSectionProps = IndexPage["main"] & { locale: Locale };

export async function generateMetadata(
	props: Readonly<IndexPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = params;
	const _t = await getTranslations({ locale, namespace: "IndexPage" });

	const metadata: Metadata = {
		/**
		 * Fall back to `title.default` from `layout.tsx`.
		 *
		 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#title
		 */
		// title: undefined,
	};

	return metadata;
}

export default async function IndexPage(props: Readonly<IndexPageProps>): Promise<ReactNode> {
	const { params } = props;

	const { locale } = params;
	setRequestLocale(locale);

	const page = await createSingletonResource("index-page", locale).read();
	const { hero, main } = page.data;

	return (
		<MainContent className="layout-grid content-start">
			<HeroSection {...hero} />
			<FeaturesSection {...main} locale={locale} />
		</MainContent>
	);
}

function HeroSection(props: Readonly<HeroSectionProps>): ReactNode {
	const { title, lead, image: _ } = props;

	return (
		<section className="layout-subgrid relative gap-y-10 bg-fill-weaker py-16 xs:py-24">
			<div className="max-w-text grid gap-y-6">
				<h1 className="text-balance font-heading text-display font-strong text-text-strong">
					{title}
				</h1>
				<p className="font-heading text-small text-text-weak xs:text-heading-4">{lead}</p>
			</div>
		</section>
	);
}

function FeaturesSection(props: Readonly<FeatureSectionProps>): ReactNode {
	const { sections, locale } = props;

	return (
		<div>
			{sections.map((section) => {
				switch (section.discriminant) {
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
					case "cardsSection": {
						return (
							<section className="layout-subgrid relative gap-y-12 border-t border-stroke-weak py-16 xs:py-24">
								<header className="max-w-text grid gap-y-4">
									<h2 className="text-balance font-heading text-heading-2 font-strong text-text-strong">
										{section.value.title}
									</h2>
									{/*<p className="font-heading text-heading-4 text-text-weak">
										This template comes with important features built in.
									</p>*/}
								</header>
								<ul
									className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))] gap-8"
									role="list"
								>
									{section.value.cards.map(async (card) => {
										switch (card.discriminant) {
											case "custom": {
												return <li>{/*<Card {...card.value} />*/}</li>;
											}
											case "news": {
												{
													const id = card.value.reference;
													const news = await createCollectionResource("news", locale).read(id);
													const { image, summary, title } = news.data;
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
																				href={`/events/${news.id}`}
																			>
																				Mehr Info
																			</Link>
																		</footer>
																	</div>
																</div>
															</article>
														</li>
													);
												}
											}
											case "page": {
												return <li>{/*<Card {...card.value} />*/}</li>;
											}
											case "event": {
												const id = card.value.reference;
												const event = await createCollectionResource("events", locale).read(id);
												const { image, summary, title } = event.data;
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
																			href={`/events/${event.id}`}
																		>
																			Mehr Info
																		</Link>
																	</footer>
																</div>
															</div>
														</article>
													</li>
												);
											}
										}
									})}
								</ul>

								<div>
									<Link
										className="focus-visible:focus-outline group inline-flex items-center gap-x-2 rounded-0.5 text-small text-text-brand"
										href="/"
									>
										<span className="underline group-hover:no-underline">See all</span>
										<ArrowRightIcon
											aria-hidden={true}
											className="size-5 shrink-0 text-icon-brand transition group-hover:translate-x-1"
										/>
									</Link>
								</div>
							</section>
						);
					}
					default: {
						return null;
					}
				}
			})}
		</div>
	);
}
