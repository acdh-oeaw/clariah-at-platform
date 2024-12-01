import { createAssetOptions, createComponent } from "@acdh-oeaw/keystatic-lib";
import { fields } from "@keystatic/core";
import { block, inline, mark, repeating, wrapper } from "@keystatic/core/content-components";
import {
	AppWindowIcon,
	CaptionsIcon,
	ChevronDownSquareIcon,
	GridIcon,
	HashIcon,
	ImageIcon,
	InfoIcon,
	LinkIcon,
	ListIcon,
	SquareIcon,
	SuperscriptIcon,
	VideoIcon,
} from "lucide-react";

import {
	calloutKinds,
	figureAlignments,
	gridAlignments,
	gridLayouts,
	videoProviders,
} from "@/lib/keystatic/component-options";
import { createLinkSchema } from "@/lib/keystatic/create-link-schema";
import {
	CalloutPreview,
	DisclosurePreview,
	EmbedPreview,
	FigurePreview,
	GridItemPreview,
	GridPreview,
	HeadingIdPreview,
	LinkButtonPreview,
	TableOfContentsPreview,
	TabPreview,
	TabsPreview,
	VideoPreview,
} from "@/lib/keystatic/previews";

export const createCallout = createComponent((_paths, _locale) => {
	return {
		Callout: wrapper({
			label: "Callout",
			description: "Insert a note, tip, warning, or error.",
			icon: <InfoIcon />,
			schema: {
				kind: fields.select({
					label: "Kind",
					options: calloutKinds,
					defaultValue: "note",
				}),
				title: fields.text({
					label: "Title",
					validation: { isRequired: false },
				}),
			},
			ContentView(props) {
				const { children, value } = props;

				return (
					<CalloutPreview kind={value.kind} title={value.title}>
						{children}
					</CalloutPreview>
				);
			},
		}),
	};
});

export const createDisclosure = createComponent((_paths, _locale) => {
	return {
		Disclosure: wrapper({
			label: "Disclosure",
			description: "Insert text hidden behind a toggle.",
			icon: <ChevronDownSquareIcon />,
			schema: {
				title: fields.text({
					label: "Title",
					validation: { isRequired: true },
				}),
			},
			ContentView(props) {
				const { children, value } = props;

				return <DisclosurePreview title={value.title}>{children}</DisclosurePreview>;
			},
		}),
	};
});

export const createEmbed = createComponent((_paths, _locale) => {
	return {
		Embed: wrapper({
			label: "Embed",
			description: "Insert content from another website.",
			icon: <AppWindowIcon />,
			schema: {
				src: fields.url({
					label: "URL",
					validation: { isRequired: true },
				}),
			},
			ContentView(props) {
				const { children, value } = props;

				return <EmbedPreview src={value.src}>{children}</EmbedPreview>;
			},
		}),
	};
});

export const createFigure = createComponent((paths, _locale) => {
	return {
		Figure: wrapper({
			label: "Figure",
			description: "Insert an image with caption.",
			icon: <ImageIcon />,
			schema: {
				src: fields.image({
					label: "Image",
					validation: { isRequired: true },
					...createAssetOptions(paths.assetPath),
				}),
				alt: fields.text({
					label: "Image description for assistive technology",
					validation: { isRequired: false },
				}),
				alignment: fields.select({
					label: "Alignment",
					options: figureAlignments,
					defaultValue: "stretch",
				}),
			},
			ContentView(props) {
				const { children, value } = props;

				return (
					<FigurePreview alignment={value.alignment} alt={value.alt} src={value.src}>
						{children}
					</FigurePreview>
				);
			},
		}),
	};
});

export const createFootnote = createComponent((_paths, _locale) => {
	return {
		Footnote: mark({
			label: "Footnote",
			icon: <SuperscriptIcon />,
			schema: {},
			className: "underline decoration-dotted align-super text-tiny",
		}),
	};
});

export const createGrid = createComponent((_paths, _locale) => {
	return {
		Grid: repeating({
			label: "Grid",
			description: "Insert a layout grid.",
			icon: <GridIcon />,
			schema: {
				layout: fields.select({
					label: "Layout",
					options: gridLayouts,
					defaultValue: "two-columns",
				}),
				alignment: fields.select({
					label: "Vertical alignment",
					options: gridAlignments,
					defaultValue: "stretch",
				}),
			},
			children: ["GridItem"],
			ContentView(props) {
				const { children, value } = props;

				return (
					<GridPreview alignment={value.alignment} layout={value.layout}>
						{children}
					</GridPreview>
				);
			},
		}),
		GridItem: wrapper({
			label: "Grid item",
			description: "Insert a layout grid cell.",
			icon: <SquareIcon />,
			schema: {
				alignment: fields.select({
					label: "Vertical alignment",
					options: gridAlignments,
					defaultValue: "stretch",
				}),
			},
			forSpecificLocations: true,
			ContentView(props) {
				const { children, value } = props;

				return <GridItemPreview alignment={value.alignment}>{children}</GridItemPreview>;
			},
		}),
	};
});

export const createHeadingId = createComponent((_paths, _locale) => {
	return {
		HeadingId: inline({
			label: "HeadingId",
			description: "Add a custom link target to a heading.",
			icon: <HashIcon />,
			schema: {
				id: fields.text({
					label: "ID",
					validation: { isRequired: true },
				}),
			},
			ContentView(props) {
				const { value } = props;

				return <HeadingIdPreview>{value.id}</HeadingIdPreview>;
			},
		}),
	};
});

export const createLink = createComponent((paths, locale) => {
	return {
		Link: mark({
			label: "Link",
			icon: <LinkIcon />,
			schema: {
				link: createLinkSchema(paths.downloadPath, locale),
			},
			tag: "a",
		}),
	};
});

export const createLinkButton = createComponent((paths, locale) => {
	return {
		LinkButton: wrapper({
			label: "LinkButton",
			description: "Insert a link, which looks like a button.",
			icon: <LinkIcon />,
			schema: {
				link: createLinkSchema(paths.downloadPath, locale),
			},
			ContentView(props) {
				const { children, value } = props;

				return <LinkButtonPreview link={value.link}>{children}</LinkButtonPreview>;
			},
		}),
	};
});

export const createTableOfContents = createComponent((_paths, _locale) => {
	return {
		TableOfContents: block({
			label: "Table of contents",
			description: "Insert a table of contents.",
			icon: <ListIcon />,
			schema: {
				title: fields.text({
					label: "Title",
					validation: { isRequired: false },
				}),
			},
			ContentView(props) {
				const { value } = props;

				return <TableOfContentsPreview title={value.title} />;
			},
		}),
	};
});

export const createTabs = createComponent((_paths, _locale) => {
	return {
		Tabs: repeating({
			label: "Tabs",
			description: "Insert tabs.",
			icon: <CaptionsIcon />,
			schema: {},
			children: ["Tab"],
			ContentView(props) {
				const { children } = props;

				return <TabsPreview>{children}</TabsPreview>;
			},
		}),
		Tab: wrapper({
			label: "Tab",
			description: "Insert a tab panel.",
			icon: <CaptionsIcon />,
			schema: {
				title: fields.text({
					label: "Title",
					validation: { isRequired: true },
				}),
			},
			forSpecificLocations: true,
			ContentView(props) {
				const { children, value } = props;

				return <TabPreview title={value.title}>{children}</TabPreview>;
			},
		}),
	};
});

export const createVideo = createComponent((_paths, _locale) => {
	return {
		Video: wrapper({
			label: "Video",
			description: "Insert a video",
			icon: <VideoIcon />,
			schema: {
				provider: fields.select({
					label: "Provider",
					options: videoProviders,
					defaultValue: "youtube",
				}),
				id: fields.text({
					label: "ID",
					validation: { isRequired: true },
				}),
				startTime: fields.number({
					label: "Start time",
					validation: { isRequired: false },
				}),
			},
			ContentView(props) {
				const { children, value } = props;

				return (
					<VideoPreview id={value.id} provider={value.provider} startTime={value.startTime}>
						{children}
					</VideoPreview>
				);
			},
		}),
	};
});
