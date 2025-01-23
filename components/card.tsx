import { cn } from "@acdh-oeaw/style-variants";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Image } from "@/components/image";
import { Link } from "@/components/link";
import type { CardProps } from "@/types/keystatic";

type CardComponentProps = CardProps & {
	className?: string;
	link?: {
		label: string;
		href: string;
	};
};

export function Card(props: Readonly<CardComponentProps>): ReactNode {
	const _t = useTranslations("Card");

	const { className, title, link, ...rest } = props;

	return (
		<article className={className}>
			{"image" in rest && rest.image != null && (
				<Image
					alt=""
					className="size-full border-b border-stroke-weak object-cover"
					height={300}
					/** Preload image because it's the largest contentful paint (lcp) element. */
					priority={true}
					src={rest.image}
					unoptimized={true}
					width={400}
				/>
			)}
			<div className="grid gap-y-6 p-8">
				<div className="flex flex-col">
					<h3 className="font-heading text-heading-4 font-strong text-text-strong">{title}</h3>
					{"summary" in rest && <p className="grow text-small text-text-weak">{rest.summary}</p>}

					<footer>
						{link !== undefined && (
							<Link
								className={cn(
									"my-4 inline-flex min-h-12 w-fit rounded-2 border border-stroke-strong bg-fill-strong px-4 py-2.5 font-strong text-text-inverse-strong",
									"interactive focus-visible:focus-outline hover:hover-overlay pressed:press-overlay",
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
