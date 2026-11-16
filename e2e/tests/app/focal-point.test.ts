import { createUrl } from "@acdh-oeaw/lib";

import { env } from "#/configs/env.config.ts";
import { expect, test } from "#/e2e/lib/test.ts";
import { defaultLocale } from "#/lib/i18n/locales.ts";
import { localizeHref } from "#/lib/navigation/convert.ts";

interface NewsItem {
	entity: { slug: string };
	image: { focalPoint?: { x: number; y: number } | null } | null;
}

/** Reads the live content, so the test follows whichever news items have an image, with or without a focal point. */
async function getNewsWithImages(): Promise<Array<NewsItem & { image: NonNullable<NewsItem["image"]> }>> {
	const url = createUrl({
		baseUrl: env.NEXT_PUBLIC_API_BASE_URL,
		pathname: "/api/v1/news",
		searchParams: new URLSearchParams({ limit: "100", locale: defaultLocale }),
	});
	const response = await fetch(url);
	const { data } = (await response.json()) as { data: Array<NewsItem> };

	return data.filter((item): item is NewsItem & { image: NonNullable<NewsItem["image"]> } => item.image != null);
}

function toPercent(fraction: number): string {
	return `${String(Math.round(fraction * 10_000) / 100)}%`;
}

test.describe("focal point", () => {
	test("should crop a detail page image around its focal point", async ({ page }) => {
		const item = (await getNewsWithImages()).find((news) => news.image.focalPoint != null);
		// oxlint-disable-next-line playwright/no-skipped-test -- Depends on live content, where no image may have a focal point yet.
		test.skip(item == null, "No news item has an image with a focal point.");

		const { x, y } = item!.image.focalPoint!;
		await page.goto(localizeHref(`/news/${item!.entity.slug}`, defaultLocale));

		// oxlint-disable-next-line playwright/no-raw-locators -- The header image may be decorative, so it has no role.
		const image = page.locator("main section img").first();
		await expect(image).toHaveCSS("object-position", `${toPercent(x)} ${toPercent(y)}`);
	});

	test("should crop a detail page image around its centre without a focal point", async ({ page }) => {
		const item = (await getNewsWithImages()).find((news) => news.image.focalPoint == null);
		// oxlint-disable-next-line playwright/no-skipped-test -- Depends on live content.
		test.skip(item == null, "Every news item with an image has a focal point.");

		await page.goto(localizeHref(`/news/${item!.entity.slug}`, defaultLocale));

		// oxlint-disable-next-line playwright/no-raw-locators -- The header image may be decorative, so it has no role.
		const image = page.locator("main section img").first();
		await expect(image).toHaveCSS("object-position", "50% 50%");
	});
});
