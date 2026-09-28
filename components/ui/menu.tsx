"use client";

import cn from "clsx/lite";
import { CheckIcon, ChevronRightIcon } from "lucide-react";
import { Children, Fragment, type ReactElement, type ReactNode } from "react";
import {
	Collection as AriaCollection,
	Header as AriaHeader,
	Menu as AriaMenu,
	MenuItem as AriaMenuItem,
	type MenuItemProps as AriaMenuItemProps,
	type MenuProps as AriaMenuProps,
	MenuSection as AriaMenuSection,
	type MenuSectionProps as AriaMenuSectionProps,
	MenuTrigger as AriaMenuTrigger,
	type MenuTriggerProps as AriaMenuTriggerProps,
	type PopoverProps as AriaPopoverProps,
	Separator as AriaSeparator,
	type SeparatorProps as AriaSeparatorProps,
	SubmenuTrigger as AriaSubmenuTrigger,
	type SubmenuTriggerProps as AriaSubmenuTriggerProps,
	composeRenderProps,
} from "react-aria-components";

import { Popover } from "#/components/popover.tsx";

interface MenuProps<T extends object> extends AriaMenuProps<T> {}

export function Menu<T extends object>(props: Readonly<MenuProps<T>>): ReactNode {
	const { className, ...rest } = props;

	return (
		<AriaMenu
			{...rest}
			className={cn(
				"flex flex-col gap-1 overflow-auto rounded-none p-1 font-body outline-0 max-block-[inherit] empty:pbe-2 empty:text-center",
				className,
			)}
		/>
	);
}

export function MenuItem<T extends object>(props: Readonly<AriaMenuItemProps<T>>): ReactNode {
	const { children, className, textValue, ...rest } = props;

	return (
		<AriaMenuItem
			{...rest}
			className={cn(
				"group relative flex cursor-default items-center gap-8 rounded-md px-2.5 py-1.5 text-sm will-change-transform forced-color-adjust-none select-none",
				"outline-0 outline-offset-2 outline-primary-600 focus-visible:outline-2 forced-colors:outline-[Highlight]",
				"disabled:text-neutral-300 forced-colors:disabled:text-[GrayText]",
				"text-neutral-700 -outline-offset-2 hover:bg-neutral-100 pressed:bg-neutral-100",
				"forced-colors:outline-[HighlightText] forced-colors:selected:bg-[Highlight] forced-colors:selected:text-[HighlightText] selected:bg-primary-600 selected:text-white selected:-outline-offset-4 selected:outline-white selected:[&+[data-selected]]:rounded-t-none selected:[&:has(+[data-selected])]:rounded-b-none",
				className,
			)}
			textValue={textValue ?? (typeof children === "string" ? children : undefined)}
		>
			{composeRenderProps(children, (children, renderProps) => {
				const { selectionMode, isSelected, hasSubmenu } = renderProps;

				return (
					<Fragment>
						{selectionMode !== "none" ? (
							<span className="flex w-4 items-center">
								{isSelected ? <CheckIcon aria-hidden={true} className="size-4" /> : null}
							</span>
						) : null}
						<span className="flex flex-1 items-center gap-2 truncate font-normal group-selected:font-semibold">
							{children}
						</span>
						{hasSubmenu ? <ChevronRightIcon aria-hidden={true} className="absolute right-2 size-4" /> : null}
					</Fragment>
				);
			})}
		</AriaMenuItem>
	);
}

interface MenuSeparatorProps extends AriaSeparatorProps {}

export function MenuSeparator(props: Readonly<MenuSeparatorProps>): ReactNode {
	return <AriaSeparator {...props} className="mx-3 my-1 border-b border-neutral-300" />;
}

export interface MenuSectionProps<T extends object> extends AriaMenuSectionProps<T> {
	title?: string;
	items?: Array<T>;
}

export function MenuSection<T extends object>(props: Readonly<MenuSectionProps<T>>): ReactNode {
	const { children, items, title, ...rest } = props;

	return (
		<AriaMenuSection {...rest} className="after:block after:h-1.25 first:-mt-1.25">
			{title != null ? (
				<AriaHeader className="sticky -top-1.25 z-10 -mx-1 -mt-px truncate border-y border-y-neutral-200 bg-neutral-100/60 px-4 py-1 text-sm font-semibold text-neutral-500 backdrop-blur-md select-none supports-[-moz-appearance:none]:bg-neutral-100 [&+*]:mt-1">
					{title}
				</AriaHeader>
			) : null}
			<AriaCollection items={items}>{children}</AriaCollection>
		</AriaMenuSection>
	);
}

interface MenuTriggerProps extends AriaMenuTriggerProps {
	placement?: AriaPopoverProps["placement"];
}

export function MenuTrigger(props: Readonly<MenuTriggerProps>): ReactNode {
	const { children, placement, ...rest } = props;

	// oxlint-disable-next-line react/no-react-children
	const [trigger, menu] = Children.toArray(children) as [ReactElement, ReactElement];

	return (
		<AriaMenuTrigger {...rest}>
			{trigger}
			<Popover className="min-w-38 rounded-none!" placement={placement}>
				{menu}
			</Popover>
		</AriaMenuTrigger>
	);
}

interface SubmenuTriggerProps extends AriaSubmenuTriggerProps {}

export function SubmenuTrigger(props: Readonly<SubmenuTriggerProps>): ReactNode {
	const { children, ...rest } = props;

	// oxlint-disable-next-line react/no-react-children
	const [trigger, menu] = Children.toArray(children) as [ReactElement, ReactElement];

	return (
		<AriaSubmenuTrigger {...rest}>
			{trigger}
			<Popover crossOffset={-4} offset={-2}>
				{menu}
			</Popover>
		</AriaSubmenuTrigger>
	);
}
