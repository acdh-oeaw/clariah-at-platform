"use client";

import type { UrlObject } from "node:url";

import { type GetVariantProps, cn, styles } from "@acdh-oeaw/style-variants";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import NextLink, { type LinkProps as NextLinkProps } from "next/link";
import { type ComponentProps, type ElementType, Fragment, type ReactNode } from "react";
import { Link as AriaLink, type LinkProps as AriaLinkProps } from "react-aria-components";

export const linkStyles = styles({
	base: [],
	variants: {
		variant: {
			primary: cn(
				"gap-2 py-2",
				"inline-fit hover:underline hover:decoration-[10%] hover:underline-offset-[24%]",
				"focus-visible:underline focus-visible:decoration-[3px] focus-visible:underline-offset-[24%] focus-visible:[&>svg]:fill-black",
				"focus-visible:outline-none",
			),
			secondary: cn(
				"inline-fit",
				"focus-visible:underline focus-visible:decoration-[3px] focus-visible:underline-offset-[24%]",
				"focus-visible:outline-none",
			),
			tertiary: cn(
				"gap-2 text-[14px] inline-fit",
				"hover:underline hover:decoration-2 hover:underline-offset-[24%]",
				"focus-visible:underline focus-visible:decoration-[3px] focus-visible:underline-offset-[24%]",
				"focus-visible:outline-none",
				"disabled:[&>span]:text-black",
			),
			"color-bg": cn(
				"gap-2 bg-transparent text-white block-11 [&>svg]:fill-white",
				"hover:underline",
				"focus-visible:underline focus-visible:decoration-[3px]",
				"focus-visible:outline-none",
			),
			paragraph: cn(
				"gap-2 text-[18px] underline inline-fit",
				"hover:text-black hover:[&>svg]:fill-black",
				"focus-visible:underline focus-visible:decoration-[3px] focus-visible:underline-offset-[24%] focus-visible:[&>svg]:fill-black",
				"focus-visible:outline-none",
			),
			"breadcrumb-current": "cursor-default! text-[14px] text-black",
			unstyled: "",
		},
	},
	defaults: {
		variant: "primary",
	},
});

type LinkStyleProps = GetVariantProps<typeof linkStyles>;

export interface LinkProps
	extends
		LinkStyleProps,
		Pick<NextLinkProps, "prefetch" | "replace" | "scroll" | "shallow">,
		Omit<AriaLinkProps, "elementType" | "href" | "routerOptions" | "slot">,
		Pick<ComponentProps<"a">, "aria-current" | "id"> {
	href?: Exclude<NextLinkProps["href"], UrlObject>;
	children?: ReactNode;
	withDefaultLeftIcon?: boolean;
	withDefaultRightIcon?: boolean;
	startIcon?: ReactNode;
	endIcon?: ReactNode;
}

export function Link(props: Readonly<LinkProps>): ReactNode {
	const {
		children,
		className,
		variant,
		startIcon,
		endIcon,
		withDefaultLeftIcon = false,
		withDefaultRightIcon = false,
		...rest
	} = props;

	const ChildrenWrapper: ElementType = variant === "unstyled" ? Fragment : "span";

	return (
		<AriaLink
			{...rest}
			className={(renderProps) => linkStyles({ ...renderProps, className, variant })}
			render={(domProps, renderProps) => {
				if ("href" in domProps && domProps.href && !renderProps.isDisabled) {
					return <NextLink {...domProps} />;
				}

				return (
					<span
						{...domProps}
						// @ts-expect-error -- Link may be disabled but have `href`.
						href={undefined}
					/>
				);
			}}
		>
			{withDefaultLeftIcon ? <ChevronLeftIcon /> : null}
			{startIcon}
			<ChildrenWrapper>{children}</ChildrenWrapper>
			{endIcon}
			{withDefaultRightIcon ? <ChevronRightIcon /> : null}
		</AriaLink>
	);
}
