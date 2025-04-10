import type { Metadata, ResolvingMetadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { Search } from "@/app/(app)/[locale]/_components/search/search";
import { MainContent } from "@/components/main-content";
import type { Locale } from "@/config/i18n.config";
import { createSingletonResource } from "@/lib/keystatic/resources";

interface ResourcesPageProps {
	params: {
		locale: Locale;
	};
	searchParams?: Promise<{
		query?: string;
		page?: string;
	}>;
}
export async function generateMetadata(
	props: Readonly<ResourcesPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = params;

	const resources = await createSingletonResource("resources", locale).read();

	const metadata: Metadata = {
		title: resources.data.title,
	};

	return metadata;
}

export default async function ResourcesPage(
	props: Readonly<ResourcesPageProps>,
): Promise<ReactNode> {
	const { params } = props;

	const { locale } = params;

	/*const searchParams = await props.searchParams;
		const query = searchParams?.query || "";
		const currentPage = Number(searchParams?.page) || 1;*/

	const resources = await createSingletonResource("resources", locale).read();
	const { title, lead } = resources.data;

	setRequestLocale(locale);

	return (
		<MainContent className="layout-grid content-start">
			<section className="layout-subgrid relative py-16 xs:py-24">
				<h1 className="text-balance font-heading text-heading-1 font-strong text-text-strong">
					{title}
				</h1>
				<p>{lead}</p>
				<section className="py-16 xs:py-24">
					<Search content="resources" locale={locale} />
				</section>
			</section>
		</MainContent>
	);
}
