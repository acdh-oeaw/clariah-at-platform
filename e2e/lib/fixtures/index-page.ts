/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import type { Locator, Page } from "@playwright/test";

import type { I18n } from "#/e2e/lib/fixtures/i18n.ts";
import { type IntlLocale, defaultLocale } from "#/lib/i18n/locales.ts";
import { localePrefix } from "#/lib/i18n/routing.ts";
// import { getPathname } from "@/lib/i18n/navigation";

/** @see {@link https://github.com/microsoft/playwright/issues/35162} */
function getPathname({ href, locale }: { href: { pathname: string }; locale: IntlLocale }): string {
	return localePrefix.prefixes[locale] + href.pathname;
}

export class IndexPage {
	readonly page: Page;
	readonly locale: IntlLocale;
	readonly i18n: I18n;
	readonly url: string;
	readonly mainContent: Locator;
	readonly title: Locator;
	readonly skipLink: Locator;

	constructor(page: Page, locale = defaultLocale, i18n: I18n) {
		this.page = page;
		this.locale = locale;
		this.i18n = i18n;
		this.url = getPathname({ href: { pathname: "/" }, locale });
		this.mainContent = page.getByRole("main");
		this.title = page.getByRole("heading", { level: 1 });
		this.skipLink = page.getByRole("link", { name: "Zum Hauptinhalt springen" });
	}

	goto() {
		return this.page.goto(this.url);
	}
}
