import { cn } from "@acdh-oeaw/style-variants";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { ButtonGroupProps } from "react-multi-carousel";

import { Button } from "#/components/ui/button.tsx";

/**
 * `outside` places the buttons next to the carousel, `inside` overlays them on top of it, which avoids horizontal
 * overflow when the carousel spans the full width of its container.
 */
export type CarouselButtonPlacement = "inside" | "outside";

interface CarouselButtonGroupProps extends ButtonGroupProps {
	placement?: CarouselButtonPlacement;
}

const placementStyles = {
	outside: {
		previous: "left-0 translate-x-[-125%] lg:-translate-x-1/2",
		next: "right-0 translate-x-[125%] lg:translate-x-1/2",
	},
	inside: {
		previous: "left-0 translate-x-1/4",
		next: "right-0 -translate-x-1/4",
	},
} satisfies Record<CarouselButtonPlacement, { next: string; previous: string }>;

export function CarouselButtonGroup(props: Readonly<CarouselButtonGroupProps>): ReactNode {
	const { next, placement = "outside", previous, carouselState } = props;

	if (!carouselState) {
		return null;
	}

	const { totalItems, slidesToShow, currentSlide } = carouselState;

	const isLastElement = currentSlide + slidesToShow >= totalItems;
	const isFirstElement = currentSlide === 0;

	const styles = placementStyles[placement];

	return (
		<>
			<Button
				aria-label="previous"
				className={cn("absolute inset-bs-1/2 z-1000 -translate-y-1/2", styles.previous, isFirstElement && "hidden")}
				onClick={previous}
				variant="carousel-button"
			>
				<ChevronLeftIcon />
			</Button>
			<Button
				aria-label="next"
				className={cn("absolute inset-bs-1/2 z-1000 -translate-y-1/2", styles.next, isLastElement && "hidden")}
				onClick={next}
				variant="carousel-button"
			>
				<ChevronRightIcon />
			</Button>
		</>
	);
}
