import { ArrowRightIcon } from "lucide-react";
import { useExtracted } from "next-intl";
import type { ReactNode } from "react";

import { ApiImage } from "#/components/image.tsx";
import { LinkButton } from "#/components/ui/button";
import type { ImageAsset } from "#/lib/images/variants.ts";

interface CardProps {
	image: ImageAsset | null;
	title: string;
	summary: string | null;
	link?: string;
}

export function Card(props: CardProps): ReactNode {
	const { image, link, title, summary } = props;
	const t = useExtracted();
	return (
		<article className="grid group relative h-full grid-rows-[14rem_1fr_auto] overflow-hidden rounded-md bg-white shadow-card">
			{image && (
				<ApiImage
					alt=""
					className="size-full border-b border-stroke-weak object-cover"
					height={300}
					/** Preload image because it's the largest contentful paint (lcp) element. */
					preload={true}
					image={image}
					width={400}
				/>
			)}
			<div className="flex flex-col gap-y-6 p-8">
				<div className="flex flex-col gap-y-2">
					<h3 className="text-h3 pb-3">{title}</h3>
					<p className="text-text-weak line-clamp-3">{summary}</p>
				</div>
			</div>
			<LinkButton
				className="after:absolute after:inset-0 after:z-20 w-full justify-between hover:bg-primary-500 hover:text-white bg-primary-200 px-8 py-4"
				endIcon={<ArrowRightIcon className="group-hover:translate-x-1.5 ease-in-out transition-transform" />}
				href={link}
				variant="unstyled"
			>
				{t("mehr lesen")}
			</LinkButton>
		</article>
	);
}
