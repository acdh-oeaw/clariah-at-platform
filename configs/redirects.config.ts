import type { NextConfig } from "next";

import { legacyRedirects } from "#/configs/legacy-redirects.config.ts";

type Redirects = Awaited<ReturnType<NonNullable<NextConfig["redirects"]>>>;

export const redirects: Redirects = [
	...legacyRedirects,
	{
		/** The previous website linked its feed without a locale prefix, in its footer and `<head>`. */
		source: "/feed.xml",
		destination: "/de/feed.xml",
		permanent: true,
	},
];
