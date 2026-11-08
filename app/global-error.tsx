"use client";

import { NextIntlClientProvider } from "next-intl";
import { useParams } from "next/navigation";
import { type ReactNode, Suspense, use } from "react";

import { ErrorState } from "#/app/(app)/[locale]/_components/error-state.tsx";
import { HtmlDocument } from "#/app/(app)/_components/html-document.tsx";
import { StatusLogo } from "#/app/(app)/_components/status-state.tsx";
import { type IntlLocale, defaultLocale, isValidLocale, timeZone } from "#/lib/i18n/locales.ts";
import { getIntlMessages } from "#/lib/i18n/messages.ts";

/** `use` needs the same promise on every render. */
const messagesByLocale = new Map<IntlLocale, ReturnType<typeof getIntlMessages>>();

function getMessages(locale: IntlLocale): ReturnType<typeof getIntlMessages> {
	const messages = messagesByLocale.get(locale) ?? getIntlMessages(locale);
	messagesByLocale.set(locale, messages);
	return messages;
}

interface TranslatedErrorStateProps {
	error: unknown;
	locale: IntlLocale;
}

function TranslatedErrorState(props: Readonly<TranslatedErrorStateProps>): ReactNode {
	const { error, locale } = props;

	const messages = use(getMessages(locale));

	return (
		<NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
			<ErrorState error={error}>
				<StatusLogo />
			</ErrorState>
		</NextIntlClientProvider>
	);
}

interface GlobalErrorPageProps {
	error: unknown;
}

/** Replaces the root layout along with its translations, so they are loaded here, and only when needed. */
export default function GlobalErrorPage(props: Readonly<GlobalErrorPageProps>): ReactNode {
	const { error } = props;

	const { locale } = useParams();
	const intlLocale = isValidLocale(locale) ? locale : defaultLocale;

	return (
		<HtmlDocument locale={intlLocale}>
			<body>
				<Suspense>
					<TranslatedErrorState error={error} locale={intlLocale} />
				</Suspense>
			</body>
		</HtmlDocument>
	);
}
