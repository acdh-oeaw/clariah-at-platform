import type { ReactNode } from "react";

import { GalleryItem, type GalleryItemProps } from "#/components/gallery-item.tsx";

interface GalleryGridProps {
	items: Array<Omit<GalleryItemProps, "sizes">>;
}

export function GalleryGrid(props: Readonly<GalleryGridProps>): ReactNode {
	const { items } = props;

	return (
		<ul className="grid grid-cols-[repeat(auto-fill,minmax(min(22.5rem,100%),1fr))] items-start gap-6" role="list">
			{items.map((item, index) => (
				// oxlint-disable-next-line react/no-array-index-key
				<li key={index}>
					<GalleryItem
						caption={item.caption}
						image={item.image}
						/**
						 * The track is `auto-fill` over a 22.5rem minimum, so the column count follows the content column rather
						 * than the viewport and cannot be stated exactly. These are the counts that minimum works out to at each
						 * breakpoint.
						 */
						sizes="(min-width: 80rem) 33vw, (min-width: 48rem) 50vw, 100vw"
					/>
				</li>
			))}
		</ul>
	);
}
