import type { Metadata, ResolvingMetadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { MainContent } from "@/components/main-content";
import { env } from "@/config/env.config";
import type { Locale } from "@/config/i18n.config";
import { createCollectionResource } from "@/lib/keystatic/resources";

interface ContentPageProps {
	params: {
		id: string;
		locale: Locale;
	};
}

export const dynamicParams = false;

export async function generateStaticParams(props: {
	params: Pick<ContentPageProps["params"], "locale">;
}): Promise<Awaited<Array<Pick<ContentPageProps["params"], "id">>>> {
	const { params } = props;

	const { locale } = params;

	const ids = await createCollectionResource("pages", locale).list();

	return ids.map((id) => {
		/** @see https://github.com/vercel/next.js/issues/63002 */
		return { id: env.NODE_ENV === "production" ? id : encodeURIComponent(id) };
	});
}

export async function generateMetadata(
	props: Readonly<ContentPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = params;
	const id = decodeURIComponent(params.id);

	const page = await createCollectionResource("pages", locale).read(id);

	const metadata: Metadata = {
		title: page.data.title,
	};

	return metadata;
}

export default async function ContentPage(props: Readonly<ContentPageProps>): Promise<ReactNode> {
	const { params } = props;

	const { locale } = params;
	const id = decodeURIComponent(params.id);

	setRequestLocale(locale);

	const page = await createCollectionResource("pages", locale).read(id);
	const { default: Content } = await page.compile(page.data.content);

	return (
		<MainContent className="layout-grid content-start">
			<section className="layout-subgrid relative py-16 xs:py-24">
				<h1 className="text-balance font-heading text-heading-1 font-strong text-text-strong">
					{page.data.title}
				</h1>
				<Content />
			</section>
		</MainContent>
	);
}
