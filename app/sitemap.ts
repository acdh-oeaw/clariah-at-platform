import type { MetadataRoute } from "next";

import { getSitemapEntries } from "#/lib/data/sitemap.ts";

export default function sitemap(): Promise<MetadataRoute.Sitemap> {
	return getSitemapEntries();
}
