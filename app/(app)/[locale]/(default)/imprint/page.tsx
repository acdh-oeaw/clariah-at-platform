import type { Metadata } from "next";
import { getExtracted } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import { type ReactNode, Suspense } from "react";

import { AcdhImprint } from "#/app/(app)/[locale]/(default)/imprint/_components/acdh-imprint";
import { DetailFallback } from "#/app/(app)/[locale]/_components/detail-fallback";
import { PageContent } from "#/app/(app)/[locale]/_components/page-content";
import { PageLayout } from "#/app/(app)/[locale]/_components/page-layout";
import { isValidLocale } from "#/lib/i18n/locales.ts";
import { createMetadata } from "#/lib/metadata.ts";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getExtracted();

	return createMetadata({ pathname: "/imprint", title: t("Impressum") });
}

export default async function ImprintPage(): Promise<ReactNode> {
	const t = await getExtracted();
	const currentLocale = await locale();
	if (!isValidLocale(currentLocale)) {
		notFound();
	}

	return (
		<PageLayout title={t("Impressum")}>
			<PageContent>
				<Suspense fallback={<DetailFallback />}>
					<AcdhImprint locale={currentLocale} />
				</Suspense>
			</PageContent>
		</PageLayout>
	);
}
