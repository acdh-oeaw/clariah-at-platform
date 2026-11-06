import type { Metadata } from "next";
import { getExtracted } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import { type ReactNode, Suspense } from "react";

import { searchParams } from "#/app/(app)/[locale]/(default)/search-params";
import { WebsiteSearch } from "#/app/(app)/[locale]/(default)/search/_components/website-search.tsx";
import { DetailFallback } from "#/app/(app)/[locale]/_components/detail-fallback";
import { PageContent } from "#/app/(app)/[locale]/_components/page-content";
import { PageLayout } from "#/app/(app)/[locale]/_components/page-layout";
import { isValidLocale } from "#/lib/i18n/locales.ts";
import { createMetadata } from "#/lib/metadata.ts";

interface SearchPageProps extends PageProps<"/[locale]/search"> {}

export async function generateMetadata(): Promise<Metadata> {
	const t = await getExtracted();

	return createMetadata({ pathname: "/search", title: t("Suche"), noindex: true });
}

export default async function SearchPage(props: Readonly<SearchPageProps>): Promise<ReactNode> {
	const t = await getExtracted();
	const currentLocale = await locale();
	if (!isValidLocale(currentLocale)) {
		notFound();
	}

	return (
		<PageLayout title={t("Suche")}>
			<PageContent>
				<Suspense fallback={<DetailFallback />}>
					<WebsiteSearchSection searchParams={props.searchParams} />
				</Suspense>
			</PageContent>
		</PageLayout>
	);
}

async function WebsiteSearchSection(props: Pick<SearchPageProps, "searchParams">): Promise<ReactNode> {
	const currentLocale = await locale();
	if (!isValidLocale(currentLocale)) {
		notFound();
	}
	const query = searchParams.safeParse(await props.searchParams);

	if (!query.success) {
		notFound();
	}

	return <WebsiteSearch locale={currentLocale} />;
}
