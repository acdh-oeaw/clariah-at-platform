import { createUrl } from "@acdh-oeaw/lib";

import { env } from "@/config/env.config";
import { defaultLocale, locales } from "@/config/i18n.config";
import { expect, test } from "@/e2e/lib/test";

test.describe("i18n", () => {
	test.describe("should redirect root route to preferred locale", () => {
		test.use({ locale: "en" });

		test("with default locale", async ({ page }) => {
			await page.goto("/");
			await expect(page).toHaveURL("/en");
		});
	});

	test.describe("should redirect root route to preferred locale", () => {
		test.use({ locale: "de" });

		test("with supported locale", async ({ page }) => {
			await page.goto("/");
			await expect(page).toHaveURL("/de");
		});
	});

	test.describe("should redirect root route to preferred locale", () => {
		test.use({ locale: "fr" });

		test("with unsupported locale", async ({ page }) => {
			await page.goto("/");
			await expect(page).toHaveURL("/en");
		});
	});

	test("should display not-found page for unknown locale", async ({ createI18n, page }) => {
		const i18n = await createI18n(defaultLocale);
		const response = await page.goto("/unknown");
		expect(response?.status()).toBe(404);
		await expect(page.getByRole("heading", { name: i18n.t("NotFoundPage.title") })).toBeVisible();
	});

	test("should display localised not-found page for unknown pathname", async ({
		createI18n,
		page,
	}) => {
		const i18n = await createI18n("de");
		const response = await page.goto("/de/unknown");
		/**
		 * When streaming a response, because the root layout has a suspense boundary
		 * or a `loading.tsx`, the response status code will always be 200.
		 *
		 * @see https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming#status-codes
		 * @see https://nextjs.org/docs/app/api-reference/file-conventions/not-found
		 *
		 * This should not be an issue for seo, but to avoid this anyway you can move `loading.tsx`
		 * one level down (and add a `layout.tsx` which just passes children through):
		 *
		 * - [locale]
		 *   - layout.tsx
		 *   - not-found.tsx
		 *   - [...notfound]
		 *     - page.tsx
		 *   - (index)
		 *     - layout.tsx (pass-through)
		 *     - loading.tsx
		 *     - page.tsx
		 */
		expect(response?.status()).toBe(200);
		// expect(response?.status()).toBe(404);
		await expect(page.getByRole("heading", { name: i18n.t("NotFoundPage.title") })).toBeVisible();
	});

	test("should support switching locale", async ({ createI18n, createImprintPage, page }) => {
		// @ts-expect-error Single locale could be configured.
		// eslint-disable-next-line playwright/no-skipped-test, @typescript-eslint/no-unnecessary-condition
		test.skip(locales.length === 1, "Only single locale configured.");

		const { imprintPage, i18n: de } = await createImprintPage("de");
		await imprintPage.goto();

		await expect(page).toHaveURL("/de/imprint");
		await expect(page.getByRole("heading", { name: de.t("ImprintPage.title") })).toBeVisible();
		await expect(page).toHaveTitle([de.t("ImprintPage.title"), de.t("metadata.title")].join(" | "));

		await page
			.getByRole("link", { name: de.t("LocaleSwitcher.switch-locale-to", { locale: "Englisch" }) })
			.click();
		const en = await createI18n("en");

		await expect(page).toHaveURL("/en/imprint");
		await expect(page.getByRole("heading", { name: en.t("ImprintPage.title") })).toBeVisible();
		await expect(page).toHaveTitle([en.t("ImprintPage.title"), en.t("metadata.title")].join(" | "));
	});

	test("should set `lang` attribute on `html` element", async ({ createIndexPage }) => {
		for (const locale of locales) {
			const { indexPage } = await createIndexPage(locale);
			await indexPage.goto();
			await expect(indexPage.page.locator("html")).toHaveAttribute("lang", locale);
		}
	});

	test("should set alternate links in response header", async ({
		createIndexPage,
		createImprintPage,
	}) => {
		function createAbsoluteUrl(pathname: string) {
			return String(createUrl({ baseUrl: env.NEXT_PUBLIC_APP_BASE_URL, pathname }));
		}

		for (const locale of locales) {
			const { indexPage } = await createIndexPage(locale);
			const response = await indexPage.goto();
			const headers = response?.headers().link?.split(/, |\n/);
			expect(headers).toEqual(
				expect.arrayContaining([
					`<${createAbsoluteUrl("/de")}>; rel="alternate"; hreflang="de"`,
					`<${createAbsoluteUrl("/en")}>; rel="alternate"; hreflang="en"`,
					`<${createAbsoluteUrl("/")}>; rel="alternate"; hreflang="x-default"`,
				]),
			);
		}

		for (const locale of locales) {
			const { imprintPage } = await createImprintPage(locale);
			const response = await imprintPage.goto();
			const headers = response?.headers().link?.split(/, |\n/);
			expect(headers).toEqual(
				expect.arrayContaining([
					`<${createAbsoluteUrl("/de/imprint")}>; rel="alternate"; hreflang="de"`,
					`<${createAbsoluteUrl("/en/imprint")}>; rel="alternate"; hreflang="en"`,
				]),
			);
		}
	});
});
