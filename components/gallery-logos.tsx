import type { ReactNode } from "react";

import { ApiImage } from "#/components/image.tsx";
import type { ImageAsset } from "#/lib/images/variants.ts";

export interface GalleryLogoItemProps {
	/** The row renders no captions, so whatever names a mark has to reach it as alternative text. */
	alt?: string;
	image: ImageAsset;
}

interface GalleryLogosProps {
	items: Array<GalleryLogoItemProps>;
}

/** The shared height cap, in pixels, mirroring `max-block-24` below. */
const logoMaxHeight = 96;

/**
 * A row of organiser or funder marks: a list of things to recognise rather than a set of images to look at. So it is
 * sized by height instead of by column — every logo carries the same optical weight — and the row wraps rather than
 * reflowing into tracks.
 *
 * The cap is a maximum, not a height: a mark smaller than it stays at its natural size, since the variant endpoint does
 * not enlarge and a stretched logo only renders soft. Nor is there a plate behind the marks — they sit on the page
 * background, so a logo authored in dark ink needs its own light backdrop baked in, the way the composite funder strips
 * already carry one.
 */
export function GalleryLogos(props: Readonly<GalleryLogosProps>): ReactNode {
	const { items } = props;

	return (
		<ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6" role="list">
			{items.map((item, index) => (
				// oxlint-disable-next-line react/no-array-index-key
				<li key={index} className="flex items-center">
					<ApiImage
						alt={item.alt}
						className="inline-auto max-block-24 max-inline-full"
						image={item.image}
						sizes={getLogoSizes(item.image)}
					/>
				</li>
			))}
		</ul>
	);
}

/**
 * The width a mark lays out at follows its own aspect ratio against the shared height cap, not a column, so it cannot
 * be stated once for the row the way the grid and the carousel state theirs.
 *
 * It is an upper bound: a mark too wide for the row is clamped to the row instead, which only leaves the declared width
 * a little generous — never short, so nothing renders soft. Naming a plain width rather than a viewport fraction is
 * also what lets the narrow rungs of the ladder be offered at all, which is the point for something 6rem tall.
 *
 * A vector has no resolution to ladder against and is served as-is, so it needs none of this.
 */
function getLogoSizes(image: ImageAsset): string | undefined {
	if (image.width == null || image.height == null || image.height === 0) {
		return undefined;
	}

	return `${String(Math.ceil((image.width / image.height) * logoMaxHeight))}px`;
}
