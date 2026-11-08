import { useExtracted, useLocale } from "next-intl";
import type { ReactNode } from "react";

import { LocaleSwitcher } from "#/app/(app)/[locale]/_components/locale-switcher.tsx";
import { Disclosure, DisclosureGroup, DisclosureHeader, DisclosurePanel } from "#/components/disclosure.tsx";
import { Link } from "#/components/link.tsx";
import { NavMenuItem, NavMenuSeparator } from "#/components/ui/nav-menu.tsx";
import { localizeHref } from "#/lib/navigation/convert.ts";
import type { NavigationConfig } from "#/lib/navigation/navigation.ts";

interface NavigationMobileProps {
	navigation: NavigationConfig;
	handleMobileMenuToggle: () => void;
	localeSwitcherLabel: string;
}

export function NavigationMobile(props: Readonly<NavigationMobileProps>): ReactNode {
	const { navigation, handleMobileMenuToggle, localeSwitcherLabel } = props;

	const locale = useLocale();
	const t = useExtracted();

	return (
		/** Full-width items inset their focus outline, which the scroll container would otherwise clip at the sides. */
		<div className="overflow-y-auto bg-white fixed top-16 bottom-0 inset-x-0 z-10 flex flex-col w-screen lg:hidden">
			<DisclosureGroup>
				<ul role="list" className="flex flex-col w-full pt-6">
					{Object.entries(navigation).map(([id, item]) => {
						switch (item.type) {
							case "link": {
								return (
									<li key={id}>
										<Link
											className="px-6 py-2 font-heading text-regular -outline-offset-2"
											href={item.href}
											onClick={handleMobileMenuToggle}
											target={item.target}
											variant="block"
										>
											{item.label}
										</Link>
									</li>
								);
							}

							case "menu": {
								return (
									<li key={id}>
										<Disclosure>
											<DisclosureHeader>{item.label}</DisclosureHeader>
											{/* The panel is already a group named by its header button. */}
											<DisclosurePanel>
												<ul role="list">
													{item.children &&
														Object.entries(item.children).map(([id, item]) => {
															switch (item.type) {
																case "action": {
																	return (
																		<NavMenuItem
																			key={id}
																			className="h-11 flex items-center"
																			onAction={item.onAction}
																			onClick={handleMobileMenuToggle}
																		>
																			{item.label}
																		</NavMenuItem>
																	);
																}

																case "link": {
																	return (
																		<NavMenuItem
																			key={id}
																			className="h-11 flex items-center"
																			href={item.href}
																			onClick={handleMobileMenuToggle}
																			target={item.target}
																		>
																			{item.label}
																		</NavMenuItem>
																	);
																}

																case "separator": {
																	return <NavMenuSeparator key={id} />;
																}
															}
														})}
												</ul>
											</DisclosurePanel>
										</Disclosure>
									</li>
								);
							}

							case "action":
							case "separator": {
								return null;
							}
						}
					})}
				</ul>
			</DisclosureGroup>
			<Link
				className="px-6 py-4 font-heading text-regular -outline-offset-2"
				href={localizeHref("/search", locale)}
				onClick={handleMobileMenuToggle}

				variant="block"
			>
				{t("Suche")}
			</Link>
			<div className="w-full px-6 py-4">
				<LocaleSwitcher label={localeSwitcherLabel} />
			</div>
		</div>
	);
}
