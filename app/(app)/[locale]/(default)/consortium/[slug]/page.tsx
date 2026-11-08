import type { Metadata } from "next";
import { getExtracted } from "next-intl/server";
import { notFound } from "next/navigation";
import { type ReactNode, Suspense } from "react";

import { Member } from "#/app/(app)/[locale]/(default)/consortium/_components/member.tsx";
import { DetailFallback } from "#/app/(app)/[locale]/_components/detail-fallback.tsx";
import { PageLayout } from "#/app/(app)/[locale]/_components/page-layout.tsx";
import { cachedInstitution, isNationalConsortiumMember, staticSlugs } from "#/lib/data/api-cache.ts";
import { createMetadata, createNotFoundMetadata, getLanguageAlternates } from "#/lib/metadata.ts";

interface MemberPageProps extends PageProps<"/[locale]/consortium/[slug]"> {}

/**
 * A link's prefetch of this page is served from static output, never rendered per request. Every slug known at build
 * time is prerendered; for one that is not, the prefetch holds the fallback.
 */
export const ensureStatic = "prefetch";

export function generateStaticParams({ params }: { params: { locale: string } }): Promise<Array<{ slug: string }>> {
	return staticSlugs.nationalConsortiumMembers("clariah-at", params.locale);
}

export async function generateMetadata(props: Readonly<MemberPageProps>): Promise<Metadata> {
	const { locale, slug } = await props.params;
	const item = await cachedInstitution(slug, locale);

	if (item == null) {
		return createNotFoundMetadata();
	}

	return createMetadata({
		pathname: `/consortium/${slug}`,
		title: item.name,
		languages: getLanguageAlternates("/consortium", item.translations),
	});
}

export default async function MemberPage(props: Readonly<MemberPageProps>): Promise<ReactNode> {
	const t = await getExtracted();
	return (
		<PageLayout title={t("Konsortium")} titleElement="p">
			<Suspense fallback={<DetailFallback />}>
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
