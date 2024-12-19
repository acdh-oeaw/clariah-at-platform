export const calloutKinds = [
	{ label: "Caution", value: "caution" },
	{ label: "Important", value: "important" },
	{ label: "Note", value: "note" },
	{ label: "Tip", value: "tip" },
	{ label: "Warning", value: "warning" },
] as const;

export type CalloutKind = (typeof calloutKinds)[number]["value"];

export const figureAlignments = [
	{ label: "Center", value: "center" },
	{ label: "Stretch", value: "stretch" },
] as const;

export type FigureAlignment = (typeof figureAlignments)[number]["value"];

export const gridAlignments = [
	{ label: "Center", value: "center" },
	{ label: "Stretch", value: "stretch" },
] as const;

export type GridAlignment = (typeof gridAlignments)[number]["value"];

export const gridLayouts = [
	{ label: "Two columns", value: "two-columns" },
	{ label: "Three columns", value: "three-columns" },
	{ label: "Four columns", value: "four-columns" },
	{ label: "Two columns, right is 2x as wide", value: "one-two-columns" },
	{ label: "Two columns, right is 3x as wide", value: "one-three-columns" },
	{ label: "Two columns, right is 4x as wide", value: "one-four-columns" },
] as const;

export type GridLayout = (typeof gridLayouts)[number]["value"];

export const linkKinds = [
	{ label: "Download", value: "download" },
	{ label: "External", value: "external" },
	{ label: "Home page", value: "index-page" },
	{ label: "Consortium", value: "consortium" },
	{ label: "Events", value: "events" },
	{ label: "Events overview", value: "events-overview" },
	{ label: "News", value: "news" },
	{ label: "News overview", value: "news-overview" },
	{ label: "Projects", value: "projects" },
	{ label: "Projects overview", value: "projects-overview" },
	{ label: "Pages", value: "pages" },
] as const;

export type LinkKind = (typeof linkKinds)[number]["value"];

export const videoProviders = [{ label: "YouTube", value: "youtube" }] as const;

export type VideoProvider = (typeof videoProviders)[number]["value"];
