import { createUrl } from "@acdh-oeaw/lib";

import { env } from "#/configs/env.config.ts";
import { expect, test } from "#/e2e/lib/test.ts";
import { locales } from "#/lib/i18n/locales.ts";

function createAbsoluteUrl(pathname: string): string {
	return String(createUrl({ baseUrl: env.NEXT_PUBLIC_APP_BASE_URL, pathname }));
}

test.describe("i18n", () => {
	test.describe("should redirect root route to preferred locale", () => {
		test.use({ locale: "de" });

		test("with default locale", async ({ page }) => {
			await page.goto("/");
			await expect(page).toHaveURL("/de");
		});
	});

	test.describe("should redirect root route to preferred locale", () => {
		test.use({ locale: "en" });

		test("with supported locale", async ({ page }) => {
			await page.goto("/");
			await expect(page).toHaveURL("/en");
		});
	});

	test.describe("should redirect root route to preferred locale", () => {
		test.use({ locale: "fr" });

		test("with unsupported locale", async ({ page }) => {
			await page.goto("/");
			await expect(page).toHaveURL("/de");
		});
	});

	/**
	 * `app/global-not-found.tsx` renders hardcoded English text with no locale or provider context (see its own doc
	 * comment) — there is no extracted message for it, so this asserts the literal string rather than `i18n.t(...)`. It
	 * bypasses every layout by design, which is also why the same assertion is expected to hold for both an unroutable
	 * path (no locale segment matches at all) and an unknown pathname within a resolved locale — neither case has a more
	 * specific `not-found.tsx` to intercept it, since this app doesn't have one. Unverified against a running app;
	 * confirm both if you can run `next dev`/`next build` before trusting this.
	 */
	test.fixme("should display the global not-found page for an unroutable path", async ({ page }) => {
		const response = await page.goto("/unknown");
		expect(response?.status()).toBe(404);
		await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
	});

	test.fixme("should display the global not-found page for an unknown pathname within a locale", async ({ page }) => {
		const response = await page.goto("/de/unknown");
		expect(response?.status()).toBe(404);
		await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
	});

	test("should set `lang` attribute on `html` element", async ({ createIndexPage }) => {
		for (const locale of locales) {
			const { indexPage } = await createIndexPage(locale);
			await indexPage.goto();
			await expect(indexPage.page.locator("html")).toHaveAttribute("lang", locale);
		}
	});

	test("should set alternate links in response header for the homepage", async ({ createIndexPage }) => {
		for (const locale of locales) {
			const { indexPage } = await createIndexPage(locale);
			const response = await indexPage.goto();
			const headers = response?.headers().link?.split(/, |\n/);
			expect(headers).toStrictEqual(
				expect.arrayContaining([
					`<${createAbsoluteUrl("/de")}>; rel="alternate"; hreflang="de-AT"`,
					`<${createAbsoluteUrl("/en")}>; rel="alternate"; hreflang="en-GB"`,
					`<${createAbsoluteUrl("/")}>; rel="alternate"; hreflang="x-default"`,
				]),
			);
		}
	});

	// The two tests below need `app/(app)/[locale]/(default)/imprint/page.tsx`, which doesn't exist in this app yet —
	// `ImprintPage`/`createImprintPage` are otherwise ready. Drop the `test.fixme` line once that route exists.

	test("should support switching locale", async ({ createImprintPage, page }) => {
		test.fixme(true, "No /imprint route exists yet.");
		// @ts-expect-error -- Single locale could be configured.
		// eslint-disable-next-line playwright/no-skipped-test, @typescript-eslint/no-unnecessary-condition
		test.skip(locales.length === 1, "Only single locale configured.");

		const { imprintPage } = await createImprintPage("de-AT");
		await imprintPage.goto();

		await expect(page).toHaveURL("/de/imprint");
		await expect(imprintPage.title).toBeVisible();

		// `LocaleSwitcher` labels each link with the target language's own name (see `locale-swticher.tsx`), not a
		// templated "switch to X" string — so this matches on the visible language name, not a translation key.
		await page.getByRole("link", { name: "English" }).click();

		await expect(page).toHaveURL("/en/imprint");
	});

	test("should set alternate links in response header for the imprint page", async ({ createImprintPage }) => {
		test.fixme(true, "No /imprint route exists yet.");

		for (const locale of locales) {
			const { imprintPage } = await createImprintPage(locale);
			const response = await imprintPage.goto();
			const headers = response?.headers().link?.split(/, |\n/);
			expect(headers).toStrictEqual(
				expect.arrayContaining([
					`<${createAbsoluteUrl("/de/imprint")}>; rel="alternate"; hreflang="de-AT"`,
					`<${createAbsoluteUrl("/en/imprint")}>; rel="alternate"; hreflang="en-GB"`,
				]),
			);
			expect(headers).toStrictEqual(
				expect.not.arrayContaining([`<${createAbsoluteUrl("/imprint")}>; rel="alternate"; hreflang="x-default"`]),
			);
		}
	});
});
