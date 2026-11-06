import type { MetadataRoute } from "next";

import { cachedSiteMetadata } from "#/lib/data/api-cache.ts";
import { defaultLocale } from "#/lib/i18n/locales.ts";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
	const site = await cachedSiteMetadata(defaultLocale);

	return {
		name: site.title,
		short_name: site.title,
		description: site.description.trim(),
		lang: defaultLocale,
		start_url: "/",
		display: "standalone",
		background_color: "#fff",
		theme_color: "#fff",
		icons: [
			{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
			{ src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
			{ src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
		],
	};
}
