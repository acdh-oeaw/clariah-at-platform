import { getExtracted } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import { type ReactNode, Suspense } from "react";

import { FeaturedSection } from "#/app/(app)/[locale]/(default)/(index)/_components/featured-section";
import { HeroSection } from "#/app/(app)/[locale]/(default)/(index)/_components/hero-section";
import { Main } from "#/components/main";
import { cachedSiteMetadata } from "#/lib/data/api-cache";
import { isValidLocale } from "#/lib/i18n/locales";

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
			<Suspense>
				<HeroSection className="bg-primary-1000 ">
					<h1 className="text-h1 text-center">{siteMetadata.title}</h1>
					<p className="text-3xl text-center">{siteMetadata.description}</p>
				</HeroSection>
				<div className="flex flex-col gap-y-16 md:py-16 xs:px-4 container max-w-7xl">
					<FeaturedSection title={t("Aktuelles")} entityType="news" />
					<FeaturedSection title={t("Events")} entityType="events" />
					<FeaturedSection title={t("Projekte")} entityType="projects" />
				</div>
			</Suspense>
		</Main>
	);
}
