import type { Metadata, ResolvingMetadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { Card } from "@/components/card";
import { MainContent } from "@/components/main-content";
import type { Locale } from "@/config/i18n.config";
import { createCollectionResource, createSingletonResource } from "@/lib/keystatic/resources";

interface NutshellPageProps {
	params: {
		locale: Locale;
	};
}

export async function generateMetadata(
	props: Readonly<NutshellPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = params;

	const nutshell = await createSingletonResource("in-a-nutshell", locale).read();

	const metadata: Metadata = {
		title: nutshell.data.title,
	};
	return metadata;
}

export default async function NutshellPage(props: Readonly<NutshellPageProps>): Promise<ReactNode> {
	const { params } = props;

	const { locale } = params;

	setRequestLocale(locale);

	const nutshell = await createSingletonResource("in-a-nutshell", locale).read();
	const organisations = await createCollectionResource("organisations", locale).all();

	const { default: Lead } = await nutshell.compile(nutshell.data.lead);
	const { default: Content } = await nutshell.compile(nutshell.data.content);

	return (
		<MainContent className="layout-grid content-start">
			<section className="layout-subgrid relative gap-y-12 py-16 xs:py-24">
				<header>
					<h1 className="text-balance font-heading text-heading-1 font-strong text-text-strong">
						{nutshell.data.title}
					</h1>
					<div className="prose">
						<Lead />
					</div>
				</header>
			</section>
			<section className="layout-subgrid relative gap-y-12 border-t border-stroke-weak py-16 xs:py-24">
				<header className="max-w-text grid gap-y-4">
					<h2 className="text-balance font-heading text-heading-2 font-strong text-text-strong">
						Members
					</h2>
				</header>
				<ul
					className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))] gap-8"
					role="list"
				>
					{organisations
						.filter((org) => {
							return org.data.consortiumStatus === "member";
						})
						.map(async (organisation) => {
							const id = organisation.id;
							const organisationItem = await createCollectionResource("organisations", locale).read(
								id,
							);
							const { name: title, image, description } = organisationItem.data;
							const link = { label: "", href: `/organisations/${id}` };
							return (
								<li key={id}>
									<Card
										className="grid h-full grid-rows-[13rem,auto]"
										discriminent="organisation"
										image={image}
										link={link}
										locale={locale}
										summary={{ content: description, title: "" }}
										title={title}
									></Card>
								</li>
							);
						})}
				</ul>
			</section>
			<section className="layout-subgrid relative gap-y-12 border-t border-stroke-weak py-16 xs:py-24">
				<header className="max-w-text grid gap-y-4">
					<h2 className="text-balance font-heading text-heading-2 font-strong text-text-strong">
						Observers
					</h2>
				</header>
				<ul
					className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))] gap-8"
					role="list"
				>
					{organisations
						.filter((org) => {
							return org.data.consortiumStatus === "observer";
						})
						.map(async (organisation) => {
							const id = organisation.id;
							const organisationItem = await createCollectionResource("organisations", locale).read(
								id,
							);
							const { name: title, image, description } = organisationItem.data;
							const link = { label: "", href: `/organisations/${id}` };
							return (
								<li key={id}>
									<Card
										className="grid h-full grid-rows-[13rem,auto]"
										discriminent="organisation"
										image={image}
										link={link}
										locale={locale}
										summary={{ content: description, title: "" }}
										title={title}
									></Card>
								</li>
							);
						})}
				</ul>
			</section>
			<section className="prose">
				<Content />
			</section>
		</MainContent>
	);
}
