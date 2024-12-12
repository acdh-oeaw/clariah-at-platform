import type { MetadataRoute } from "next";
import { getTranslations } from "next-intl/server";

import { defaultLocale } from "@/config/i18n.config";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
	const meta = await getTranslations({ locale: defaultLocale, namespace: "metadata" });

	return {
		name: meta("manifest.name"),
		short_name: meta("manifest.short-name"),
		description: meta("manifest.description"),
		start_url: "/",
		display: "standalone",
		background_color: "#fff",
		theme_color: "#fff",
		icons: [
			{
				src: "/icon.svg",
				sizes: "any",
				type: "image/svg+xml",
			},
			{
				src: "/icon-maskable.svg",
				sizes: "any",
				type: "image/svg+xml",
				purpose: "maskable",
			},
			{
				src: "/android-chrome-192x192.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				src: "/android-chrome-512x512.png",
				sizes: "512x512",
				type: "image/png",
			},
		],
	};
}
