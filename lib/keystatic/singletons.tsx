import { createLabel, createSingleton } from "@acdh-oeaw/keystatic-lib";
import { fields, singleton } from "@keystatic/core";

import { createLinkSchema } from "@/lib/keystatic/create-link-schema";
import * as validation from "@/lib/keystatic/validation";

export const createMetadata = createSingleton("/metadata/", (paths, locale) => {
	return singleton({
		label: createLabel("Metadata", locale),
		path: paths.contentPath,
		format: { data: "json" },
		entryLayout: "form",
		schema: {
			title: fields.text({
				label: "Title",
				validation: { isRequired: true },
			}),
			description: fields.text({
				label: "Description",
				validation: { isRequired: true },
			}),
			twitter: fields.object(
				{
					creator: fields.text({
						label: "Creator",
						validation: { isRequired: true, pattern: validation.twitter },
					}),
					site: fields.text({
						label: "Site",
						validation: { isRequired: true, pattern: validation.twitter },
					}),
				},
				{
					label: "Twitter",
				},
			),
			manifest: fields.object(
				{
					name: fields.text({
						label: "Name",
						validation: { isRequired: true },
					}),
					"short-name": fields.text({
						label: "Short name",
						validation: { isRequired: true },
					}),
					description: fields.text({
						label: "Description",
						validation: { isRequired: true },
					}),
				},
				{
					label: "Webmanifest",
				},
			),
		},
	});
});

export const createNavigation = createSingleton("/navigation/", (paths, locale) => {
	const link = createLinkSchema(paths.downloadPath, locale);

	return singleton({
		label: createLabel("Navigation", locale),
		path: paths.contentPath,
		format: { data: "json" },
		entryLayout: "form",
		schema: {
			links: fields.blocks(
				{
					link: {
						label: "Link",
						itemLabel(props) {
							return `${props.fields.label.value} (Link, ${props.fields.link.discriminant})`;
						},
						schema: fields.object(
							{
								label: fields.text({
									label: "Label",
									validation: { isRequired: true },
								}),
								link,
							},
							{
								label: "Link",
							},
						),
					},
					separator: {
						label: "Separator",
						itemLabel() {
							return "Separator";
						},
						schema: fields.empty(),
					},
					menu: {
						label: "Menu",
						itemLabel(props) {
							return `${props.fields.label.value} (Menu)`;
						},
						schema: fields.object(
							{
								label: fields.text({
									label: "Label",
									validation: { isRequired: true },
								}),
								items: fields.blocks(
									{
										link: {
											label: "Link",
											itemLabel(props) {
												return `${props.fields.label.value} (Link, ${props.fields.link.discriminant})`;
											},
											schema: fields.object(
												{
													label: fields.text({
														label: "Label",
														validation: { isRequired: true },
													}),
													link,
												},
												{
													label: "Link",
												},
											),
										},
										separator: {
											label: "Separator",
											itemLabel() {
												return "Separator";
											},
											schema: fields.empty(),
										},
									},
									{
										label: "Items",
										validation: { length: { min: 1 } },
									},
								),
							},
							{
								label: "Menu",
							},
						),
					},
				},
				{
					label: "Links",
					validation: { length: { min: 1 } },
				},
			),
		},
	});
});
