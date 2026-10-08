import type { Metadata } from "next";
import { getExtracted } from "next-intl/server";
import { notFound } from "next/navigation";
import { type ReactNode, Suspense } from "react";

import { Page } from "#/app/(app)/[locale]/(default)/pages/_components/page";
import { Main } from "#/app/(app)/[locale]/_components/main";
import { cachedPage, staticSlugs } from "#/lib/data/api-cache";
import { isValidLocale } from "#/lib/i18n/locales.ts";
import { localizeHref } from "#/lib/navigation/convert.ts";

interface PagePageProps extends PageProps<"/[locale]/pages/[slug]"> {}

export function generateStaticParams({ params }: { params: { locale: string } }): Promise<Array<{ slug: string }>> {
	return staticSlugs.pages(params.locale);
}

/** Same reasoning as the news detail page's `generateMetadata` — see its comment. */
export async function generateMetadata(props: Readonly<PagePageProps>): Promise<Metadata> {
	const { locale, slug } = await props.params;
	const item = await cachedPage(slug, locale);

	if (item == null) {
		return {};
	}

	const languages: Record<string, string> = {};

	for (const translation of item.translations) {
		if (!isValidLocale(translation.locale)) {
			continue;
		}

		languages[translation.locale] = localizeHref(`/pages/${translation.slug}`, translation.locale);
	}

	return { alternates: { languages } };
}

export default async function PagePage(props: Readonly<PagePageProps>): Promise<ReactNode> {
	const t = await getExtracted();
	return (
		<Main className="flex flex-col gap-y-12 bg-primary-100">
			<h1 className="flex relative items-end text-h2 text-white">{t("Infos")}</h1>
			<Suspense fallback={<p>Loading</p>}>
				<PageDetails params={props.params} />
			</Suspense>
		</Main>
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
