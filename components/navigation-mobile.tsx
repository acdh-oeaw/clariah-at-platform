import { SearchIcon } from "lucide-react";
import { useExtracted, useLocale } from "next-intl";
import type { ReactNode } from "react";

import { LocaleSwitcher } from "#/app/(app)/[locale]/_components/locale-swticher.tsx";
import { Disclosure, DisclosureGroup, DisclosureHeader, DisclosurePanel } from "#/components/disclosure.tsx";
import { Link } from "#/components/link.tsx";
import { NavMenu, NavMenuSeparator } from "#/components/navigation.tsx";
import { NavMenuItem } from "#/components/ui/nav-menu.tsx";
import { localizeHref } from "#/lib/navigation/convert.ts";
import type { NavigationConfig } from "#/lib/navigation/navigation";

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
		<div className=" bg-primary-700 fixed top-21 bottom-0 inset-x-0 z-10 justify-between flex flex-col w-screen xl:hidden">
			<DisclosureGroup className="flex flex-col w-full">
				{Object.entries(navigation).map(([id, item]) => {
					switch (item.type) {
						case "action": {
							return <li key={id}></li>;
						}

						case "link": {
							return (
								<li key={id}>
									<Link
										className="w-full py-4! px-6! font-heading text-regular h-fit"
										href={item.href}
										onClick={handleMobileMenuToggle}
										target={item.target}
										variant="color-bg"
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
										<DisclosurePanel>
											<NavMenu aria-labelledby={item.label}>
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
											</NavMenu>
										</DisclosurePanel>
									</Disclosure>
								</li>
							);
						}

						case "separator": {
							return <li key={id}></li>;
						}
					}
				})}
			</DisclosureGroup>
			<Link
				className="w-full py-4! px-6! font-heading uppercase text-regular h-fit border-t border-t-gray-100"
				href={localizeHref("/search", locale)}
				onClick={handleMobileMenuToggle}
				startIcon={<SearchIcon className="size-6!" />}
				variant="color-bg"
			>
				{t("Suche")}
			</Link>
			<div className="w-full border-t border-t-gray-100 px-6 py-4">
				<LocaleSwitcher label={localeSwitcherLabel} variant="color-bg" />
			</div>
		</div>
	);
}
