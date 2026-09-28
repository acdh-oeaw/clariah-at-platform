"use client";

import { type GetVariantProps, cn, styles } from "@acdh-oeaw/style-variants";
import React, { type ReactNode } from "react";
import { useFocusRing, useHover, usePress } from "react-aria";
import {
	Button as AriaButton,
	type ButtonProps as AriaButtonProps,
	composeRenderProps,
	useRenderProps,
} from "react-aria-components";

import { Link, type LinkProps } from "#/components/link.tsx";

export const buttonStyles = styles({
	base: [
		"box-border cursor-pointer p-1.5 *:inline-flex *:items-center *:justify-center *:gap-2 *:block-full *:inline-full",
		"transition-colors duration-200 ease-in-out",
	],
	variants: {
		variant: {
			primary: cn(
				"bg-white font-bold outline-2 inline-58.75 *:px-4.5 *:py-2.5",
				"hover:text-white hover:outline-white",
				"focus:bg-white focus:*:outline-2",
			),
			secondary: cn(
				"font-bold text-primary-1000 outline-2 outline-white *:px-4.5 *:py-0.5",
				"hover:bg-primary-600 hover:text-white",
				"focus:text-white focus:outline-white focus:*:outline-2 focus:*:outline-white",
			),
			outline: cn(
				"rounded-md border-2 border-primary-1000 font-bold text-primary-1000 inline-fit *:px-4.5 *:py-0.5",
				"hover:border-primary-600 hover:bg-primary-600 hover:text-white",
				"focus:outline-0 focus-visible:ring-2 focus-visible:ring-offset-3",
			),
			tertiary: cn(
				"text-white outline-2 outline-white inline-62.75 *:px-4.5 *:py-0.5",
				"hover:bg-white",
				"focus:text-white focus:outline-white focus:*:outline-2 focus:*:outline-white",
			),
			"color-bg": cn(
				"bg-white outline-2 inline-58.75 *:px-4.5 *:py-2.5",
				"hover:text-white hover:outline-white",
				"focus:text-white focus:outline-white focus:*:outline-2 focus:*:outline-white",
			),
			"icon-button": cn(
				"p-2.5 *:p-0!",
				"hover:bg-primary-100",
				"focus:outline-3",
				"pressed:outline-none pressed:[&_svg]:fill-black",
				"disabled:text-gray-400",
			),
			"icon-button-color-bg": cn(
				"bg-transparent p-0! text-white *:p-0",
				"hover:bg-white",
				"focus:bg-transparent focus:text-white focus:outline-white",
				"disabled:text-gray-400",
			),
			"link-primary": cn(
				"gap-2 py-2 font-semibold",
				"inline-fit hover:underline hover:decoration-[10%] hover:underline-offset-[24%]",
				"focus-visible:underline focus-visible:decoration-[3px] focus-visible:underline-offset-[24%] focus-visible:[&>svg]:fill-black",
				"focus-visible:outline-none",
			),
			"disclosure-white-bg": cn(
				"gap-2 bg-transparent px-2 py-4 text-gray-900 max-inline-screen [&_svg]:fill-gray-900",
				"hover:underline",
				"focus-visible:underline focus-visible:decoration-[3px]",
				"focus-visible:outline-none",
				"data-expanded:bg-gray-200 data-expanded:font-medium data-expanded:text-black",
			),
			"disclosure-color-bg": cn(
				"gap-2 bg-transparent px-6! py-4! text-white [&_svg]:fill-white",
				"hover:underline",
				"focus-visible:underline focus-visible:decoration-[3px]",
				"focus-visible:outline-none",
				"data-expanded:bg-gray-200 data-expanded:font-medium data-expanded:text-black",
			),
			"select-button": cn(
				"cursor-pointer rounded-none bg-transparent px-5 py-1 font-normal uppercase",
				"data-focused:outline-3",
				"pressed:bg-transparent pressed:outline-none",
				"active:bg-transparent active:outline-none",
			),
			"carousel-button": cn(
				"px-0 py-3 md:p-3 [&_svg]:fill-white [&_svg]:block-10 [&_svg]:inline-10",
				"hover:bg-white",
				"focus:outline-2 focus:outline-white focus:[&_svg]:fill-white",
				"",
			),
			quiet: "border-transparent bg-transparent text-neutral-800 hover:bg-neutral-200 pressed:bg-neutral-300",
			unstyled: "",
		},
	},
	defaults: {
		variant: "primary",
	},
});

type ButtonStyleProps = GetVariantProps<typeof buttonStyles>;

interface ButtonProps extends AriaButtonProps, ButtonStyleProps {
	startIcon?: ReactNode;
	endIcon?: ReactNode;
}

export function Button(props: Readonly<ButtonProps>): ReactNode {
	const { className, variant, isDisabled, isPending, startIcon, endIcon, ...rest } = props;

	const { isPressed } = usePress({ ...rest });
	const { isHovered } = useHover(rest);
	const { isFocused, isFocusVisible } = useFocusRing();

	const renderProps = useRenderProps({
		...props,
		values: {
			isDisabled: isDisabled === true,
			isPending: isPending ?? false,
			isPressed,
			isHovered,
			isFocused,
			isFocusVisible,
		},
	});

	return (
		<AriaButton
			{...rest}
			className={composeRenderProps(className, (className, renderProps) =>
				buttonStyles({ ...renderProps, className, variant }),
			)}
		>
			<span>
				{variant !== "icon-button" && startIcon}
				{renderProps.children}
				{variant !== "icon-button" && endIcon}
			</span>
		</AriaButton>
	);
}

interface LinkButtonProps
	extends
		Omit<LinkProps, "children" | "endIcon" | "startIcon" | "variant" | "withDefaultLeftIcon" | "withDefaultRightIcon">,
		ButtonStyleProps {
	children?: ReactNode;
	endIcon?: ReactNode;
	startIcon?: ReactNode;
}

export function LinkButton(props: Readonly<LinkButtonProps>): ReactNode {
	const { children, className, endIcon, startIcon, variant, ...rest } = props;

	return (
		<Link {...rest} className={buttonStyles({ className, variant })} variant="unstyled">
			<span>
				{variant !== "icon-button" && startIcon}
				{children}
				{variant !== "icon-button" && endIcon}
			</span>
		</Link>
	);
}
