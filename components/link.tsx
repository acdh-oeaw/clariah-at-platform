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
			primary: cn("gap-2 py-2", "inline-fit hover:underline hover:decoration-[10%] hover:underline-offset-[24%]"),
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
		Pick<NextLinkProps, "prefetch" | "replace" | "scroll">,
		Omit<AriaLinkProps, "className" | "elementType" | "href" | "render" | "routerOptions" | "slot">,
		Pick<ComponentProps<"a">, "aria-current" | "id"> {
	href?: Exclude<NextLinkProps["href"], UrlObject>;
	children?: ReactNode;
	className?: string;
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
		hrefLang,
		prefetch,
		replace,
		scroll,
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
					/** `domProps` only holds what react aria forwards, which leaves out these props. */
					return <NextLink {...domProps} hrefLang={hrefLang} prefetch={prefetch} replace={replace} scroll={scroll} />;
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
