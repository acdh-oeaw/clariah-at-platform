import {
	createAssetOptions,
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

export const createConsortium = createCollection("/consortium/", (paths, locale) => {
	return collection({
		label: createLabel("Consortium", locale),
		path: paths.contentPath,
		format: { data: "json" },
		slugField: "name",
		columns: ["name"],
		entryLayout: "form",
		schema: {
			name: fields.slug({
				name: {
					label: "Name",
					validation: { isRequired: true },
				},
			}),
			href: fields.url({
				label: "URL",
				validation: { isRequired: true },
			}),
			logo: fields.image({
				label: "Logo",
				...createAssetOptions(paths.assetPath),
				validation: { isRequired: true },
			}),
			description: fields.mdx({
				label: "Description",
				options: {
					heading: false,
					image: createAssetOptions(paths.assetPath),
				},
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
			institutions: fields.array(
				fields.object(
					{
						name: fields.text({
							label: "Name",
							validation: { isRequired: true },
						}),
						href: fields.url({
							label: "URL",
							validation: { isRequired: true },
						}),
						logo: fields.image({
							label: "Logo",
							...createAssetOptions(paths.assetPath),
							validation: { isRequired: true },
						}),
					},
					{
						label: "Institution",
					},
				),
				{
					label: "Institutions",
					itemLabel(props) {
						return props.fields.name.value;
					},
					// validation: { length: { min: 1 } },
				},
			),
			people: fields.array(
				fields.object(
					{
						name: fields.text({
							label: "Name",
							validation: { isRequired: true },
						}),
						image: fields.image({
							label: "Image",
							...createAssetOptions(paths.assetPath),
							validation: { isRequired: true },
						}),
						links: fields.array(
							fields.object({
								kind: fields.select({
									label: "Type",
									options: [
										{ label: "Bluesky", value: "bluesky" },
										{ label: "Facebook", value: "facebook" },
										{ label: "Instagram", value: "instagram" },
										{ label: "Linkedin", value: "linkedin" },
										{ label: "Mastodon", value: "mastodon" },
										{ label: "ORCID", value: "orcid" },
										{ label: "Podcast", value: "podcast" },
										{ label: "Twitter", value: "twitter" },
										{ label: "Website", value: "website" },
										{ label: "YouTube", value: "youtube" },
									],
									defaultValue: "website",
								}),
								href: fields.url({
									label: "URL",
									validation: { isRequired: true },
								}),
							}),
							{
								label: "Links (social media)",
								itemLabel(props) {
									return props.fields.kind.value;
								},
							},
						),
						description: fields.mdx({
							label: "Description",
							options: {
								heading: false,
								image: createAssetOptions(paths.assetPath),
							},
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
					{
						label: "Person",
					},
				),
				{
					label: "People",
					itemLabel(props) {
						return props.fields.name.value;
					},
					// validation: { length: { min: 1 } },
				},
			),
		},
	});
});

export const createEvents = createCollection("/events/", (paths, locale) => {
	return collection({
		label: createLabel("Events", locale),
		path: paths.contentPath,
		format: { contentField: "content" },
		slugField: "title",
		columns: ["title", "date"],
		entryLayout: "content",
		previewUrl: createPreviewUrl("/events/{slug}"),
		schema: {
			title: fields.slug({
				name: {
					label: "Title",
					validation: { isRequired: true },
				},
			}),
			date: fields.date({
				label: "Publication date",
				validation: { isRequired: true },
				defaultValue: { kind: "today" },
			}),
			image: fields.image({
				label: "Image",
				validation: { isRequired: true },
				...createAssetOptions(paths.assetPath),
			}),
			eventDate: fields.date({
				label: "Event date",
				validation: { isRequired: false },
			}),
			eventLocation: fields.text({
				label: "Event location",
				validation: { isRequired: false },
			}),
			shortTitle: fields.text({
				label: "Summary title",
				validation: { isRequired: false },
			}),
			summary: fields.text({
				label: "Summary",
				validation: { isRequired: true },
				multiline: true,
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

export const createNews = createCollection("/news/", (paths, locale) => {
	return collection({
		label: createLabel("News", locale),
		path: paths.contentPath,
		format: { contentField: "content" },
		slugField: "title",
		columns: ["title", "date"],
		entryLayout: "content",
		previewUrl: createPreviewUrl("/news/{slug}"),
		schema: {
			title: fields.slug({
				name: {
					label: "Title",
					validation: { isRequired: true },
				},
			}),
			date: fields.date({
				label: "Publication date",
				validation: { isRequired: true },
				defaultValue: { kind: "today" },
			}),
			image: fields.image({
				label: "Image",
				validation: { isRequired: true },
				...createAssetOptions(paths.assetPath),
			}),
			shortTitle: fields.text({
				label: "Summary title",
				validation: { isRequired: false },
			}),
			summary: fields.text({
				label: "Summary",
				validation: { isRequired: true },
				multiline: true,
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

export const createProjects = createCollection("/projects/", (paths, locale) => {
	return collection({
		label: createLabel("Projects", locale),
		path: paths.contentPath,
		format: { contentField: "content" },
		slugField: "title",
		columns: ["title", "startDate"],
		entryLayout: "content",
		previewUrl: createPreviewUrl("/projects/{slug}"),
		schema: {
			title: fields.slug({
				name: {
					label: "Title",
					validation: { isRequired: true },
				},
			}),
			shortTitle: fields.text({
				label: "Summary title",
				validation: { isRequired: false },
			}),
			summary: fields.text({
				label: "Summary",
				multiline: true,
				validation: { isRequired: true },
			}),
			startDate: fields.date({
				label: "Start date",
				validation: { isRequired: false },
			}),
			endDate: fields.date({
				label: "End date",
				validation: { isRequired: false },
			}),
			image: fields.image({
				label: "Image",
				validation: { isRequired: true },
				...createAssetOptions(paths.assetPath),
			}),
			additionalImages: fields.array(
				fields.object(
					{
						image: fields.image({
							label: "Image",
							validation: { isRequired: true },
							...createAssetOptions(paths.assetPath),
						}),
						alt: fields.text({
							label: "Alternative text",
							validation: { isRequired: false },
						}),
						license: fields.text({
							label: "License",
							validation: { isRequired: false },
						}),
					},
					{
						label: "Image",
					},
				),
				{
					label: "Additional images",
					itemLabel(props) {
						return props.fields.alt.value;
					},
				},
			),
			attachments: fields.array(
				fields.object(
					{
						file: fields.file({
							label: "File",
							validation: { isRequired: true },
							...createAssetOptions(paths.downloadPath),
						}),
						label: fields.text({
							label: "Label",
							validation: { isRequired: true },
						}),
					},
					{
						label: "Attachment",
					},
				),
				{
					label: "Attachments",
					itemLabel(props) {
						return props.fields.label.value;
					},
				},
			),
			links: fields.array(
				fields.object(
					{
						label: fields.text({
							label: "Label",
							validation: { isRequired: true },
						}),
						url: fields.url({
							label: "URL",
							validation: { isRequired: true },
						}),
					},
					{
						label: "Link",
					},
				),
				{
					label: "Links",
					itemLabel(props) {
						return props.fields.label.value;
					},
				},
			),
			responsiblePersons: fields.array(
				fields.text({
					label: "Name",
					validation: { isRequired: true },
				}),
				{
					label: "Responsible Person(s)",
					itemLabel(props) {
						return props.value;
					},
				},
			),
			hostingOrganizations: fields.array(
				fields.text({
					label: "Name",
					validation: { isRequired: true },
				}),
				{
					label: "Hosting Organization(s)",
					itemLabel(props) {
						return props.value;
					},
				},
			),
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

export const createPages = createCollection("/pages/", (paths, locale) => {
	return collection({
		label: createLabel("Pages", locale),
		path: paths.contentPath,
		format: { contentField: "content" },
		slugField: "title",
		columns: ["title"],
		entryLayout: "content",
		schema: {
			title: fields.slug({
				name: {
					label: "Title",
					validation: { isRequired: true },
				},
			}),
			// publicationDate: fields.date({
			// 	label: "Publication date",
			// 	validation: { isRequired: true },
			// 	defaultValue: { kind: "today" },
			// }),
			image: fields.image({
				label: "Image",
				validation: { isRequired: false },
				...createAssetOptions(paths.assetPath),
			}),
			summary: fields.text({
				label: "Summary",
				validation: { isRequired: false },
				multiline: true,
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
