import {
	createAssetOptions,
	createCollection,
	createContentFieldOptions,
	createLabel,
	withI18nPrefix,
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

export const createEvents = createCollection("/events/", (paths, locale) => {
	return collection({
		label: createLabel("Events", locale),
		path: paths.contentPath,
		format: { contentField: "content" },
		slugField: "title",
		columns: ["title", "publicationDate"],
		entryLayout: "content",
		previewUrl: createPreviewUrl("/events/{slug}"),
		schema: {
			title: fields.slug({
				name: {
					label: "Title",
					validation: { isRequired: true },
				},
			}),
			publicationDate: fields.date({
				label: "Publication date",
				validation: { isRequired: true },
				defaultValue: { kind: "today" },
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
			startDate: fields.datetime({
				label: "Event start date",
				validation: { isRequired: false },
			}),
			endDate: fields.datetime({
				label: "Event end date",
				validation: { isRequired: false },
			}),
			location: fields.text({
				label: "Event location",
				validation: { isRequired: false },
			}),
			hosts: fields.blocks(
				{
					person: {
						label: "Person",
						schema: fields.relationship({
							label: "Person",
							collection: withI18nPrefix("persons", locale),
						}),
						itemLabel(props) {
							return props.value ?? "";
						},
					},
					organisation: {
						label: "Organisation",
						schema: fields.relationship({
							label: "Organisation",
							collection: withI18nPrefix("organisations", locale),
						}),
						itemLabel(props) {
							return props.value ?? "";
						},
					},
				},
				{ label: "Hosts" },
			),
			speakers: fields.array(
				fields.relationship({
					label: "Speakers",
					collection: withI18nPrefix("persons", locale),
				}),
				{
					label: "Speakers",
					itemLabel(props) {
						return props.value ?? "";
					},
				},
			),
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
			attachments: fields.array(
				fields.object(
					{
						label: fields.text({
							label: "Attachment",
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
					label: "Attachments",
					itemLabel(props) {
						return props.fields.label.value;
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

export const createKeywords = createCollection("/keywords/", (paths, locale) => {
	return collection({
		label: createLabel("Keywords", locale),
		path: paths.contentPath,
		format: { contentField: "description" },
		slugField: "label",
		columns: ["label"],
		entryLayout: "content",
		schema: {
			label: fields.slug({
				name: {
					label: "Name",
					validation: { isRequired: true },
				},
			}),
			description: fields.mdx({
				label: "Description",
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
			synonyms: fields.array(
				fields.text({
					label: "Synonym",
				}),
			),
		},
	});
});

export const createNews = createCollection("/news/", (paths, locale) => {
	return collection({
		label: createLabel("News", locale),
		path: paths.contentPath,
		format: { contentField: "content" },
		slugField: "title",
		columns: ["title", "publicationDate"],
		entryLayout: "content",
		previewUrl: createPreviewUrl("/news/{slug}"),
		schema: {
			title: fields.slug({
				name: {
					label: "Title",
					validation: { isRequired: true },
				},
			}),
			publicationDate: fields.date({
				label: "Publication date",
				validation: { isRequired: true },
				defaultValue: { kind: "today" },
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

export const createOrganisation = createCollection("/organisations/", (paths, locale) => {
	return collection({
		label: createLabel("Organisations", locale),
		path: paths.contentPath,
		format: { contentField: "description" },
		slugField: "name",
		columns: ["name"],
		entryLayout: "content",
		schema: {
			name: fields.slug({
				name: {
					label: "Name",
					validation: { isRequired: true },
				},
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
			affiliations: fields.array(
				fields.relationship({
					label: "Affiliation",
					collection: withI18nPrefix("organisations", locale),
				}),
				{
					label: "Affiliations",
				},
			),
			contact: fields.array(
				fields.relationship({
					label: "Contact",
					collection: withI18nPrefix("persons", locale),
				}),
				{
					label: "Contact",
				},
			),
			consortiumStatus: fields.select({
				label: "Consortium Status",
				description: "The status of the consortium",
				options: [
					{ label: "Member", value: "member" },
					{ label: "Observer", value: "observer" },
					{ label: "None", value: "none" },
				],
				defaultValue: "none",
			}),
			description: fields.mdx({
				label: "Description",
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
			funding: fields.select({
				label: "Funding",
				description: "The funding of the project",
				options: [
					{ label: "go!digital", value: "godigital" },
					{ label: "CLARIAH-AT 2022", value: "clariah-at-2022" },
				],
				defaultValue: "clariah-at-2022",
			}),
			responsiblePersons: fields.array(
				fields.relationship({
					label: "Name",
					collection: withI18nPrefix("persons", locale),
				}),
				{
					label: "Responsible Person(s)",
					itemLabel(props) {
						return props.value ?? "";
					},
				},
			),
			projectPartners: fields.array(
				fields.relationship({
					label: "Name",
					collection: withI18nPrefix("organisations", locale),
				}),
				{
					label: "Project Partner(s)",
					itemLabel(props) {
						return props.value ?? "";
					},
				},
			),
			startDate: fields.date({
				label: "Start date",
				validation: { isRequired: false },
			}),
			endDate: fields.date({
				label: "End date",
				validation: { isRequired: false },
			}),
			keywords: fields.array(
				fields.relationship({
					label: "Keyword",
					collection: withI18nPrefix("keywords", locale),
				}),
				{
					label: "Keyword(s)",
					itemLabel(props) {
						return props.value ?? "";
					},
				},
			),
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

export const createPersons = createCollection("/persons/", (paths, locale) => {
	return collection({
		label: createLabel("Persons", locale),
		path: paths.contentPath,
		format: { contentField: "description" },
		slugField: "name",
		columns: ["name"],
		entryLayout: "content",
		schema: {
			name: fields.slug({
				name: {
					label: "Name",
					validation: { isRequired: true },
				},
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
			affiliations: fields.array(
				fields.relationship({
					label: "Affiliation",
					collection: withI18nPrefix("organisations", locale),
				}),
				{
					label: "Affiliations",
				},
			),
			links: fields.array(
				fields.object({
					kind: fields.select({
						label: "Type",
						options: [
							{ label: "Bluesky", value: "bluesky" },
							{ label: "Email", value: "email" },
							{ label: "Facebook", value: "facebook" },
							{ label: "Instagram", value: "instagram" },
							{ label: "Linkedin", value: "linkedin" },
							{ label: "Mastodon", value: "mastodon" },
							{ label: "ORCID", value: "orcid" },
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
