import type { Metadata } from "next";
import { getExtracted } from "next-intl/server";
import { notFound } from "next/navigation";
import { type ReactNode, Suspense } from "react";

import { Member } from "#/app/(app)/[locale]/(default)/consortium/_components/member";
import { PageLayout } from "#/app/(app)/[locale]/_components/page-layout";
import { cachedInstitution, isNationalConsortiumMember, staticSlugs } from "#/lib/data/api-cache";
import { isValidLocale } from "#/lib/i18n/locales";
import { localizeHref } from "#/lib/navigation/convert";

interface MemberPageProps extends PageProps<"/[locale]/consortium/[slug]"> {}

export function generateStaticParams({ params }: { params: { locale: string } }): Promise<Array<{ slug: string }>> {
	return staticSlugs.nationalConsortiumMembers("clariah-at", params.locale);
}

export async function generateMetadata(props: Readonly<MemberPageProps>): Promise<Metadata> {
	const { locale, slug } = await props.params;
	const item = await cachedInstitution(slug, locale);

	if (item == null) {
		return {};
	}

	const languages: Record<string, string> = {};

	for (const translation of item.translations) {
		if (!isValidLocale(translation.locale)) {
			continue;
		}

		languages[translation.locale] = localizeHref(`/consortium/${translation.slug}`, translation.locale);
	}

	return { alternates: { languages } };
}

export default async function MemberPage(props: Readonly<MemberPageProps>): Promise<ReactNode> {
	const t = await getExtracted();
	return (
		<PageLayout title={t("Konsortium")} titleElement="p">
			<Suspense fallback={<p>Loading</p>}>
				<MemberDetails params={props.params} />
			</Suspense>
		</PageLayout>
	);
}

async function MemberDetails({ params }: { params: MemberPageProps["params"] }): Promise<ReactNode> {
	const { locale, slug } = await params;

	const isMember = await isNationalConsortiumMember("clariah-at", slug, locale);

	if (!isMember) {
		notFound();
	}
	const item = await cachedInstitution(slug, locale);
	if (item == null) {
		notFound();
	}
	return <Member {...item} />;
}
