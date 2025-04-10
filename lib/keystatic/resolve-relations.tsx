import type { Locale } from "@/config/i18n.config";
import { createCollectionResource } from "@/lib/keystatic/resources";
import type { Collection } from "@/types/keystatic";

export async function getRelatedEntities(
	slugs: Array<string>,
	collection: Collection,
	locale: Locale,
): Promise<
	Array<Awaited<ReturnType<Awaited<ReturnType<typeof createCollectionResource>["read"]>>>["data"]>
> {
	return await Promise.all(
		slugs.map(async (slug) => {
			return (await createCollectionResource(collection, locale).read(slug)).data;
		}),
	);
}
