"use client";

import cn from "clsx/lite";
import type { ReactNode } from "react";
import {
	OverlayArrow as AriaOverlayArrow,
	Popover as AriaPopover,
	type PopoverProps as AriaPopoverProps,
	composeRenderProps,
} from "react-aria-components";

export interface PopoverProps extends Omit<AriaPopoverProps, "children"> {
	showArrow?: boolean;
	children: React.ReactNode;
}

export function Popover(props: Readonly<PopoverProps>): ReactNode {
	const { children, showArrow, className, ...rest } = props;

	const offset = showArrow === true ? 12 : 8;

	return (
		<AriaPopover
			offset={offset}
			{...rest}
			className={composeRenderProps(className, (className) =>
				cn(
					"rounded-xl border border-black/10 bg-white bg-clip-padding font-body text-neutral-700 shadow-2xl outline-0 forced-colors:bg-[Canvas]",
					"entering:animate-in entering:duration-200 entering:ease-out entering:fade-in entering:placement-left:slide-in-from-right-1 entering:placement-right:slide-in-from-left-1 entering:placement-top:slide-in-from-bottom-1 entering:placement-bottom:slide-in-from-top-1",
					"exiting:animate-out exiting:duration-150 exiting:ease-in exiting:fade-out exiting:placement-left:slide-out-to-right-1 exiting:placement-right:slide-out-to-left-1 exiting:placement-top:slide-out-to-bottom-1 exiting:placement-bottom:slide-out-to-top-1",
					className,
				),
			)}
		>
			{showArrow === true ? (
				<AriaOverlayArrow className="group">
					<svg
						className="block fill-white stroke-black/10 stroke-1 group-placement-left:-rotate-90 group-placement-right:rotate-90 group-placement-bottom:rotate-180 forced-colors:fill-[Canvas] forced-colors:stroke-[ButtonBorder]"
						height={12}
						viewBox="0 0 12 12"
						width={12}
					>
						<path d="M0 0 L6 6 L12 0" />
					</svg>
				</AriaOverlayArrow>
			) : null}
			{children}
		</AriaPopover>
	);
}
