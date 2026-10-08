import type { Metadata } from "next";
import { getExtracted } from "next-intl/server";
import { notFound } from "next/navigation";
import { type ReactNode, Suspense } from "react";

import { Event } from "#/app/(app)/[locale]/(default)/events/_components/event";
import { Main } from "#/app/(app)/[locale]/_components/main";
import { cachedEvent, staticSlugs } from "#/lib/data/api-cache";
import { isValidLocale } from "#/lib/i18n/locales";
import { localizeHref } from "#/lib/navigation/convert";

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

	const languages: Record<string, string> = {};

	for (const translation of item.translations) {
		if (!isValidLocale(translation.locale)) {
			continue;
		}

		languages[translation.locale] = localizeHref(`/events/${translation.slug}`, translation.locale);
	}

	return { alternates: { languages } };
}

export default async function EventPage(props: Readonly<EventPageProps>): Promise<ReactNode> {
	const t = await getExtracted();
	return (
		<Main className="flex flex-col gap-y-12 bg-primary-100">
			<div className="bg-primary-1000 px-28 py-4">
				<h1 className="flex relative items-end text-h2 text-white">{t("Events")}</h1>
			</div>
			<Suspense fallback={<p>Loading</p>}>
				<EventDetails params={props.params} />
			</Suspense>
		</Main>
	);
}

async function EventDetails({ params }: { params: EventPageProps["params"] }): Promise<ReactNode> {
	const { locale, slug } = await params;
	const item = await cachedEvent(slug, locale);
	if (item == null) {
		notFound();
	}
	return <Event {...item} />;
}
