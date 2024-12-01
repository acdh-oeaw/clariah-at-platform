import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import {
	AppNavigation,
	AppNavigationMobile,
	type NavigationItem,
} from "@/app/(app)/[locale]/_components/app-navigation";
import { ColorSchemeSwitcher } from "@/app/(app)/[locale]/_components/color-scheme-switcher";
import { LocaleSwitcher } from "@/app/(app)/[locale]/_components/locale-switcher";
import { createHref } from "@/lib/create-href";

export function AppHeader(): ReactNode {
	const t = useTranslations("AppHeader");

	const label = t("navigation-primary");

	const navigation = {
		home: {
			type: "link",
			href: createHref({ pathname: "/" }),
			label: t("links.home"),
		},
		about: {
			type: "link",
			href: createHref({ pathname: "/about" }),
			label: t("links.about"),
		},
	} satisfies Record<string, NavigationItem>;

	return (
		<header className="layout-grid border-b border-stroke-weak bg-fill-weaker">
			<div className="flex justify-between gap-x-12">
				<AppNavigation label={label} navigation={navigation} />
				<AppNavigationMobile
					label={label}
					menuCloseLabel={t("navigation-menu-close")}
					menuOpenLabel={t("navigation-menu-open")}
					menuTitleLabel={t("navigation-menu")}
					navigation={navigation}
				/>

				<div className="flex items-center gap-x-6">
					<ColorSchemeSwitcher />
					<LocaleSwitcher />
				</div>
			</div>
		</header>
	);
}
