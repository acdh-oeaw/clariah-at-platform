import {
	// createAssetOptions,
	createCollection,
	createContentFieldOptions,
	createLabel,
} from "@acdh-oeaw/keystatic-lib";
import { collection, fields } from "@keystatic/core";

import {
	createCallout,
	createDisclosure,
	createEmbed,
	createFigure,
	createFootnote,
	createGrid,
	createHeadingId,
	createLink,
	createLinkButton,
	createTabs,
	createVideo,
} from "@/lib/keystatic/components";
import { createPreviewUrl } from "@/lib/keystatic/create-preview-url";

export const createDocumentation = createCollection("/documentation/", (paths, locale) => {
	return collection({
		label: createLabel("Documentation", locale),
		path: paths.contentPath,
		format: { contentField: "content" },
		slugField: "title",
		columns: ["title"],
		entryLayout: "content",
		previewUrl: createPreviewUrl("/documentation/{slug}"),
		schema: {
			title: fields.slug({
				name: {
					label: "Title",
					validation: { isRequired: true },
				},
			}),
			lead: fields.text({
				label: "Lead",
				validation: { isRequired: true },
				multiline: true,
			}),
			// publicationDate: fields.date({
			// 	label: "Publication date",
			// 	validation: { isRequired: true },
			// 	defaultValue: { kind: "today" },
			// }),
			// image: fields.image({
			// 	label: "Image",
			// 	validation: { isRequired: true },
			// 	...createAssetOptions(paths.assetPath),
			// }),
			content: fields.mdx({
				label: "Content",
				options: createContentFieldOptions(paths),
				components: {
					...createCallout(paths, locale),
					...createDisclosure(paths, locale),
					...createEmbed(paths, locale),
					...createFigure(paths, locale),
					...createFootnote(paths, locale),
					...createGrid(paths, locale),
					...createHeadingId(paths, locale),
					...createLink(paths, locale),
					...createLinkButton(paths, locale),
					...createTabs(paths, locale),
					...createVideo(paths, locale),
				},
			}),
		},
	});
});
