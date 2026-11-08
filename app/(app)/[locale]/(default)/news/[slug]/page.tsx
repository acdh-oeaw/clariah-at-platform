import type { Metadata } from "next";
import { getExtracted } from "next-intl/server";
import { notFound } from "next/navigation";
import { Fragment, type ReactNode, Suspense } from "react";

import { NewsItem } from "#/app/(app)/[locale]/(default)/news/_components/news-item.tsx";
import { DetailFallback } from "#/app/(app)/[locale]/_components/detail-fallback.tsx";
import { PageLayout } from "#/app/(app)/[locale]/_components/page-layout.tsx";
import { JsonLd } from "#/components/json-ld.tsx";
import { cachedNewsItem, staticSlugs } from "#/lib/data/api-cache.ts";
import { createNewsArticle } from "#/lib/json-ld.ts";
import { createMetadata, createNotFoundMetadata, getLanguageAlternates } from "#/lib/metadata.ts";

interface NewsItemPageProps extends PageProps<"/[locale]/news/[slug]"> {}

/**
 * A link's prefetch of this page is served from static output, never rendered per request. Every slug known at build
 * time is prerendered; for one that is not, the prefetch holds the fallback.
 */
export const ensureStatic = "prefetch";

export function generateStaticParams({ params }: { params: { locale: string } }): Promise<Array<{ slug: string }>> {
	return staticSlugs.news(params.locale);
}

export async function generateMetadata(props: Readonly<NewsItemPageProps>): Promise<Metadata> {
	const { locale, slug } = await props.params;
	const item = await cachedNewsItem(slug, locale);

	if (item == null) {
		return createNotFoundMetadata();
	}

	return createMetadata({
		pathname: `/news/${slug}`,
		title: item.title,
		description: item.summary,
		image: item.image,
		languages: getLanguageAlternates("/news", item.translations),
		openGraph: { type: "article", publishedTime: item.publishedAt },
	});
}

export default async function NewsItemPage(props: Readonly<NewsItemPageProps>): Promise<ReactNode> {
	const t = await getExtracted();
	return (
		<PageLayout title={t("News")} titleElement="p">
			<Suspense fallback={<DetailFallback />}>
				<NewsItemDetails params={props.params} />
			</Suspense>
		</PageLayout>
	);
}

async function NewsItemDetails({ params }: { params: NewsItemPageProps["params"] }): Promise<ReactNode> {
	const { locale, slug } = await params;
	const item = await cachedNewsItem(slug, locale);
	if (item == null) {
		notFound();
	}
	return (
		<Fragment>
			<JsonLd item={await createNewsArticle(`/news/${slug}`, item)} />
			<NewsItem {...item} />
		</Fragment>
	);
}
