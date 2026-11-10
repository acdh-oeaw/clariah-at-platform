import type { NextProxy, ProxyConfig } from "next/server";

import { middleware as i18nMiddleware } from "#/lib/i18n/middleware.ts";

export const proxy: NextProxy = i18nMiddleware;

export const config: ProxyConfig = {
	matcher: [
		/**
		 * The rss feed, which the file extension pattern below would otherwise skip. The middleware has to rewrite the
		 * public locale prefix (e.g. `/de`) to the locale (e.g. `de-AT`) for the `[locale]` route handler to match.
		 */
		"/:prefix/feed.xml",
		"/((?!api/|og-images/|health$|_next/|_vercel/|.*\\.(?:avif|css|csv|gif|ico|jpe?g|js|json|pdf|png|svg|txt|webmanifest|webp|woff2?|xml)$).*)",
	],
};
