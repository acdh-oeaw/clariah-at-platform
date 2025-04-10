import {
	createAssetOptions,
	createContentFieldOptions,
	createLabel,
	createSingleton,
	withI18nPrefix,
} from "@acdh-oeaw/keystatic-lib";
import { fields, singleton } from "@keystatic/core";

import {
	createFigure,
	createFootnote,
	createGrid,
	createHeadingId,
	createLink,
	createLinkButton,
	createVideo,
} from "@/lib/keystatic/components";
import { createLinkSchema } from "@/lib/keystatic/create-link-schema";
import * as validation from "@/lib/keystatic/validation";

export const createIndexPage = createSingleton("/index-page/", (paths, locale) => {
	return singleton({
		label: createLabel("Home page", locale),
		path: paths.contentPath,
		format: { data: "json" },
		entryLayout: "form",
		schema: {
			hero: fields.object(
				{
					title: fields.text({
						label: "Title",
						validation: { isRequired: true },
					}),
					lead: fields.text({
						label: "Lead",
						validation: { isRequired: true },
						multiline: true,
					}),
					image: fields.image({
						label: "Image",
						validation: { isRequired: true },
						...createAssetOptions(paths.assetPath),
					}),
				},
				{
					label: "Hero section",
				},
			),
			main: fields.object(
				{
					sections: fields.blocks(
						{
							cardsSection: {
								label: "Cards section",
								itemLabel(props) {
									return `${props.fields.title.value} (Cards)`;
								},
								schema: fields.object(
									{
										title: fields.text({
											label: "Title",
											validation: { isRequired: true },
										}),
										cards: fields.blocks(
											{
												custom: {
													label: "Custom card",
													itemLabel(props) {
														return props.fields.title.value;
													},
													schema: fields.object(
														{
															title: fields.text({
																label: "Title",
																validation: { isRequired: true },
															}),
															image: fields.object({
																src: fields.image({
																	label: "Image",
																	validation: { isRequired: true },
																	...createAssetOptions(paths.assetPath),
																}),
																caption: fields.mdx.inline({
																	label: "Image Caption",
																	options: {
																		heading: false,
																		orderedList: false,
																		unorderedList: false,
																		divider: false,
																		code: false,
																		codeBlock: false,
																		blockquote: false,
																		table: false,
																		image: false,
																		strikethrough: false,
																	},
																}),
															}),
															summary: fields.object({
																title: fields.text({
																	label: "Summary title",
																	validation: { isRequired: false },
																}),
																content: fields.mdx.inline({
																	label: "Summary content",
																	options: {
																		heading: false,
																		orderedList: false,
																		unorderedList: false,
																		divider: false,
																		code: false,
																		codeBlock: false,
																		blockquote: false,
																		table: false,
																		image: false,
																	},
																}),
															}),
															link: fields.object(
																{
																	label: fields.text({
																		label: "Label",
																		validation: { isRequired: true },
																	}),
																	href: fields.url({
																		label: "URL",
																		validation: { isRequired: true },
																	}),
																},
																{
																	label: "Link",
																},
															),
														},
														{
															label: "Custom card",
														},
													),
												},
												event: {
													label: "Event card",
													itemLabel(props) {
														return props.fields.title.value;
													},
													schema: fields.object(
														{
															title: fields.text({
																label: "Title",
																validation: { isRequired: true },
															}),
															reference: fields.relationship({
																label: "Event",
																validation: { isRequired: true },
																collection: withI18nPrefix("events", locale),
															}),
														},
														{
															label: "Event card",
														},
													),
												},
												news: {
													label: "News card",
													itemLabel(props) {
														return props.fields.title.value;
													},
													schema: fields.object(
														{
															title: fields.text({
																label: "Title",
																validation: { isRequired: true },
															}),
															reference: fields.relationship({
																label: "News",
																validation: { isRequired: true },
																collection: withI18nPrefix("news", locale),
															}),
														},
														{
															label: "News card",
														},
													),
												},
												organisation: {
													label: "Organisation card",
													itemLabel(props) {
														return props.fields.title.value;
													},
													schema: fields.object(
														{
															title: fields.text({
																label: "Title",
																validation: { isRequired: true },
															}),
															reference: fields.relationship({
																label: "Organisation",
																validation: { isRequired: true },
																collection: withI18nPrefix("organisations", locale),
															}),
														},
														{
															label: "Organisation card",
														},
													),
												},
												page: {
													label: "Page card",
													itemLabel(props) {
														return props.fields.title.value;
													},
													schema: fields.object(
														{
															title: fields.text({
																label: "Title",
																validation: { isRequired: true },
															}),
															reference: fields.relationship({
																label: "Page",
																validation: { isRequired: true },
																collection: withI18nPrefix("pages", locale),
															}),
														},
														{
															label: "Page card",
														},
													),
												},
												project: {
													label: "Project card",
													itemLabel(props) {
														return props.fields.title.value;
													},
													schema: fields.object(
														{
															title: fields.text({
																label: "Title",
																validation: { isRequired: true },
															}),
															reference: fields.relationship({
																label: "Project",
																validation: { isRequired: true },
																collection: withI18nPrefix("projects", locale),
															}),
														},
														{
															label: "Project card",
														},
													),
												},
											},
											{
												label: "Cards",
												validation: { length: { min: 1 } },
											},
										),
									},
									{
										label: "Cards section",
									},
								),
							},
						},
						{
							label: "Sections",
							validation: { length: { min: 1 } },
						},
					),
				},
				{ label: "Main content" },
			),
		},
	});
});

export const createEventsOverview = createSingleton("/events-overview/", (paths, locale) => {
	return singleton({
		label: createLabel("Events Overview", locale),
		path: paths.contentPath,
		format: { data: "json" },
		entryLayout: "form",
		schema: {
			title: fields.text({
				label: "Title",
				validation: { isRequired: true },
			}),
			lead: fields.text({
				label: "Lead",
				validation: { isRequired: true },
				multiline: true,
			}),
		},
	});
});

export const createNewsOverview = createSingleton("/news-overview/", (paths, locale) => {
	return singleton({
		label: createLabel("News Overview", locale),
		path: paths.contentPath,
		format: { data: "json" },
		entryLayout: "form",
		schema: {
			title: fields.text({
				label: "Title",
				validation: { isRequired: true },
			}),
			lead: fields.text({
				label: "Lead",
				validation: { isRequired: true },
				multiline: true,
			}),
		},
	});
});

export const createNutshell = createSingleton("/in-a-nutshell/", (paths, locale) => {
	return singleton({
		label: createLabel("In a Nutshell", locale),
		path: paths.contentPath,
		format: { data: "json" },
		entryLayout: "form",
		schema: {
			title: fields.text({
				label: "Title",
				validation: { isRequired: true },
			}),
			lead: fields.mdx.inline({
				label: "Lead",
			}),
			content: fields.mdx({
				label: "Content",
				options: createContentFieldOptions(paths),
				components: {
					//...createAvatar(paths, locale),
					//...createDownloadButton(paths, locale),
					...createFigure(paths, locale),
					...createFootnote(paths, locale),
					...createGrid(paths, locale),
					...createHeadingId(paths, locale),
					//...createImageLink(paths, locale),
					...createLink(paths, locale),
					...createLinkButton(paths, locale),
					//...createTweet(paths, locale),
					...createVideo(paths, locale),
				},
			}),
		},
	});
});

export const createProjectsOverview = createSingleton("/projects-overview/", (paths, locale) => {
	return singleton({
		label: createLabel("Projects Overview", locale),
		path: paths.contentPath,
		format: { data: "json" },
		entryLayout: "form",
		schema: {
			title: fields.text({
				label: "Title",
				validation: { isRequired: true },
			}),
			lead: fields.text({
				label: "Lead",
				validation: { isRequired: true },
				multiline: true,
			}),
		},
	});
});

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
export const createResources = createSingleton("/resources/", (paths, locale) => {
	return singleton({
		label: createLabel("Resources", locale),
		path: paths.contentPath,
		format: { data: "json" },
		entryLayout: "form",
		schema: {
			title: fields.text({
				label: "Title",
				validation: { isRequired: true },
			}),
			lead: fields.text({
				label: "Lead",
				validation: { isRequired: true },
				multiline: true,
			}),
		},
	});
});

export const createSearch = createSingleton("/search/", (paths, locale) => {
	return singleton({
		label: createLabel("Search", locale),
		path: paths.contentPath,
		format: { data: "json" },
		entryLayout: "form",
		schema: {
			title: fields.text({
				label: "Title",
				validation: { isRequired: true },
			}),
			lead: fields.text({
				label: "Lead",
				validation: { isRequired: true },
				multiline: true,
			}),
		},
	});
});
