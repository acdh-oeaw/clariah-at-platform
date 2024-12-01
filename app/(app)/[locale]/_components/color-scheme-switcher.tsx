import { useTranslations } from "next-intl";
import { type ReactNode, useMemo } from "react";

import { ColorSchemeSelect } from "@/app/(app)/[locale]/_components/color-scheme-select-loader";
import type { ColorScheme } from "@/lib/color-scheme-script";

export function ColorSchemeSwitcher(): ReactNode {
	const t = useTranslations("ColorSchemeSwitcher");

	const items = useMemo(() => {
		return Object.fromEntries(
			(["system", "light", "dark"] as const).map((id) => {
				return [id, t(`color-schemes.${id}`)];
			}),
		) as Record<ColorScheme | "system", string>;
	}, [t]);

	return <ColorSchemeSelect items={items} label={t("change-color-scheme")} />;
}
