import { cn } from "@acdh-oeaw/style-variants";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { DateComponent } from "@/components/date";
import { Image } from "@/components/image";
import { Link } from "@/components/link";
import type { Locale } from "@/config/i18n.config";
import type { CardProps } from "@/types/keystatic";

type CardComponentProps = CardProps & {
	className?: string;
	link?: {
		label: string;
		href: string;
	};
	summary: {
		title?: string;
		content: string;
	};
	title: string;
	endDate?: string | null;
	startDate?: string | null;
	locale: Locale;
	location?: string;
};

export function Card(props: Readonly<CardComponentProps>): ReactNode {
	const _t = useTranslations("Card");

	const {
		className,
		discriminent,
		endDate,
		link,
		locale,
		location,
		summary,
		startDate,
		title,
		...rest
	} = props;

	const defaultClassNames =
		"relative overflow-hidden rounded-4 border border-stroke-weak bg-background-raised shadow-raised hover:shadow-overlay";

	return (
		<article className={cn(defaultClassNames, className)}>
			{"image" in rest ? (
				<Image
					alt=""
					className={cn("size-full border-b border-stroke-weak", {
						"object-cover": discriminent !== "organisation",
						"object-contain": discriminent === "organisation",
					})}
					height={300}
					/** Preload image because it's the largest contentful paint (lcp) element. */
					priority={true}
					src={rest.image.src}
					unoptimized={true}
					width={400}
				/>
			) : null}
			<div className="grid gap-y-6 p-8">
				<div className="flex flex-col">
					<h3 className="pb-2 font-heading text-heading-4 font-strong text-text-strong">
						{
							// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
							summary.title || title
						}
					</h3>
					{startDate ? (
						<p className="grow text-small text-text-weak">
							<span>
								<DateComponent date={startDate} dateLocale={locale} />
								{endDate ? " - " : null}
								{endDate ? <DateComponent date={endDate} dateLocale={locale} /> : null}
							</span>
						</p>
					) : null}
					{location ? <p className="grow text-small text-text-weak">{location}</p> : null}
					<div>
						<p className="line-clamp-3 grow text-small text-text-weak">{summary.content}</p>
					</div>
					<footer>
						{link !== undefined && (
							<Link
								className={cn(
									"my-4 inline-flex min-h-12 w-fit rounded-2 border border-stroke-strong bg-fill-strong px-4 py-2.5 font-strong text-text-inverse-strong",
									"focus-visible:focus-outline pressed:press-overlay after:absolute after:inset-0",
								)}
								href={link.href}
							>
								{link.label || _t("read-more")}
							</Link>
						)}
					</footer>
				</div>
			</div>
		</article>
	);
}
