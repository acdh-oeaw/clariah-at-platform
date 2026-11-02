import type { APIRequestContext, Locator, Page } from "@playwright/test";

import { expect, test } from "#/e2e/lib/test.ts";
import { defaultLocale, locales } from "#/lib/i18n/locales.ts";
import { localePrefix } from "#/lib/i18n/routing.ts";

const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa", "best-practice"];

/**
 * Search results are fetched client-side after hydration, so `page.goto` resolving on `load` says nothing about them.
 * `main` keeps the header and footer navigation out of it.
 */
function getSearchResult(page: Page): Locator {
	return page.locator('main ul[role="list"] > li').first();
}

/**
 * Listing pages, which every deployment has regardless of content, each with the element whose presence means its
 * content has rendered.
 */
const listPages: Array<{ pathname: string; getContent: (page: Page) => Locator }> = [
	{ pathname: "/events", getContent: getSearchResult },
	/** Streamed in from the imprint service under `<Suspense>`. */
	{ pathname: "/imprint", getContent: (page) => page.locator("main .prose").first() },
	{ pathname: "/news", getContent: getSearchResult },
	{ pathname: "/projects", getContent: getSearchResult },
	{ pathname: "/resources", getContent: getSearchResult },
	{ pathname: "/search", getContent: getSearchResult },
];

/** Route segments with a `[slug]` detail page which the sitemap lists entries for. */
const detailSegments = ["events", "news", "projects"];

/**
 * The pathnames of every url in the sitemap. `<loc>` holds absolute urls on `NEXT_PUBLIC_APP_BASE_URL`, which need not
 * be the origin playwright runs against, so only the pathname is kept.
 */
async function getSitemapPathnames(request: APIRequestContext): Promise<Array<string>> {
	const sitemap = await (await request.get("/sitemap.xml")).text();

	return [...sitemap.matchAll(/<loc>(?<location>.*?)<\/loc>/g)]
		.map((match) => match.groups?.location)
		.filter((location): location is string => location != null)
		.map((location) => new URL(location).pathname);
}

/** Waits for `content` to render, and for no search to still be in flight, so the scan doesn't see a loading state. */
async function waitForContent(page: Page, content: Locator): Promise<void> {
	await expect(content, "Expected the page's content to render.").toBeVisible();
	await expect(page.locator('main [aria-busy="true"]')).toHaveCount(0);
}

test.describe("a11y", () => {
	test("should have no detectable accessibility violations on the homepage", async ({
		createAccessibilityScanner,
		createIndexPage,
	}) => {
		for (const locale of locales) {
			const { indexPage } = await createIndexPage(locale);
			await indexPage.goto();
			// The hero and featured sections all stream in under one `<Suspense>`, the title included.
			await waitForContent(indexPage.page, indexPage.title);

			const scanner = await createAccessibilityScanner();
			const violations = await scanner.getViolations({ options: { runOnly: tags } });

			expect(violations).toStrictEqual([]);
		}
	});

	for (const { pathname, getContent } of listPages) {
		test(`should have no detectable accessibility violations on the ${pathname} page`, async ({
			createAccessibilityScanner,
			page,
		}) => {
			await page.goto(`${localePrefix.prefixes[defaultLocale]}${pathname}`);
			await waitForContent(page, getContent(page));

			const scanner = await createAccessibilityScanner();
			const violations = await scanner.getViolations({ options: { runOnly: tags } });

			expect(violations).toStrictEqual([]);
		});
	}

	/**
	 * Picks a real detail page off the sitemap instead of a hardcoded slug, so the test doesn't rot the moment that
	 * particular item gets unpublished.
	 */
	for (const segment of detailSegments) {
		test(`should have no detectable accessibility violations on the first ${segment} detail page`, async ({
			createAccessibilityScanner,
			page,
			request,
		}) => {
			const pattern = new RegExp(`^${localePrefix.prefixes[defaultLocale]}/${segment}/[^/]+$`);
			const detailPathname = (await getSitemapPathnames(request)).find((pathname) => pattern.test(pathname));

			expect(detailPathname, `Expected at least one ${segment} detail page in the sitemap.`).toBeDefined();

			await page.goto(detailPathname!);
			/**
			 * The item's own name, which streams in under `<Suspense>` in place of the "Loading" fallback. The section title
			 * in the banner above it is deliberately not a heading on detail pages.
			 */
			await waitForContent(page, page.locator("main h1"));

			const scanner = await createAccessibilityScanner();
			const violations = await scanner.getViolations({ options: { runOnly: tags } });

			expect(violations).toStrictEqual([]);
		});
	}
});
