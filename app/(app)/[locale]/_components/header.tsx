import { assert } from "@acdh-oeaw/lib";
import cn from "clsx/lite";
import { getExtracted, getLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { Navigation } from "#/app/(app)/[locale]/_components/navigation.tsx";
import { cachedNavigation } from "#/lib/data/api-cache";
import { convertNavigationMenu, localizeHref } from "#/lib/navigation/convert.ts";
import type { NavigationConfig, NavigationLink } from "#/lib/navigation/navigation.ts";

export async function Header(): Promise<ReactNode> {
	const t = await getExtracted();
	const locale = await getLocale();
	const label = t("Main");

	const response = await cachedNavigation(locale);
	//const { primary } = navigation();
	const navigation = response.find((menu) => menu.name === "primary");
	assert(navigation != null, "Missing primary navigation.");

	const items: NavigationConfig & { home: NavigationLink } = {
		home: {
			type: "link",
			label: t("Startseite"),
			href: localizeHref("/", locale),
		},
		...convertNavigationMenu(navigation.items, locale),
	};

	return (
		<header className={cn("z-10 bg-white")}>
			<div className="container flex-1 gap-x-12 px-8 py-4 sm:px-16">
				<Navigation
					drawerCloseLabel={t("Schließen")}
					drawerOpenLabel={t("Menu öffnen")}
					label={label}
					localeSwitcherLabel={t("Sprache")}
					navigation={items}
				/>
			</div>
		</header>
	);
}
