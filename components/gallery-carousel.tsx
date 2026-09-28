"use client";

import type { ReactNode } from "react";
import type { ResponsiveType } from "react-multi-carousel";

import { Carousel } from "#/components/carousel.tsx";
import { GalleryItem, type GalleryItemProps } from "#/components/gallery-item.tsx";

interface GalleryCarouselProps {
	items: Array<Omit<GalleryItemProps, "sizes">>;
}

const BREAKPOINTS = {
	mobile: {
		breakpoint: { max: 1280, min: 0 },
		items: 1,
		slidesToSlide: 1,
	},
	desktop: {
		breakpoint: { min: 1280, max: 7680 },
		items: 1,
		slidesToSlide: 1,
	},
} satisfies ResponsiveType;

export function GalleryCarousel(props: Readonly<GalleryCarouselProps>): ReactNode {
	const { items } = props;

	return (
		<Carousel breakpoints={BREAKPOINTS} buttonPlacement="inside" className="w-full" containerClassName="w-full">
			{items.map((item, index) => (
				<GalleryItem
					// oxlint-disable-next-line react/no-array-index-key
					key={index}
					caption={item.caption}
					image={item.image}
					/** One slide at every breakpoint, so a slide is the whole content column. */
					sizes="(min-width: 80rem) 1150px, 100vw"
				/>
			))}
		</Carousel>
	);
}
