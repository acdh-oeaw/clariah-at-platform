import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { CardSection } from "@/components/card-section";
import { MainContent } from "@/components/main-content";
import type { Locale } from "@/config/i18n.config";
import { createSingletonResource } from "@/lib/keystatic/resources";
import type { FeatureSectionProps, HeroSectionProps } from "@/types/keystatic";

interface IndexPageProps {
	params: {
		locale: Locale;
	};
}

export async function generateMetadata(
	props: Readonly<IndexPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = params;
	const _t = await getTranslations({ locale, namespace: "IndexPage" });

	const metadata: Metadata = {
		/**
		 * Fall back to `title.default` from `layout.tsx`.
		 *
		 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#title
		 */
		// title: undefined,
	};

	return metadata;
}

export default async function IndexPage(props: Readonly<IndexPageProps>): Promise<ReactNode> {
	const { params } = props;

	const { locale } = params;
	setRequestLocale(locale);
	try {
		const page = await createSingletonResource("index-page", locale).read();
		const { hero, main } = page.data;

		return (
			<MainContent className="layout-grid content-start">
				<HeroSection {...hero} />
				<FeaturesSection {...main} locale={locale} />
			</MainContent>
		);
	} catch {
		return notFound();
	}
}

function HeroSection(props: Readonly<HeroSectionProps>): ReactNode {
	const { title, lead, image: _ } = props;

	return (
		<section className="layout-subgrid relative gap-y-10 bg-fill-weaker py-16 xs:py-24">
			<div className="max-w-text grid gap-y-6">
				<h1 className="text-balance font-heading text-display font-strong text-text-strong">
					{title}
				</h1>
				<p className="font-heading text-small text-text-weak xs:text-heading-4">{lead}</p>
			</div>
		</section>
	);
}

function FeaturesSection(props: Readonly<FeatureSectionProps>): ReactNode {
	const { sections, locale } = props;

	return (
		<div>
			{sections.map((section) => {
				switch (section.discriminant) {
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
					case "cardsSection": {
						return (
							<CardSection
								key={section.value.id}
								cards={section.value.cards}
								className="layout-subgrid relative gap-y-12 border-t border-stroke-weak py-16 xs:py-24"
								locale={locale}
								title={section.value.title}
							/>
						);
					}
					default: {
						return null;
					}
				}
			})}
		</div>
	);
}
