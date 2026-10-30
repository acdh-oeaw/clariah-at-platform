import cn from "clsx/lite";
import type { ComponentProps, ReactNode } from "react";

import { pageColumnClassName } from "#/app/(app)/[locale]/_components/page-column.ts";
import { ApiImage } from "#/components/api-image.tsx";

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
			<div className="flex flex-col rounded-md bg-white shadow-card md:mb-16">
				{image != null ? (
					<ApiImage
						className="max-h-100 w-full rounded-t-md object-cover"
						fetchPriority="high"
						image={image}
						loading="eager"
						preload={true}
					/>
				) : null}
				<div className={cn("p-16", className)}>
					<h1 className="text-h1">{title}</h1>
					{children}
				</div>
			</div>
		</section>
	);
}
