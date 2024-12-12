import "server-only";

import { getRequestConfig } from "next-intl/server";

import { defaultLocale, formats, isValidLocale } from "@/config/i18n.config";

export default getRequestConfig(async ({ requestLocale }) => {
	const _locale = await requestLocale;
	const locale = _locale == null || !isValidLocale(_locale) ? defaultLocale : _locale;

	const timeZone = "UTC";

	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const _messages = await import(`@/messages/${locale}.json`);

	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const _metadata = await import(`@/content/${locale}/metadata/index.json`);

	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
	const messages = { metadata: _metadata.default, ..._messages.default } as IntlMessages;

	return {
		formats,
		locale,
		messages,
		timeZone,
	};
});
