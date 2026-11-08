import { ArrowRightIcon } from "lucide-react";
import { useExtracted } from "next-intl";
import type { ReactNode } from "react";

import { CardLink } from "#/components/card-link.tsx";
import { ApiImage } from "#/components/image.tsx";
import type { ImageAsset } from "#/lib/images/variants.ts";

interface CardProps {
	image: ImageAsset | null;
	title: string;
	summary: string | null;
	link?: string;
	/** For cards in the first row only: the image may be the largest contentful paint (lcp) element. */
	preload?: boolean;
}

export function Card(props: CardProps): ReactNode {
	const { image, link, preload = false, title, summary } = props;
	const t = useExtracted();
	return (
		<article className="grid group relative h-full grid-rows-[14rem_1fr_auto] overflow-hidden rounded-md bg-white shadow-card">
			{image && (
				<ApiImage
					alt=""
					className="size-full border-b border-stroke-weak object-cover"
					height={300}
					preload={preload}
					image={image}
					/** One column up to `46rem`, two of at most `31rem` up to `68rem`, then three of at most `24rem`. */
					sizes="(min-width: 68rem) 24rem, (min-width: 46rem) 31rem, calc(100vw - 2rem)"
					width={400}
				/>
			)}
			<div className="flex flex-col gap-y-6 p-8">
				<div className="flex flex-col gap-y-2">
					<h3 className="text-h3 pb-3">{title}</h3>
					<p className="text-text-weak line-clamp-3">{summary}</p>
				</div>
			</div>
			<CardLink
				className="after:absolute after:inset-0 after:z-20 w-full justify-between group-hover:bg-primary-500 group-hover:text-white bg-primary-200 px-8 py-4"
				endIcon={<ArrowRightIcon className="group-hover:translate-x-1.5 ease-in-out transition-transform" />}
				href={link}
				variant="unstyled"
			>
				{t("Weiterlesen")}
				{/* Text rather than `aria-labelledby`: lighthouse reads the rendered text, and the name must start with the label. */}
				<span className="sr-only"> {title}</span>
			</CardLink>
		</article>
	);
}
