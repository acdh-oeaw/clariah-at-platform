import { type LocalePrefix, defineRouting } from "next-intl/routing";

import { defaultLocale, locales } from "#/lib/i18n/locales.ts";

export const localePrefix = {
	mode: "always",
	prefixes: {
		"de-AT": "/de",
		"en-GB": "/en",
	},
} as const satisfies LocalePrefix<typeof locales>;

type GetPrefixes<T> = {
	[K in keyof T]: T[K] extends `/${infer U}` ? U : never;
}[keyof T];

export type Prefixes = GetPrefixes<(typeof localePrefix)["prefixes"]>;

export const routing = defineRouting({
	defaultLocale,
	/**
	 * For GDPR-conformance, the locale cookie is stored as a session cookie, which expires when the browser is closed.
	 * When using an explicit cookie consent banner, the cookie expiration can be adjusted via `maxAge`.
	 */
	// localeCookie: {
	// 	maxAge: 60 * 60 * 24 * 365 /** 1 year. */,
	// },
	/**
	 * Not the middleware's own `Link` response header: a still-open Next.js bug repeatedly appends a full duplicate set
	 * of these after every Cache Components revalidation, eventually growing the header large enough to 502 behind a
	 * reverse proxy (confirmed in production on "/de"). `AlternateLinks` renders the same links as `<link>` tags in the
	 * document head instead.
	 *
	 * @see {@link https://github.com/vercel/next.js/issues/94945}
	 */
	alternateLinks: false,
	localePrefix,
	locales,
});
