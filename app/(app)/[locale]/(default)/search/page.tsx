import { getExtracted } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import { type ReactNode, Suspense } from "react";

import { searchParams } from "#/app/(app)/[locale]/(default)/search-params";
import { WebsiteSearch } from "#/app/(app)/[locale]/(default)/search/_components/website-search.tsx";
import { PageLayout } from "#/app/(app)/[locale]/_components/page-layout";
import { isValidLocale } from "#/lib/i18n/locales.ts";

interface SearchPageProps extends PageProps<"/[locale]/search"> {}

export default async function SearchPage(props: Readonly<SearchPageProps>): Promise<ReactNode> {
	const t = await getExtracted();
	const currentLocale = await locale();
	if (!isValidLocale(currentLocale)) {
		notFound();
	}

	return (
		<PageLayout title={t("Suche")}>
			<div className="md:py-16 px-4 py-8 container max-w-7xl">
				<Suspense>
					<WebsiteSearchSection searchParams={props.searchParams} />
				</Suspense>
			</div>
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
