import { type GetRequestConfigParams, getRequestConfig } from "next-intl/server";
import { locale } from "next/root-params";

import { formats } from "#/lib/i18n/formats.ts";
import { type IntlLocale, defaultLocale, isValidLocale, timeZone } from "#/lib/i18n/locales.ts";
import { getIntlMessages } from "#/lib/i18n/messages.ts";

async function getIntlLocale(params: GetRequestConfigParams): Promise<IntlLocale> {
	if (params.locale != null) {
		return params.locale;
	}

	const curLocale = await locale();

	return isValidLocale(curLocale) ? curLocale : defaultLocale;
}

// oxlint-disable-next-line import/no-default-export
export default getRequestConfig(async (params) => {
	const locale = await getIntlLocale(params);
	const messages = await getIntlMessages(locale);

	return {
		formats,
		locale,
		messages,
		timeZone,
	};
});
