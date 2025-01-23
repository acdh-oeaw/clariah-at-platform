import { ArrowRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Card } from "@/components/card";
import { Link } from "@/components/link";
import { createCollectionResource } from "@/lib/keystatic/resources";
import type { CardSectionProps } from "@/types/keystatic";

type CardSectionComponentProps = CardSectionProps & {
	className?: string;
};

export function CardSection(props: Readonly<CardSectionComponentProps>): ReactNode {
	const { className, title, cards, locale } = props;
	const t = useTranslations("Card");
	return (
		<section className={className}>
			<header className="max-w-text grid gap-y-4">
				<h2 className="text-balance font-heading text-heading-2 font-strong text-text-strong">
					{title}
				</h2>
				{/*<p className="font-heading text-heading-4 text-text-weak">
										This template comes with important features built in.
									</p>*/}
			</header>
			<ul
				className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))] gap-8"
				role="list"
			>
				{cards.map(async (card) => {
					switch (card.discriminant) {
						case "custom": {
							return (
								<li key={card.value.id}>
									{
										<Card
											className="grid h-full grid-rows-[13rem,auto] overflow-hidden rounded-4 border border-stroke-weak bg-background-raised shadow-raised"
											{...card.value}
										/>
									}
								</li>
							);
						}
						case "news": {
							const id = card.value.reference;
							const news = await createCollectionResource("news", locale).read(id);
							const link = { label: t("read-more"), href: `/news/${id}` };

							return (
								<li key={id}>
									{
										<Card
											className="grid h-full grid-rows-[13rem,auto] overflow-hidden rounded-4 border border-stroke-weak bg-background-raised shadow-raised"
											{...news.data}
											id={id}
											link={link}
										/>
									}
								</li>
							);
						}
						case "page": {
							const id = card.value.reference;
							const page = await createCollectionResource("pages", locale).read(id);
							const link = { label: t("read-more"), href: `/${id}` };
							return (
								<li key={id}>
									<Card
										className="grid h-full grid-rows-[13rem,auto] overflow-hidden rounded-4 border border-stroke-weak bg-background-raised shadow-raised"
										id={id}
										link={link}
										{...page.data}
									/>
								</li>
							);
						}
						case "event": {
							const id = card.value.reference;
							const event = await createCollectionResource("events", locale).read(id);
							const link = { label: t("read-more"), href: `/events/${id}` };
							return (
								<li key={id}>
									<Card
										className="grid h-full grid-rows-[13rem,auto] overflow-hidden rounded-4 border border-stroke-weak bg-background-raised shadow-raised"
										{...event.data}
										id={id}
										link={link}
									/>
								</li>
							);
						}
					}
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
