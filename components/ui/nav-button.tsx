"use client";

import { cn } from "@acdh-oeaw/style-variants";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import React, { type ElementType, type ReactNode, use } from "react";
import {
	Button as AriaButton,
	type ButtonProps as AriaButtonProps,
	DisclosureStateContext,
} from "react-aria-components";

import { NavLink } from "#/components/nav-link.tsx";
import { useNavMenuTrigger } from "#/components/ui/nav-menu.tsx";

interface NavButtonProps extends Omit<AriaButtonProps, "children"> {
	isLinkElement?: boolean;
	children: ReactNode;
	active?: boolean;
	href?: string;
	target?: "_blank";
}

export function NavButton(props: Readonly<NavButtonProps>): ReactNode {
	const { isLinkElement = false, children, href, className, active = false, target, ...rest } = props;
	const ElementType: ElementType = isLinkElement ? NavLink : AriaButton;

	/** Only set when the button is the toggle button of a `NavMenu`. */
	const navMenuTriggerProps = useNavMenuTrigger();
	const triggerProps = isLinkElement ? undefined : navMenuTriggerProps;

	const isExpanded = use(DisclosureStateContext)?.isExpanded === true;

	return (
		<ElementType
			{...triggerProps}
			{...rest}
			className={cn(
				"group flex cursor-pointer items-center gap-1 border-[3px] border-transparent bg-transparent p-1.25 [&>svg]:block-5 [&>svg]:inline-5",
				"hover:bg-white",
				"data-focus-visible:outline-none",
				"aria-expanded:bg-white",
				className,
			)}
			data-active={active || undefined}
			href={href}
			target={target}
		>
			{children}
			{isExpanded ? (
				<ChevronUpIcon aria-hidden={true} className={isLinkElement ? "hidden" : "shrink-0"} />
			) : (
				<ChevronDownIcon aria-hidden={true} className={isLinkElement ? "hidden" : "shrink-0"} />
			)}
		</ElementType>
	);
}
