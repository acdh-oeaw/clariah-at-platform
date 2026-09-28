"use client";

import { cn } from "@acdh-oeaw/style-variants";
import {
	type ReactNode,
	type RefObject,
	createContext,
	use,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { useFocusWithin, useInteractOutside, useOverlayPosition } from "react-aria";
import {
	Button as AriaButton,
	Disclosure as AriaDisclosure,
	DisclosurePanel as AriaDisclosurePanel,
	type DisclosurePanelProps as AriaDisclosurePanelProps,
	type DisclosureProps as AriaDisclosureProps,
} from "react-aria-components";

import { NavLink } from "#/components/nav-link.tsx";

/**
 * Navigation menus follow the disclosure pattern, i.e. a toggle button which shows and hides a list of links, instead
 * of the menu pattern, which is intended for application menus.
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/
 */

interface NavMenuContextValue {
	close: () => void;
	panelRef: RefObject<HTMLDivElement | null>;
	triggerRef: RefObject<HTMLButtonElement | null>;
}

const NavMenuContext = createContext<NavMenuContextValue | null>(null);

const triggerAttribute = "data-nav-menu-trigger";

export interface NavMenuTriggerProps {
	[triggerAttribute]: true;
	ref: RefObject<HTMLButtonElement | null>;
	slot: "trigger";
}

/**
 * Props which need to be added to the toggle button of a `NavMenu`. Returns `undefined` when the button is not rendered
 * inside a `NavMenu`.
 */
export function useNavMenuTrigger(): NavMenuTriggerProps | undefined {
	const navMenu = use(NavMenuContext);

	if (navMenu == null) {
		return undefined;
	}

	return { [triggerAttribute]: true, ref: navMenu.triggerRef, slot: "trigger" };
}

export interface NavMenuProps extends Omit<
	AriaDisclosureProps,
	"children" | "className" | "defaultExpanded" | "isExpanded"
> {
	/** Which edge of the toggle button the menu is aligned to. @default "start" */
	align?: "end" | "start";
	children: ReactNode;
	className?: string;
}

export function NavMenu(props: Readonly<NavMenuProps>): ReactNode {
	const { align = "start", children, className, onExpandedChange, ...rest } = props;

	const [isExpanded, setIsExpanded] = useState(false);

	const ref = useRef<HTMLDivElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);

	const close = useCallback((): void => {
		if (!isExpanded) {
			return;
		}

		setIsExpanded(false);
		onExpandedChange?.(false);
	}, [isExpanded, onExpandedChange]);

	/**
	 * Close, and move focus back to the toggle button when it would otherwise be lost on the elements which are about to
	 * be hidden.
	 */
	const closeAndRestoreFocus = useCallback((): void => {
		const hasFocusWithin = ref.current?.contains(document.activeElement) === true;

		close();

		if (hasFocusWithin) {
			triggerRef.current?.focus();
		}
	}, [close]);

	/** Close when clicking or tapping outside of the menu. Fires on click, not on pointer down. */
	useInteractOutside({ isDisabled: !isExpanded, onInteractOutside: close, ref });

	/** Whether a pointer is currently pressed. */
	const isPointerDownRef = useRef(false);

	useEffect(() => {
		if (!isExpanded) {
			return;
		}

		const onPointerDown = (): void => {
			isPointerDownRef.current = true;
		};

		const onPointerUp = (): void => {
			isPointerDownRef.current = false;
		};

		document.addEventListener("pointerdown", onPointerDown, true);
		document.addEventListener("pointerup", onPointerUp, true);
		document.addEventListener("pointercancel", onPointerUp, true);

		return () => {
			document.removeEventListener("pointerdown", onPointerDown, true);
			document.removeEventListener("pointerup", onPointerUp, true);
			document.removeEventListener("pointercancel", onPointerUp, true);
		};
	}, [isExpanded]);

	/** Close when focus moves outside of the menu. */
	const { focusWithinProps } = useFocusWithin({
		onBlurWithin(event) {
			/**
			 * Pressing another menu's toggle button moves focus away on pointer down, but that menu only opens when the press
			 * completes. Closing right away would leave no menu open while the pointer is held down, which reads as lag. Keep
			 * this menu open instead, and let `useInteractOutside` close it when the click completes.
			 *
			 * Moving focus to another toggle button with the keyboard closes immediately, as there is no click which would
			 * eventually close this menu.
			 */
			if (
				isPointerDownRef.current &&
				event.relatedTarget instanceof Element &&
				event.relatedTarget.closest(`[${triggerAttribute}]`) != null
			) {
				return;
			}

			close();
		},
	});

	/**
	 * Position the menu below its toggle button, and shift it back into view when it would otherwise overflow the
	 * viewport. Also closes the menu when a scrollable ancestor of the toggle button - including the page itself - is
	 * scrolled.
	 *
	 * Note that this must run in the component which renders the `Disclosure`, not in the one which renders the panel:
	 * react-aria measures the panel in a layout effect, and effects of child components run first, i.e. before the
	 * `Disclosure` unhides the panel.
	 */
	useOverlayPosition({
		containerPadding: 16,
		isOpen: isExpanded,
		offset: 8,
		onClose: closeAndRestoreFocus,
		overlayRef: panelRef,
		placement: align === "end" ? "bottom end" : "bottom start",
		targetRef: triggerRef,
	});

	/** Close on `Escape`, and move focus back to the toggle button. */
	useEffect(() => {
		if (!isExpanded) {
			return;
		}

		const onKeyDown = (event: KeyboardEvent): void => {
			if (event.key !== "Escape") {
				return;
			}

			closeAndRestoreFocus();
		};

		document.addEventListener("keydown", onKeyDown);

		return () => {
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [closeAndRestoreFocus, isExpanded]);

	const context = useMemo(() => {
		return { close, panelRef, triggerRef };
	}, [close]);

	return (
		<NavMenuContext value={context}>
			<div ref={ref} {...focusWithinProps}>
				<AriaDisclosure
					{...rest}
					/**
					 * Deliberately _not_ a containing block for the menu: react-aria clamps the menu to the boundary element (the
					 * document) as if the containing block was aligned with it, so a containing block which is offset from the
					 * document origin shifts the whole allowed region by that offset.
					 */
					className={className}
					isExpanded={isExpanded}
					onExpandedChange={(isExpanded) => {
						setIsExpanded(isExpanded);
						onExpandedChange?.(isExpanded);
					}}
				>
					{children}
				</AriaDisclosure>
			</div>
		</NavMenuContext>
	);
}

export interface NavMenuItemsProps extends Omit<AriaDisclosurePanelProps, "className"> {
	className?: string;
}

export function NavMenuItems(props: Readonly<NavMenuItemsProps>): ReactNode {
	const { children, className, ...rest } = props;

	const navMenu = use(NavMenuContext);

	return (
		<AriaDisclosurePanel
			{...rest}
			ref={navMenu?.panelRef}
			className={cn(
				/**
				 * Position and max height are set by `useOverlayPosition` in `NavMenu`. Until it has measured, the menu falls
				 * back to its static position, i.e. directly below the toggle button.
				 */
				"absolute z-20 overflow-auto border border-black/10 bg-white shadow-2xl inline-max",
				className,
			)}
		>
			<ul className="flex flex-col py-2" role="list">
				{children}
			</ul>
		</AriaDisclosurePanel>
	);
}

const navMenuItemStyles = cn(
	"cursor-pointer rounded-none bg-transparent px-5 py-1 font-normal",
	"data-focus-visible:outline-3",
	"pressed:bg-transparent pressed:outline-none",
);

export interface NavMenuItemProps {
	children: ReactNode;
	className?: string;
	href?: string;
	onAction?: () => void;
	onClick?: () => void;
	target?: "_blank";
}

export function NavMenuItem(props: Readonly<NavMenuItemProps>): ReactNode {
	const { children, className, href, onAction, onClick, target } = props;

	const navMenu = use(NavMenuContext);

	const onSelect = (): void => {
		onClick?.();
		navMenu?.close();
	};

	return (
		<ul>
			<li>
				{href != null ? (
					<NavLink
						className={cn(navMenuItemStyles, className)}
						href={href}
						onClick={onSelect}
						target={target}
						variant="unstyled"
					>
						{children}
					</NavLink>
				) : (
					<AriaButton
						className={cn(navMenuItemStyles, "text-start inline-full", className)}
						onPress={() => {
							onAction?.();
							onSelect();
						}}
					>
						{children}
					</AriaButton>
				)}
			</li>
		</ul>
	);
}

export function NavMenuSeparator(): ReactNode {
	return (
		<li>
			<hr className="mx-3 my-1 border-b border-neutral-300" />
		</li>
	);
}
