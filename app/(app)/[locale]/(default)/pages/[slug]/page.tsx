import type { Metadata } from "next";
import { getExtracted } from "next-intl/server";
import { notFound } from "next/navigation";
import { type ReactNode, Suspense } from "react";

import { Page } from "#/app/(app)/[locale]/(default)/pages/_components/page";
import { DetailFallback } from "#/app/(app)/[locale]/_components/detail-fallback";
import { PageLayout } from "#/app/(app)/[locale]/_components/page-layout";
import { cachedPage, staticSlugs } from "#/lib/data/api-cache";
import { createMetadata, getLanguageAlternates } from "#/lib/metadata.ts";

interface PagePageProps extends PageProps<"/[locale]/pages/[slug]"> {}

export function generateStaticParams({ params }: { params: { locale: string } }): Promise<Array<{ slug: string }>> {
	return staticSlugs.pages(params.locale);
}

export async function generateMetadata(props: Readonly<PagePageProps>): Promise<Metadata> {
	const { locale, slug } = await props.params;
	const item = await cachedPage(slug, locale);

	if (item == null) {
		return {};
	}

	return createMetadata({
		pathname: `/pages/${slug}`,
		title: item.title,
		description: item.summary,
		image: item.image,
		languages: getLanguageAlternates("/pages", item.translations),
	});
}

export default async function PagePage(props: Readonly<PagePageProps>): Promise<ReactNode> {
	const t = await getExtracted();
	return (
		<PageLayout title={t("Infos")} titleElement="p">
			<Suspense fallback={<DetailFallback />}>
				<PageDetails params={props.params} />
			</Suspense>
		</PageLayout>
	);
}

async function PageDetails({ params }: { params: PagePageProps["params"] }): Promise<ReactNode> {
	const { locale, slug } = await params;
	const item = await cachedPage(slug, locale);
	if (item == null) {
		notFound();
	}
	return <Page {...item} />;
}
