import type { Metadata, ResolvingMetadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { Card } from "@/components/card";
import { MainContent } from "@/components/main-content";
import type { Locale } from "@/config/i18n.config";
import { createCollectionResource, createSingletonResource } from "@/lib/keystatic/resources";

interface NewsOverviewPageProps {
	params: {
		locale: Locale;
	};
}

export async function generateMetadata(
	props: Readonly<NewsOverviewPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = params;

	const newsOverview = await createSingletonResource("news-overview", locale).read();

	const metadata: Metadata = {
		title: newsOverview.data.title,
	};
	return metadata;
}

export default async function NewsOverviewPage(
	props: Readonly<NewsOverviewPageProps>,
): Promise<ReactNode> {
	const { params } = props;

	const { locale } = params;

	setRequestLocale(locale);

	const newsOverview = await createSingletonResource("news-overview", locale).read();
	const news = await createCollectionResource("news", locale).all();

	return (
		<MainContent className="layout-grid content-start">
			<section className="layout-subgrid relative gap-y-12 py-16 xs:py-24">
				<header>
					<h1 className="text-balance font-heading text-heading-1 font-strong text-text-strong">
						{newsOverview.data.title}
					</h1>
					<p className="mt-6 font-heading text-heading-4 text-text-weak">
						{newsOverview.data.lead}
					</p>
				</header>
				<ul
					className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))] gap-8"
					role="list"
				>
					{news.map(async (newsobj) => {
						const id = newsobj.id;
						const newsItem = await createCollectionResource("news", locale).read(id);
						const link = { label: "", href: `/news/${id}` };
						return (
							<li key={id}>
								<Card
									className="grid h-full grid-rows-[13rem,auto]"
									discriminent="news"
									{...newsItem.data}
									link={link}
									locale={locale}
								></Card>
							</li>
						);
					})}
				</ul>
			</section>
		</MainContent>
	);
}
