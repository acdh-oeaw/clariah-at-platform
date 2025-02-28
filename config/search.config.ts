import type { Locale } from "@/config/i18n.config";

export const hitsPerPage = 50;

export function filters(locale: Locale) {
	return `(kind:[pages, events, news, projects] && language:"${locale}") || kind:![pages, events, news, projects]`;
}
