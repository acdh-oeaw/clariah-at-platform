import cn from "clsx/lite";
import type { ComponentProps, ReactNode } from "react";

import { pageColumnClassName } from "#/app/(app)/[locale]/_components/page-column.ts";
import { ApiImage } from "#/components/image.tsx";

interface DetailCardProps {
	children: ReactNode;
	/** Added to, not replacing, the padded body's own classes — e.g. to cap the line length of running text. */
	className?: string;
	/** Required on some entity types, optional on others, so `null` simply renders no image. */
	image: ComponentProps<typeof ApiImage>["image"] | null;
	title: string;
}

/**
 * A detail page's content as one white card: the entity's image across the top, then its title as the page's `h1`.
 * `PageLayout`'s banner title is a `p` on detail pages for exactly this reason.
 */
export function DetailCard(props: Readonly<DetailCardProps>): ReactNode {
	const { children, className, image, title } = props;

	return (
		<section className={pageColumnClassName}>
			<div className="flex flex-col rounded-md bg-white shadow-card mb-8 md:mb-16">
				{image != null ? (
					<ApiImage
						className="aspect-[2/1] max-h-100 w-full rounded-t-md border-b border-stroke-weak object-cover"
						fetchPriority="high"
						image={image}
						loading="eager"
						preload={true}
						/** The width of `pageColumnClassName`, without its padding. */
						sizes="(min-width: 40rem) min(calc(100vw - 4rem), 76rem), calc(100vw - 2rem)"
					/>
				) : null}
				<div className={cn("flex flex-col gap-y-8 px-6 py-8 sm:p-10 md:gap-y-12 lg:p-16", className)}>
					<h1 className="text-h2 md:text-h1">{title}</h1>
					{children}
				</div>
			</div>
		</section>
	);
}
