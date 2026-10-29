import { getExtracted } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import { type ReactNode, Suspense } from "react";

import { AcdhImprint } from "#/app/(app)/[locale]/(default)/imprint/_components/acdh-imprint";
import { PageLayout } from "#/app/(app)/[locale]/_components/page-layout";
import { isValidLocale } from "#/lib/i18n/locales.ts";

export default async function ImprintPage(): Promise<ReactNode> {
	const t = await getExtracted();
	const currentLocale = await locale();
	if (!isValidLocale(currentLocale)) {
		notFound();
	}

	return (
		<PageLayout title={t("Impressum")}>
			<div className="container max-w-7xl">
				<Suspense>
					<AcdhImprint locale={currentLocale} />
				</Suspense>
			</div>
		</PageLayout>
	);
}
