import { cn } from "@acdh-oeaw/style-variants";
import type { ReactNode } from "react";

import { ApiImage } from "#/components/image.tsx";
import type { ImageAsset } from "#/lib/images/variants.ts";

export interface GalleryItemProps {
	caption?: ReactNode;
	className?: string;
	image: ImageAsset;
	/** Set by whichever layout places the item, since the grid and the carousel size it differently. */
	sizes: string;
}

export function GalleryItem(props: Readonly<GalleryItemProps>): ReactNode {
	const { caption, className, image, sizes } = props;

	return (
		<figure className={cn("flex flex-col gap-y-2", className)}>
			<ApiImage className="ms-auto me-auto inline-auto max-block-96 max-inline-full" image={image} sizes={sizes} />
			{caption != null && <figcaption className="text-small text-gray-900">{caption}</figcaption>}
		</figure>
	);
}
