import type { Metadata } from "next";
import { getExtracted } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import type { ReactNode } from "react";

import { AcdhImprint } from "#/app/(app)/[locale]/(default)/imprint/_components/acdh-imprint.tsx";
import { DetailCard } from "#/app/(app)/[locale]/_components/detail-card.tsx";
import { PageLayout } from "#/app/(app)/[locale]/_components/page-layout.tsx";
import { isValidLocale } from "#/lib/i18n/locales.ts";
import { createMetadata } from "#/lib/metadata.ts";

/** The whole page is static, for initial loads and navigations alike: the build fails if that changes. */
export const ensureStatic = "navigation";

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
		<PageLayout title={t("Infos")} titleElement="p">
			<DetailCard image={null} title={t("Impressum")}>
				<div className="max-w-prose [&>*>:first-child]:mbs-0">
					<AcdhImprint locale={currentLocale} />
				</div>
			</DetailCard>
		</PageLayout>
	);
}
