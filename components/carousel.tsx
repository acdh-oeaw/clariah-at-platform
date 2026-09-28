import "react-multi-carousel/lib/styles.css";

import { cn } from "@acdh-oeaw/style-variants";
import type { ReactNode } from "react";
import ReactMultiCarousel, { type ResponsiveType } from "react-multi-carousel";

import { CarouselButtonGroup, type CarouselButtonPlacement } from "#/components/carousel-button-group.tsx";

interface CarouselProps {
	buttonPlacement?: CarouselButtonPlacement;
	children: ReactNode;
	className?: string;
	/** Applied to the element wrapping the carousel and its navigation buttons. */
	containerClassName?: string;
	breakpoints?: ResponsiveType;
}

const DEFAULT_BREAKPOINTS = {
	mobile: {
		breakpoint: { max: 1280, min: 0 },
		items: 2,
		slidesToSlide: 1,
	},
	desktop: {
		breakpoint: { min: 1280, max: 7680 },
		items: 3,
		slidesToSlide: 1,
	},
};

export function Carousel(props: Readonly<CarouselProps>): ReactNode {
	const { buttonPlacement, children, breakpoints, className, containerClassName, ...rest } = props;

	return (
		<div className={cn("relative block-fit inline-fit", containerClassName)}>
			<ReactMultiCarousel
				arrows={false}
				className={className}
				customButtonGroup={<CarouselButtonGroup placement={buttonPlacement} />}
				draggable={true}
				keyBoardControl={true}
				partialVisible={false}
				renderButtonGroupOutside={true}
				responsive={breakpoints ?? DEFAULT_BREAKPOINTS}
				{...rest}
			>
				{children}
			</ReactMultiCarousel>
		</div>
	);
}
