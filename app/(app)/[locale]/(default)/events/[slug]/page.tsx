import type { Metadata } from "next";
import { getExtracted } from "next-intl/server";
import { notFound } from "next/navigation";
import { type ReactNode, Suspense } from "react";

import { Event } from "#/app/(app)/[locale]/(default)/events/_components/event";
import { DetailFallback } from "#/app/(app)/[locale]/_components/detail-fallback";
import { PageLayout } from "#/app/(app)/[locale]/_components/page-layout";
import { JsonLd } from "#/components/json-ld.tsx";
import { cachedEvent, staticSlugs } from "#/lib/data/api-cache";
import { createEvent } from "#/lib/json-ld.ts";
import { createMetadata, getLanguageAlternates } from "#/lib/metadata.ts";

interface EventPageProps extends PageProps<"/[locale]/events/[slug]"> {}

export function generateStaticParams({ params }: { params: { locale: string } }): Promise<Array<{ slug: string }>> {
	return staticSlugs.events(params.locale);
}

export async function generateMetadata(props: Readonly<EventPageProps>): Promise<Metadata> {
	const { locale, slug } = await props.params;
	const item = await cachedEvent(slug, locale);

	if (item == null) {
		return {};
	}

	return createMetadata({
		pathname: `/events/${slug}`,
		title: item.title,
		description: item.summary,
		image: item.image,
		languages: getLanguageAlternates("/events", item.translations),
	});
}

export default async function EventPage(props: Readonly<EventPageProps>): Promise<ReactNode> {
	const t = await getExtracted();
	return (
		<PageLayout title={t("Events")} titleElement="p">
			<Suspense fallback={<DetailFallback />}>
				<EventDetails params={props.params} />
			</Suspense>
		</PageLayout>
	);
}

async function EventDetails({ params }: { params: EventPageProps["params"] }): Promise<ReactNode> {
	const { locale, slug } = await params;
	const item = await cachedEvent(slug, locale);
	if (item == null) {
		notFound();
	}
	const jsonLd = await createEvent(`/events/${slug}`, item);

	return (
		<>
			{jsonLd != null ? <JsonLd item={jsonLd} /> : null}
			<Event {...item} />
		</>
	);
}
