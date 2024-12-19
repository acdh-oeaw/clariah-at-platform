import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import {
	AppNavigation,
	AppNavigationMobile,
} from "@/app/(app)/[locale]/_components/app-navigation";
import { ColorSchemeSwitcher } from "@/app/(app)/[locale]/_components/color-scheme-switcher";
import { LocaleSwitcher } from "@/app/(app)/[locale]/_components/locale-switcher";
import { createHref } from "@/lib/create-href";
import { createSingletonResource } from "@/lib/keystatic/resources";

export async function AppHeader(): Promise<ReactNode> {
	const locale = await getLocale();
	const t = await getTranslations({ locale, namespace: "AppHeader" });
	const label = t("navigation-primary");

	const navigation = await createSingletonResource("navigation", locale).read();
	const { links } = navigation.data;
	const home = {
		type: "link",
		href: createHref({ pathname: "/" }),
		label: t("links.home"),
	} as const;

	return (
		<header className="layout-grid border-b border-stroke-weak bg-fill-weaker">
			<div className="flex justify-between gap-x-12">
				<AppNavigation home={home} label={label} navigation={links} />
				<AppNavigationMobile
					home={home}
					label={label}
					menuCloseLabel={t("navigation-menu-close")}
					menuOpenLabel={t("navigation-menu-open")}
					menuTitleLabel={t("navigation-menu")}
					navigation={links}
				/>

				<div className="flex items-center gap-x-6">
					<ColorSchemeSwitcher />
					<LocaleSwitcher />
				</div>
			</div>
		</header>
	);
}
