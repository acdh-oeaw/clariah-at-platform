"use client";

import { useExtracted } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useCallback } from "react";

import { SearchView, type SearchViewParams } from "#/app/(app)/[locale]/(default)/_components/search-view.tsx";
import { searchParams } from "#/app/(app)/[locale]/(default)/news/search-params.ts";
import { Card } from "#/components/card";
import { getAssetImageUrl } from "#/lib/data/api-client";
import type { IntlLocale } from "#/lib/i18n/locales.ts";
import { localizeHref } from "#/lib/navigation/convert.ts";
import type { WebsiteDocument } from "#/lib/search/index.ts";
import { getSearchService } from "#/lib/search/service.ts";
import type { SearchOutcome, SearchParams } from "#/lib/search/use-search.ts";

interface NewsSearchProps {
	locale: IntlLocale;
}

function toRawSearchParams(params: SearchViewParams): { q: string; page: number } {
	return { q: params.query, page: params.page };
}

function toSearchViewParams(raw: { q: string; page: number }): SearchViewParams {
	return { facets: {}, page: raw.page, query: raw.q };
}

export function NewsSearch(props: Readonly<NewsSearchProps>): ReactNode {
	const { locale } = props;
	const t = useExtracted();
	const pathname = usePathname();
	const router = useRouter();
	const rawSearchParams = useSearchParams();

	/**
	 * No local state: `params` is derived fresh from the url on every render, not mirrored into a `useState` that would
	 * need manual syncing. `router.replace` below already updates the url; `useSearchParams` reactively reflects that on
	 * the very next render, so there is nothing else to keep in sync by hand.
	 */
	const params = toSearchViewParams(searchParams.parse(rawSearchParams));

	function getHref(nextParams: SearchViewParams): string {
		const { query } = searchParams.encode(toRawSearchParams(nextParams));
		return query !== "" ? `${pathname}?${query}` : pathname;
	}

	function onParamsChange(nextParams: SearchViewParams): void {
		router.replace(getHref(nextParams), { scroll: false });
	}

	// `document.link` is root-relative and locale-less, like `EntityRef.href` from the CMS API — prefix it the same way.
	function renderItem(document: WebsiteDocument): ReactNode {
		const link = document.link != null && document.link !== "" ? localizeHref(document.link, locale) : undefined;
		const image =
			document.image_key !== ""
				? {
						alt: document.image_alt ?? null,
						height: document.image_height ?? null,
						mimeType: document.image_mime_type ?? "",
						srcUrl: getAssetImageUrl("images", document.image_key),
						width: document.image_width ?? null,
					}
				: null;

		return <Card image={image} link={link} summary={document.description} title={document.label} />;
	}

	// Depends on `locale`, so it stays referentially stable across re-renders unless the page's own locale changes.
	const search = useCallback(
		async (searchParameters: SearchParams): Promise<SearchOutcome<WebsiteDocument> | null> => {
			const result = await getSearchService().collections.website.search({
				...searchParameters,
				filters: [
					{ operator: "equals", field: "type", value: "news-item" },
					{ operator: "equals", field: "locale", value: locale },
				],
			});
			return result.isOk() ? result.value : null;
		},
		[locale],
	);

	return (
		<SearchView<WebsiteDocument>
			getHref={getHref}
			label={t("Aktuelles durchsuchen")}
			onParamsChange={onParamsChange}
			params={params}
			renderItem={renderItem}
			search={search}
		/>
	);
}
