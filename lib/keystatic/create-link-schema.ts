import { createAssetOptions, type Paths, withI18nPrefix } from "@acdh-oeaw/keystatic-lib";
import { fields } from "@keystatic/core";

import type { Locale } from "@/config/i18n.config";
import { linkKinds } from "@/lib/keystatic/component-options";

export function createLinkSchema<TPath extends `/${string}/`>(
	downloadPath: Paths<TPath>["downloadPath"],
	locale: Locale,
) {
	return fields.conditional(
		fields.select({
			label: "Kind",
			options: linkKinds,
			defaultValue: "external",
		}),
		{
			consortium: fields.relationship({
				label: "Consortium",
				validation: { isRequired: true },
				collection: withI18nPrefix("consortium", locale),
			}),
			events: fields.relationship({
				label: "Event",
				validation: { isRequired: true },
				collection: withI18nPrefix("events", locale),
			}),
			news: fields.relationship({
				label: "News",
				validation: { isRequired: true },
				collection: withI18nPrefix("news", locale),
			}),
			projects: fields.relationship({
				label: "Project",
				validation: { isRequired: true },
				collection: withI18nPrefix("projects", locale),
			}),
			pages: fields.relationship({
				label: "Pages",
				validation: { isRequired: true },
				collection: withI18nPrefix("pages", locale),
			}),
			download: fields.file({
				label: "Download",
				validation: { isRequired: true },
				...createAssetOptions(downloadPath),
			}),
			external: fields.url({
				label: "URL",
				validation: { isRequired: true },
			}),
			"index-page": fields.empty(),
			"events-overview": fields.empty(),
			"news-overview": fields.empty(),
			"projects-overview": fields.empty(),
			search: fields.empty(),
		},
	);
}
