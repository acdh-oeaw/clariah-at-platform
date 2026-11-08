import { HttpError, createUrl, createUrlSearchParams, isErr, request } from "@acdh-oeaw/lib";
import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { richTextClassName } from "#/components/rich-text.tsx";
import { env } from "#/configs/env.config.ts";
import type { IntlLocale } from "#/lib/i18n/locales.ts";

/**
 * The imprint service has no webhook, so nothing expires this entry on demand. `revalidate` alone would not keep the
 * text current: the first visitor after it passes still gets the old text, however old that is. `expire` is what bounds
 * the age on a page with hardly any traffic, because past it the next visitor waits for a fresh copy.
 */
async function getImprintHtml(locale: IntlLocale): Promise<string | null> {
	"use cache";
	cacheLife("hours");

	const url = createUrl({
		baseUrl: env.NEXT_PUBLIC_APP_IMPRINT_SERVICE_BASE_URL,
		pathname: `/${String(env.NEXT_PUBLIC_APP_SERVICE_ID)}`,
		searchParams: createUrlSearchParams({
			locale,
			redmine: env.NEXT_PUBLIC_APP_IMPRINT_CUSTOM_CONFIG,
		}),
	});

	const result = await request(url, { responseType: "text" });

	if (isErr(result)) {
		const error = result.error;

		/** `notFound()` cannot cross the cache boundary. */
		if (HttpError.is(error) && error.response.status === 404) {
			return null;
		}

		throw error;
	}

	return result.value.data;
}

interface AcdhImprintProps {
	locale: IntlLocale;
}

export async function AcdhImprint(props: Readonly<AcdhImprintProps>): Promise<ReactNode> {
	const { locale } = props;

	const html = await getImprintHtml(locale);

	if (html == null) {
		notFound();
	}

	return <div className={richTextClassName} dangerouslySetInnerHTML={{ __html: html }} />;
}
