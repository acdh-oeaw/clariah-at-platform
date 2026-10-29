import type { Metadata } from "next";
import { getExtracted } from "next-intl/server";
import { notFound } from "next/navigation";
import { type ReactNode, Suspense } from "react";

import { NewsItem } from "#/app/(app)/[locale]/(default)/news/_components/news-item";
import { PageLayout } from "#/app/(app)/[locale]/_components/page-layout";
import { cachedNewsItem, staticSlugs } from "#/lib/data/api-cache";
import { isValidLocale } from "#/lib/i18n/locales";
import { localizeHref } from "#/lib/navigation/convert";

interface NewsItemPageProps extends PageProps<"/[locale]/news/[slug]"> {}

export function generateStaticParams({ params }: { params: { locale: string } }): Promise<Array<{ slug: string }>> {
	return staticSlugs.news(params.locale);
}

export async function generateMetadata(props: Readonly<NewsItemPageProps>): Promise<Metadata> {
	const { locale, slug } = await props.params;
	const item = await cachedNewsItem(slug, locale);

	if (item == null) {
		return {};
	}

	const languages: Record<string, string> = {};

	for (const translation of item.translations) {
		if (!isValidLocale(translation.locale)) {
			continue;
		}

		languages[translation.locale] = localizeHref(`/news/${translation.slug}`, translation.locale);
	}

	return { alternates: { languages } };
}

export default async function NewsItemPage(props: Readonly<NewsItemPageProps>): Promise<ReactNode> {
	const t = await getExtracted();
	return (
		<PageLayout title={t("News")} titleElement="p">
			<Suspense fallback={<p>Loading</p>}>
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
	return <NewsItem {...item} />;
}
