"use client";

import { type GetVariantProps, cn, styles } from "@acdh-oeaw/style-variants";
import { type ReactNode, useId } from "react";
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
			/** Frames are borders: outlines are only for the focus indicator, see `styles/index.css`. */
			primary: cn("border-2 bg-white font-bold inline-58.75 *:px-4.5 *:py-2.5", "hover:border-white hover:text-white"),
			secondary: cn(
				"border-2 border-white font-bold text-primary-1000 *:px-4.5 *:py-0.5",
				"hover:bg-primary-600 hover:text-white",
			),
			outline: cn(
				"rounded-md border-2 border-primary-1000 font-bold text-primary-1000 inline-fit *:px-4.5 *:py-0.5",
				"hover:border-primary-600 hover:bg-primary-600 hover:text-white",
			),
			"outline-white": cn(
				"rounded-md border-2 border-white font-bold text-white inline-fit *:px-4.5 *:py-0.5",
				"hover:bg-white hover:text-primary-1000",
			),
			/** Disclosures span their scroll container, which would clip an outline drawn outside of them. */
			disclosure: cn(
				"gap-2 bg-transparent px-2 py-4 text-gray-900 -outline-offset-2 max-inline-screen [&_svg]:fill-gray-900",
				"hover:underline",
				"data-expanded:bg-gray-200 data-expanded:font-medium data-expanded:text-black",
			),
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
				{startIcon}
				{renderProps.children}
				{endIcon}
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

	const labelId = useId();
	return (
		<Link aria-labelledby={labelId} {...rest} className={buttonStyles({ className, variant })} variant="unstyled">
			<span id={labelId}>
				{startIcon}
				{children}
				{endIcon}
			</span>
		</Link>
	);
}
