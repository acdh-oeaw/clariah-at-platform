import type { Locator } from "@playwright/test";

import { expect, test } from "#/e2e/lib/test.ts";

const controls = [
	{ name: "numbered page", getLink: (navigation: Locator) => navigation.getByRole("link", { name: "2", exact: true }) },
	{ name: "next arrow", getLink: (navigation: Locator) => navigation.getByRole("link").last() },
];

test.describe("pagination", () => {
	for (const { name, getLink } of controls) {
		test(`should scroll to the top when using the bottom pagination ${name}`, async ({ page }) => {
			await page.goto("/de/projects");

			/** Pagination arrives with the client-side search results, after hydration. */
			const navigation = page.getByRole("navigation", { name: "Seitennavigation unten" });
			const link = getLink(navigation);
			await expect(link).toHaveAttribute("href", "/de/projects?page=2");
			await link.scrollIntoViewIfNeeded();
			expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

			/** A full document navigation would also scroll to the top, but would lose this marker. */
			// oxlint-disable-next-line playwright/no-raw-locators -- The document root holds the navigation marker.
			const html = page.locator("html");
			await html.evaluate((element) => {
				element.dataset.paginationNavigation = "true";
			});

			await link.click();

			await expect(page).toHaveURL("/de/projects?page=2");
			// oxlint-disable-next-line playwright/no-raw-locators -- Identifies the results list after its search completes.
			await expect(page.locator('main ul[aria-busy="false"]')).toBeVisible();
			await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
			await expect(html).toHaveAttribute("data-pagination-navigation", "true");
		});
	}
});
