import { cn } from "@acdh-oeaw/style-variants";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import React, { type ReactNode, use } from "react";
import {
	Disclosure as AriaDisclosure,
	DisclosureGroup as AriaDisclosureGroup,
	type DisclosureGroupProps as AriaDisclosureGroupProps,
	DisclosurePanel as AriaDisclosurePanel,
	type DisclosurePanelProps as AriaDisclosurePanelProps,
	type DisclosureProps as AriaDisclosureProps,
	DisclosureStateContext,
} from "react-aria-components";

import { Button } from "#/components/ui/button.tsx";

export interface DisclosureGroupProps extends AriaDisclosureGroupProps {
	children?: React.ReactNode;
}

export function DisclosureGroup({ children, ...props }: Readonly<DisclosureGroupProps>): ReactNode {
	return <AriaDisclosureGroup {...props}>{children}</AriaDisclosureGroup>;
}

export interface DisclosureProps extends AriaDisclosureProps {
	children?: React.ReactNode;
}

export function Disclosure({ children, ...props }: Readonly<DisclosureProps>): ReactNode {
	return <AriaDisclosure {...props}>{children}</AriaDisclosure>;
}

export interface DisclosureHeaderProps {
	children?: React.ReactNode;
	variant?: "color-bg" | "white-bg";
}

export function DisclosureHeader({ children, variant = "color-bg" }: Readonly<DisclosureHeaderProps>): ReactNode {
	const { isExpanded } = use(DisclosureStateContext)!;
	return (
		<Button
			className="w-full font-heading uppercase text-regular *:flex *:justify-between!"
			data-expanded={isExpanded || undefined}
			endIcon={isExpanded ? <ChevronUpIcon className="size-6" /> : <ChevronDownIcon className="size-6" />}
			slot="trigger"
			variant={variant === "color-bg" ? "disclosure-color-bg" : "disclosure-white-bg"}
		>
			<span className="max-w-[90%] line-clamp-1 text-left">{children}</span>
		</Button>
	);
}

export interface DisclosurePanelProps extends AriaDisclosurePanelProps {
	children: React.ReactNode;
}

export function DisclosurePanel({ children, ...props }: Readonly<DisclosurePanelProps>): ReactNode {
	return (
		<AriaDisclosurePanel {...props} className={cn(props.className, "flex flex-col gap-2 bg-white py-4")}>
			{children}
		</AriaDisclosurePanel>
	);
}
