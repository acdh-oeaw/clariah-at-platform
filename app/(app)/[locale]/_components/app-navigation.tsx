"use client";

import { cn } from "@acdh-oeaw/style-variants";
import type { Entry } from "@keystatic/core/reader";
import { ChevronDownIcon, ChevronRightIcon, MenuIcon, XIcon } from "lucide-react";
import { PrefetchKind } from "next/dist/client/components/router-reducer/router-reducer-types";
import { Fragment, type ReactNode } from "react";
import { chain } from "react-aria";
import {
	Button,
	Dialog,
	DialogTrigger,
	Disclosure,
	DisclosurePanel,
	Heading,
	Menu,
	MenuItem,
	type MenuItemProps,
	MenuTrigger,
	Modal,
	ModalOverlay,
	Popover,
	Separator,
} from "react-aria-components";

import { Logo } from "@/components/logo";
import { NavLink, type NavLinkProps } from "@/components/nav-link";
import type keystaticConfig from "@/keystatic.config";
import { createHref } from "@/lib/create-href";
import { useRouter } from "@/lib/i18n/navigation";
import { getLinkProps } from "@/lib/keystatic/get-link-props";

type NavigationProps = Entry<(typeof keystaticConfig)["singletons"]["en:navigation"]>["links"];

interface NavigationLink {
	type: "link";
	href: NonNullable<NavLinkProps["href"]>;
	label: string;
}

interface NavigationSeparator {
	type: "separator";
}

interface NavigationMenu {
	type: "menu";
	label: string;
	children: Record<string, NavigationLink | NavigationSeparator>;
}

export type NavigationItem = NavigationLink | NavigationSeparator | NavigationMenu;

interface AppNavigationProps {
	label: string;
	home: NavigationLink;
	//navigation: { home: NavigationLink } & Record<string, NavigationItem>;
	navigation: NavigationProps;
}

export function AppNavigation(props: Readonly<AppNavigationProps>): ReactNode {
	const { label, home, navigation } = props;

	return (
		<nav aria-label={label} className="hidden md:flex md:gap-x-12">
			<NavLink
				className={cn(
					"-ml-2 grid shrink-0 place-content-center self-center rounded-2 p-2",
					"interactive focus-visible:focus-outline",
				)}
				href={home.href}
			>
				<Logo className="h-12 w-auto text-text-strong" />
				<span className="sr-only">{home.label}</span>
			</NavLink>

			<ul className="flex flex-wrap text-small" role="list">
				{navigation.map((navigationItem, idx) => {
					const key = `nav-item-${String(idx)}`;
					switch (navigationItem.discriminant) {
						case "link": {
							const { label, link } = navigationItem.value;
							const { download: _, href: path } = getLinkProps(link);
							const href = createHref({ pathname: path });
							return (
								<li key={key}>
									<NavLink
										className={cn(
											"inline-flex px-4 py-6 text-text-strong",
											"interactive focus-visible:focus-outline hover:hover-overlay pressed:press-overlay",
											"aria-[current]:select-overlay aria-[current]:select-overlay-border-bottom",
										)}
										href={href}
									>
										{label}
									</NavLink>
								</li>
							);
						}

						case "separator": {
							return (
								<Separator
									key={key}
									className="mx-1 h-full border-l border-stroke-weak"
									elementType="li"
									orientation="vertical"
								/>
							);
						}

						case "menu": {
							const { value: menu } = navigationItem;
							return (
								<li key={key}>
									<MenuTrigger>
										<Button
											className={cn(
												"inline-flex items-center gap-x-2 px-4 py-6 text-text-strong",
												"interactive focus-visible:focus-outline hover:hover-overlay pressed:press-overlay",
											)}
										>
											{menu.label}
											<ChevronDownIcon
												aria-hidden={true}
												className="size-6 shrink-0 text-icon-neutral"
											/>
										</Button>
										<Popover
											className={cn(
												"min-w-[var(--trigger-width)] rounded-2 border border-stroke-weak bg-background-overlay shadow-overlay",
												"placement-bottom:translate-y-1 placement-bottom:slide-in-from-top-2 entering:animate-in entering:fade-in-0 exiting:animate-out exiting:fade-out-0 exiting:zoom-out-95",
											)}
											placement="bottom"
										>
											<Menu className="max-h-[inherit] min-w-40 overflow-auto py-2">
												{Object.entries(menu.items).map(([id, item]) => {
													switch (item.discriminant) {
														case "link": {
															const { label, link } = item.value;
															const { download: _, href: path } = getLinkProps(link);
															const href = createHref({ pathname: path });
															return (
																<NavigationMenuItem
																	key={id}
																	className={cn(
																		"flex cursor-pointer select-none items-center gap-x-3 px-4 py-3 text-small text-text-strong",
																		"interactive focus-visible:focus-outline focus-visible:-focus-outline-offset-2 hover:hover-overlay pressed:press-overlay",
																	)}
																	href={href}
																	textValue={label}
																>
																	{label}
																</NavigationMenuItem>
															);
														}

														case "separator": {
															return (
																<Separator
																	key={id}
																	className="my-1 w-full border-b border-stroke-weak"
																/>
															);
														}
													}
												})}
											</Menu>
										</Popover>
									</MenuTrigger>
								</li>
							);
						}
					}
				})}
			</ul>
		</nav>
	);
}

interface NavigationMenuItemProps extends MenuItemProps {
	href: string;
}

function NavigationMenuItem(props: Readonly<NavigationMenuItemProps>): ReactNode {
	const { href, onHoverStart } = props;

	const router = useRouter();

	/**
	 * Adds prefetch behavior similar to `next/link`.
	 *
	 * @see https://github.com/vercel/next.js/discussions/73381
	 *
	 * @see https://github.com/adobe/react-spectrum/blob/main/packages/react-aria-components/src/Link.tsx
	 * @see https://github.com/adobe/react-spectrum/blob/main/packages/%40react-aria/link/src/useLink.ts
	 */
	function prefetch() {
		router.prefetch(href, { kind: PrefetchKind.AUTO });
	}

	return (
		<MenuItem
			{...props}
			// @ts-expect-error @see https://github.com/adobe/react-spectrum/issues/7453
			onFocus={chain(prefetch, props.onFocus)}
			onHoverStart={chain(prefetch, onHoverStart)}
		/>
	);
}

interface AppNavigationMobileProps {
	label: string;
	menuCloseLabel: string;
	menuOpenLabel: string;
	menuTitleLabel: string;
	navigation: NavigationProps;
}

export function AppNavigationMobile(props: Readonly<AppNavigationMobileProps>): ReactNode {
	const { label, menuCloseLabel, menuOpenLabel, menuTitleLabel, navigation } = props;

	return (
		<DialogTrigger>
			<nav aria-label={label} className="flex items-center py-3 md:hidden">
				<Button
					className={cn(
						"-ml-3 grid place-content-center rounded-2 p-3",
						"interactive focus-visible:focus-outline focus-visible:focus-outline-offset-0 hover:hover-overlay pressed:press-overlay",
					)}
				>
					<MenuIcon aria-hidden={true} className="size-6 shrink-0 text-icon-neutral" />
					<span className="sr-only">{menuOpenLabel}</span>
				</Button>
			</nav>
			<ModalOverlay
				className={cn(
					"fixed left-0 top-0 isolate z-20 h-[var(--visual-viewport-height)] w-full bg-fill-overlay",
					"entering:duration-200 entering:ease-out entering:animate-in entering:fade-in",
					"exiting:duration-200 exiting:ease-in exiting:animate-out exiting:fade-out",
				)}
				isDismissable={true}
			>
				<Modal
					className={cn(
						"mr-12 size-full max-h-full max-w-sm bg-background-overlay shadow-overlay forced-colors:bg-[Canvas]",
						"entering:duration-200 entering:ease-out entering:animate-in entering:slide-in-from-left",
						"exiting:duration-200 exiting:ease-in exiting:animate-out exiting:slide-out-to-left",
					)}
				>
					<Dialog className="relative h-full max-h-[inherit] overflow-auto">
						{({ close }) => {
							return (
								<Fragment>
									<header className="p-6">
										<Heading className="sr-only" slot="title">
											{menuTitleLabel}
										</Heading>
										<Button
											className={cn(
												"-my-3 -ml-3 grid place-content-center rounded-2 p-3",
												"interactive focus-visible:focus-outline focus-visible:focus-outline-offset-0 hover:hover-overlay pressed:press-overlay",
											)}
											slot="close"
										>
											<XIcon aria-hidden={true} className="size-6 shrink-0 text-icon-neutral" />
											<span className="sr-only">{menuCloseLabel}</span>
										</Button>
									</header>
									<ul className="text-small" role="list">
										{navigation.map((navigationItem, idx) => {
											const key = `nav-item-${String(idx)}`;
											switch (navigationItem.discriminant) {
												case "link": {
													const { label, link } = navigationItem.value;
													const { download: _, href: path } = getLinkProps(link);
													const href = createHref({ pathname: path });
													return (
														<li key={key}>
															<NavLink
																className={cn(
																	"inline-flex w-full px-6 py-3 text-text-strong",
																	"interactive focus-visible:focus-outline focus-visible:-focus-outline-offset-2 hover:hover-overlay pressed:press-overlay",
																	"aria-[current]:hover-overlay aria-[current]:select-overlay",
																)}
																href={href}
																onPress={close}
															>
																{label}
															</NavLink>
														</li>
													);
												}

												case "separator": {
													return (
														<Separator
															key={key}
															className="my-1 w-full border-b border-stroke-weak"
															elementType="li"
														/>
													);
												}

												case "menu": {
													const { value: menu } = navigationItem;
													return (
														<li key={key}>
															<Disclosure>
																<Heading>
																	<Button
																		className={cn(
																			"inline-flex w-full items-center justify-between px-6 py-3 text-text-strong",
																			"interactive focus-visible:focus-outline focus-visible:-focus-outline-offset-2 hover:hover-overlay pressed:press-overlay",
																			"expanded:hover-overlay expanded:select-overlay",
																		)}
																		slot="trigger"
																	>
																		{menu.label}
																		<ChevronRightIcon
																			aria-hidden={true}
																			className="size-5 shrink-0"
																		/>
																	</Button>
																</Heading>
																<DisclosurePanel>
																	<ul role="list">
																		{Object.entries(menu.items).map(([id, item]) => {
																			switch (item.discriminant) {
																				case "link": {
																					const { label, link } = item.value;
																					const { download: _, href: path } = getLinkProps(link);
																					const href = createHref({ pathname: path });
																					return (
																						<li key={id}>
																							<NavLink
																								className={cn(
																									"inline-flex w-full px-6 py-3 text-text-strong",
																									"interactive focus-visible:focus-outline focus-visible:-focus-outline-offset-2 hover:hover-overlay pressed:press-overlay",
																									"aria-[current]:hover-overlay aria-[current]:select-overlay",
																								)}
																								href={href}
																								onPress={close}
																							>
																								{label}
																							</NavLink>
																						</li>
																					);
																				}

																				case "separator": {
																					return (
																						<Separator
																							key={id}
																							className="my-1 w-full border-b border-stroke-weak"
																							elementType="li"
																						/>
																					);
																				}
																			}
																		})}
																	</ul>
																</DisclosurePanel>
															</Disclosure>
														</li>
													);
												}
											}
										})}
									</ul>
								</Fragment>
							);
						}}
					</Dialog>
				</Modal>
			</ModalOverlay>
		</DialogTrigger>
	);
}
