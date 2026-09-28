"use client";

import cn from "clsx/lite";
import { ChevronDownIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from "react-aria-components";

import { NavLink as BaseNavLink } from "#/components/nav-link.tsx";
import { useNavMenuTrigger } from "#/components/ui/nav-menu.tsx";

export { NavMenu, NavMenuItem, NavMenuItems, NavMenuSeparator } from "#/components/ui/nav-menu.tsx";

interface NavLinkProps extends ComponentProps<typeof BaseNavLink> {}

export function NavLink(props: Readonly<NavLinkProps>): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<BaseNavLink
			{...rest}
			className={cn(
				"inline-flex items-center rounded-xs px-2.5 py-1 text-sm font-medium text-neutral-700 transition",
				"hover:bg-neutral-50 hover:text-neutral-950",
				"pressed:bg-neutral-50 pressed:text-neutral-950",
				"outline-0 outline-offset-2 outline-primary-600 focus-visible:outline-2 forced-colors:outline-[Highlight]",
				className,
			)}
		>
			{children}
		</BaseNavLink>
	);
}

interface NavMenuButtonProps extends Omit<AriaButtonProps, "children"> {
	children: ReactNode;
}

export function NavMenuButton(props: Readonly<NavMenuButtonProps>): ReactNode {
	const { children, className, ...rest } = props;

	const triggerProps = useNavMenuTrigger();

	return (
		<AriaButton
			{...triggerProps}
			{...rest}
			className={cn(
				"group inline-flex items-center gap-x-1.5 rounded-xs px-2.5 py-1 text-sm font-medium text-neutral-700 transition",
				"hover:bg-neutral-50 hover:text-neutral-950",
				"pressed:bg-neutral-50 pressed:text-neutral-950",
				"outline-0 outline-offset-2 outline-primary-600 focus-visible:outline-2 forced-colors:outline-[Highlight]",
				className,
			)}
		>
			{children}
			<ChevronDownIcon
				aria-hidden={true}
				className="size-3.5 shrink-0 text-neutral-600 transition group-hover:text-neutral-900 group-pressed:text-neutral-900 group-aria-expanded:rotate-180"
			/>
		</AriaButton>
	);
}
