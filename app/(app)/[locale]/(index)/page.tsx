import { ArrowRightIcon } from "lucide-react";
import type { Metadata, ResolvingMetadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { Image } from "@/components/image";
import { Link } from "@/components/link";
import { Logo } from "@/components/logo";
import { MainContent } from "@/components/main-content";
import type { Locale } from "@/config/i18n.config";

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

// eslint-disable-next-line @typescript-eslint/require-await
export default async function IndexPage(props: Readonly<IndexPageProps>): Promise<ReactNode> {
	const { params } = props;

	const { locale } = params;
	setRequestLocale(locale);

	return (
		<MainContent className="layout-grid content-start">
			<HeroSection />
			<FeaturesSection />
		</MainContent>
	);
}

function HeroSection(): ReactNode {
	const t = useTranslations("IndexPage");

	return (
		<section className="layout-subgrid relative gap-y-10 bg-fill-weaker py-16 xs:py-24">
			<div className="max-w-text grid gap-y-6">
				<span className="inline-flex items-center gap-x-2 justify-self-start rounded-4 border border-stroke-weak bg-fill-weak px-3 py-0.5 text-tiny text-text-strong">
					<Logo className="size-5 shrink-0 text-icon-neutral" />
					<span>{t("badge")}</span>
				</span>
				<h1 className="text-balance font-heading text-display font-strong text-text-strong">
					{t("title")}
				</h1>
				<p className="font-heading text-small text-text-weak xs:text-heading-4">{t("lead-in")}</p>
			</div>
		</section>
	);
}

function FeaturesSection(): ReactNode {
	const _t = useTranslations("IndexPage");

	const features = {
		i18n: { title: "Internationalisation" },
		e2e: { title: "End-to-end tests" },
		"dark-mode": { title: "Dark mode" },
		cms: { title: "Content management system" },
		feed: { title: "RSS Feed" },
		authentication: { title: "Authentication" },
	};

	return (
		<section className="layout-subgrid relative gap-y-12 border-t border-stroke-weak py-16 xs:py-24">
			<header className="max-w-text grid gap-y-4">
				<h2 className="text-balance font-heading text-heading-2 font-strong text-text-strong">
					Features
				</h2>
				<p className="font-heading text-heading-4 text-text-weak">
					This template comes with important features built in.
				</p>
			</header>

			<ul
				className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))] gap-8"
				role="list"
			>
				{Object.entries(features).map(([id, feature]) => {
					return (
						<li key={id}>
							<article className="grid grid-rows-[13rem,auto] overflow-hidden rounded-4 border border-stroke-weak bg-background-raised shadow-raised">
								<Image
									alt=""
									className="size-full border-b border-stroke-weak object-cover"
									height={300}
									/** Preload image because it's the largest contentful paint (lcp) element. */
									priority={true}
									src="https://picsum.photos/400/300"
									unoptimized={true}
									width={400}
								/>
								<div className="grid gap-y-6 p-8">
									<div className="grid gap-y-2">
										<h3 className="font-heading text-heading-4 font-strong text-text-strong">
											{feature.title}
										</h3>
										<p className="text-small text-text-weak">
											Excepteur eiusmod dolor eu ut nulla cillum nisi irure proident. Reprehenderit
											irure voluptate ex consectetur magna quis aute quis eiusmod sunt in in elit.
										</p>
									</div>
								</div>
							</article>
						</li>
					);
				})}
			</ul>

			<div>
				<Link
					className="focus-visible:focus-outline group inline-flex items-center gap-x-2 rounded-0.5 text-small text-text-brand"
					href="/"
				>
					<span className="underline group-hover:no-underline">See all</span>
					<ArrowRightIcon
						aria-hidden={true}
						className="size-5 shrink-0 text-icon-brand transition group-hover:translate-x-1"
					/>
				</Link>
			</div>
		</section>
	);
}
