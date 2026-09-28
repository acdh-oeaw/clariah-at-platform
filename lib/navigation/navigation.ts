import type { ReactNode } from "react";

export interface NavigationAction {
	type: "action";
	label: string;
	icon?: ReactNode;
	onAction: () => void;
}

export interface NavigationLink {
	type: "link";
	label: string;
	icon?: ReactNode;
	href: string;
	target?: "_blank";
}

export interface NavigationSeparator {
	type: "separator";
}

export type NavigationMenuItem = NavigationLink | NavigationSeparator | NavigationAction;

export interface NavigationMenu {
	type: "menu";
	label: string;
	icon?: ReactNode;
	children?: Record<string, NavigationMenuItem>;
}

export type NavigationItem = NavigationAction | NavigationLink | NavigationSeparator | NavigationMenu;

export type NavigationFooterItem = NavigationMenu;

export type NavigationConfig = Record<string, NavigationItem>;
export type NavigationFooterConfig = Record<string, NavigationFooterItem>;
