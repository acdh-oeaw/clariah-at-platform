import type { NextProxy, ProxyConfig } from "next/server";

import { middleware as i18nMiddleware } from "#/lib/i18n/middleware.ts";

export const proxy: NextProxy = i18nMiddleware;

export const config: ProxyConfig = {
	matcher: [
		"/((?!api/|health$|_next/|_vercel/|.*\\.(?:avif|css|csv|gif|ico|jpe?g|js|json|pdf|png|svg|txt|webmanifest|webp|woff2?|xml)$).*)",
	],
};
