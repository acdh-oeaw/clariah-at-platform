import type { Metadata } from "next";
import { getExtracted, getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import type { ReactNode } from "react";

import { FeaturedSection } from "#/app/(app)/[locale]/(default)/(index)/_components/featured-section.tsx";
import { HeroSection } from "#/app/(app)/[locale]/(default)/(index)/_components/hero-section.tsx";
import { Main } from "#/app/(app)/[locale]/_components/main.tsx";
import { PageContent } from "#/app/(app)/[locale]/_components/page-content.tsx";
import { JsonLd } from "#/components/json-ld.tsx";
import { cachedSiteMetadata } from "#/lib/data/api-cache.ts";
import { isValidLocale } from "#/lib/i18n/locales.ts";
import { createOrganization, createWebSite } from "#/lib/json-ld.ts";
import { createMetadata } from "#/lib/metadata.ts";

/** The whole page is static, for initial loads and navigations alike: the build fails if that changes. */
export const ensureStatic = "navigation";

export async function generateMetadata(): Promise<Metadata> {
	const site = await cachedSiteMetadata(await getLocale());

	return createMetadata({
		pathname: "/",
		title: { absolute: site.title },
		openGraph: {
			...(site.ogTitle != null ? { title: site.ogTitle } : {}),
			...(site.ogDescription != null ? { description: site.ogDescription.trim() } : {}),
		},
	});
}

// No props needed: the locale comes from `i18n/request.ts`, which reads it via
// `next/root-params`. No `params`, no `setRequestLocale`.
export default async function IndexPage(): Promise<ReactNode> {
	const currentLocale = await locale();
	if (!isValidLocale(currentLocale)) {
		notFound();
	}

	const siteMetadata = await cachedSiteMetadata(currentLocale);
	const t = await getExtracted();
	return (
		<Main className="flex flex-col gap-y-12 bg-primary-100">
			<JsonLd item={createOrganization(siteMetadata)} />
			<JsonLd item={createWebSite(siteMetadata)} />
			<HeroSection className="bg-primary-1000">
				<h1 className="text-h1">{siteMetadata.title}</h1>
				<p className="text-3xl max-w-3xl">{siteMetadata.description}</p>
			</HeroSection>
			<PageContent className="flex flex-col gap-y-16">
				<FeaturedSection title={t("News")} entityType="news" />
				<FeaturedSection title={t("Events")} entityType="events" />
				<FeaturedSection title={t("Projekte")} entityType="projects" />
			</PageContent>
		</Main>
	);
}
