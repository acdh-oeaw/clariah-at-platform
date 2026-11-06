import { createUrl } from "@acdh-oeaw/lib";
import type { MetadataRoute } from "next";

import { env } from "#/configs/env.config.ts";

/** Crawlers are disallowed unless explicitly enabled, so preview deployments are never indexed. */
export default function robots(): MetadataRoute.Robots {
	if (env.NEXT_PUBLIC_APP_BOTS !== "enabled") {
		return {
			rules: {
				disallow: "/",
				userAgent: "*",
			},
		};
	}

	return {
		rules: {
			allow: "/",
			userAgent: "*",
		},
		sitemap: String(createUrl({ baseUrl: env.NEXT_PUBLIC_APP_BASE_URL, pathname: "/sitemap.xml" })),
	};
}
