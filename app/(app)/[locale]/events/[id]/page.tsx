import type { Metadata, ResolvingMetadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { MainContent } from "@/components/main-content";
import { env } from "@/config/env.config";
import type { Locale } from "@/config/i18n.config";
import { createCollectionResource } from "@/lib/keystatic/resources";

interface EventPageProps {
	params: {
		id: string;
		locale: Locale;
	};
}

export const dynamicParams = false;

export async function generateStaticParams(props: {
	params: Pick<EventPageProps["params"], "locale">;
}): Promise<Awaited<Array<Pick<EventPageProps["params"], "id">>>> {
	const { params } = props;

	const { locale } = params;

	const ids = await createCollectionResource("events", locale).list();

	return ids.map((id) => {
		/** @see https://github.com/vercel/next.js/issues/63002 */
		return { id: env.NODE_ENV === "production" ? id : encodeURIComponent(id) };
	});
}

export async function generateMetadata(
	props: Readonly<EventPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = params;
	const id = decodeURIComponent(params.id);

	const event = await createCollectionResource("events", locale).read(id);

	const metadata: Metadata = {
		title: event.data.title,
	};

	return metadata;
}

export default async function EventPage(props: Readonly<EventPageProps>): Promise<ReactNode> {
	const { params } = props;

	const { locale } = params;
	const id = decodeURIComponent(params.id);

	setRequestLocale(locale);

	const event = await createCollectionResource("events", locale).read(id);
	const { default: Content } = await event.compile(event.data.content);

	return (
		<MainContent className="layout-grid content-start">
			<section className="layout-subgrid relative py-16 xs:py-24">
				<h1 className="text-balance font-heading text-heading-1 font-strong text-text-strong">
					{event.data.title}
				</h1>
				<Content />
			</section>
		</MainContent>
	);
}
