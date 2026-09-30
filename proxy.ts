import type { NextProxy, ProxyConfig } from "next/server";

import { middleware as i18nMiddleware } from "#/lib/i18n/middleware.ts";

export const proxy: NextProxy = i18nMiddleware;

export const config: ProxyConfig = {
	matcher: ["/", "/(de|en)/:path*"],
};
