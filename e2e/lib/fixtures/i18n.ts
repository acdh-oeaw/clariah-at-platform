import type { Page } from "@playwright/test";
import { createFormatter, createTranslator } from "next-intl";

import { type IntlLocale, defaultLocale, getIntlLanguage } from "#/lib/i18n/locales.ts";
import type { IntlMessages } from "#/lib/i18n/messages.ts";
import type messages from "#/messages/en.json";

export interface I18n {
	t: ReturnType<typeof createTranslator<IntlMessages>>;
	format: ReturnType<typeof createFormatter>;
	messages: IntlMessages;
}

export async function createI18n(_page: Page, locale = defaultLocale): Promise<I18n> {
	const messages = await getIntlMessages(locale);

	return {
		t: createTranslator({ locale, messages }),
		format: createFormatter({ locale }),
		messages,
	};
}

export type WithI18n<T> = T & { i18n: I18n };

/**
 * Copied from `#/lib/i18n/messages.ts` because `playwright` needs import attributes for json imports — `.po` files load
 * fine in the app via next-intl's own build-time plugin, but not through playwright's transform. `messages/*.json` are
 * generated from `messages/*.po` by `pnpm i18n:convert-messages`; run that first if a `.po` file changed.
 */

type Messages = typeof messages;

async function getIntlMessages(locale: IntlLocale): Promise<Messages> {
	const language = getIntlLanguage(locale);

	if (language === "de") {
		// Default language: no JSON is generated, source strings are used as-is.
		return {} as Messages;
	}

	const { default: messages } = (await import("#/messages/en.json", {
		with: { type: "json" },
	})) as { default: Messages };

	return messages;
}
