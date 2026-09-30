import { SearchIcon } from "lucide-react";
import { useExtracted, useLocale } from "next-intl";
import type { ReactNode } from "react";

import { LocaleSwitcher } from "#/app/(app)/[locale]/_components/locale-swticher.tsx";
import { Link } from "#/components/link.tsx";
import { NavButton } from "#/components/ui/nav-button.tsx";
import { NavMenu, NavMenuItem, NavMenuItems, NavMenuSeparator } from "#/components/ui/nav-menu.tsx";
import { localizeHref } from "#/lib/navigation/convert.ts";
import type { NavigationConfig } from "#/lib/navigation/navigation.ts";

interface NavigationDesktopProps {
	navigation: NavigationConfig;
	localeSwitcherLabel: string;
}

export function NavigationDesktop(props: Readonly<NavigationDesktopProps>): ReactNode {
	const { navigation, localeSwitcherLabel } = props;

	const locale = useLocale();
	const t = useExtracted();

	return (
		<div className="hidden flex-wrap items-center justify-end gap-6 xl:flex 2xl:gap-22">
			<ul className="flex flex-wrap items-center justify-end gap-x-6" role="list">
				{Object.entries(navigation).map(([id, item]) => {
					switch (item.type) {
						case "action": {
							return <li key={id}></li>;
						}

						case "link": {
							return (
								<li key={id}>
									<NavButton href={item.href} isLinkElement={true} target={item.target}>
										{item.label}
									</NavButton>
								</li>
							);
						}

						case "menu": {
							return (
								<li key={id}>
									<NavMenu>
										<NavButton>{item.label}</NavButton>
										<NavMenuItems>
											{item.children &&
												Object.entries(item.children).map(([id, item]) => {
													switch (item.type) {
														case "action": {
															return (
																<NavMenuItem key={id} onAction={item.onAction}>
																	{item.label}
																</NavMenuItem>
															);
														}

														case "link": {
															return (
																<NavMenuItem key={id} href={item.href} target={item.target}>
																	{item.label}
																</NavMenuItem>
															);
														}

														case "separator": {
															return <NavMenuSeparator key={id} />;
														}
													}
												})}
										</NavMenuItems>
									</NavMenu>
								</li>
							);
						}

						case "separator": {
							return <li key={id}></li>;
						}
					}
				})}
			</ul>
			<Link
				href={localizeHref("/search", locale)}
				aria-label={t("Suche")}
				startIcon={<SearchIcon aria-hidden={true} className="size-6" />}
			/>
			<LocaleSwitcher label={localeSwitcherLabel} />
		</div>
	);
}
