"use client";
import { cn } from "@acdh-oeaw/style-variants";
import type { JSONContent } from "@tiptap/core";
import { Heading } from "@tiptap/extension-heading";
import { Table } from "@tiptap/extension-table";
import { TableKit } from "@tiptap/extension-table/kit";
import { StarterKit } from "@tiptap/starter-kit";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import { useFormatter } from "next-intl";
import type { ReactNode } from "react";

import { ButtonLink, renderButtonLink } from "#/components/button-link";
import { linkStyles } from "#/components/link";
import { PlaceholderValue, renderPlaceholderValue } from "#/components/placeholder-value";
import { RichTextCaption } from "#/components/rich-text-caption";
import { createRichTextLinkRenderer } from "#/components/rich-text-link";
import { Footnote, RichTextFootnote } from "#/components/richt-text-footnote";

interface RichTextProps {
	content: JSONContent;
	footnoteScope?: string;
}

interface HeadingAttributes {
	level: number;
	id?: string;
}

/** An empty spacer paragraph - `{ "type": "paragraph" }`, or one holding only whitespace. */
function isBlankNode(node: JSONContent): boolean {
	if (node.type !== "paragraph") {
		return false;
	}

	return (node.content ?? []).every((child) => child.type === "text" && (child.text ?? "").trim() === "");
}

/**
 * Drops blank paragraphs from the start and end of a document, as the backend does before rendering. The WordPress
 * import left spacer paragraphs throughout the content, and one sitting at the edge of a block contributes an empty
 * line box plus its top margin to the gap against the neighbouring block. Interior blanks stay: they separate
 * paragraphs that are visible either way, so dropping them would edit the copy rather than the spacing between blocks.
 */
function withTrimmedBlankEdges(document: JSONContent): JSONContent {
	const nodes = document.content;

	if (nodes == null) {
		return document;
	}

	let start = 0;
	let end = nodes.length;

	while (start < end) {
		const node = nodes[start];
		if (node == null || !isBlankNode(node)) {
			break;
		}
		start += 1;
	}

	while (end > start) {
		const node = nodes[end - 1];
		if (node == null || !isBlankNode(node)) {
			break;
		}
		end -= 1;
	}

	return { ...document, content: nodes.slice(start, end) };
}

/**
 * Lists take the same top margin as paragraphs, so one following a heading is not flush against it, while a list nested
 * in an item stays tight to the line introducing it. Markers hang outside the content box, so wrapped lines line up
 * with the text rather than with the marker.
 */
const listStyles = cn("mbs-4 list-outside ps-6", "[&>li>p:first-child]:mbs-0!", "[&>li>ol]:mbs-0! [&>li>ul]:mbs-0!");

const richTextLink = createRichTextLinkRenderer(
	cn(
		linkStyles({ variant: "paragraph" }),
		"inline [font-size:inherit]! leading-[inherit]! break-all [[href^='mailto:']]:whitespace-nowrap",
	),
);

interface TableCellNodeProps {
	node: { attrs: Record<string, unknown> };
	children?: ReactNode;
}

interface TableNodeProps {
	node: { attrs: Record<string, unknown> };
	children?: ReactNode;
}

/**
 * The cell extensions spell their span attributes the HTML way, which React rejects, so render cells here instead of
 * letting the static renderer serialise them.
 */
function renderTableCell(element: "td" | "th", props: TableCellNodeProps): ReactNode {
	const Element = element;
	const { colspan, rowspan } = props.node.attrs;

	return (
		<Element
			className={cn(
				"border border-gray-300 p-3 align-top [&>p:first-child]:mbs-0!",
				element === "th" && "bg-gray-100 text-start font-medium",
			)}
			colSpan={typeof colspan === "number" ? colspan : undefined}
			rowSpan={typeof rowspan === "number" ? rowspan : undefined}
		>
			{props.children}
		</Element>
	);
}

/**
 * The caption remains the table's first child so it names the table for assistive technology; `caption-bottom` changes
 * only its visual placement.
 */
function renderTable(props: TableNodeProps, footnoteScope: string): ReactNode {
	const caption = props.node.attrs.caption;

	return (
		<div className="overflow-x-auto my-4">
			<table className="w-full border-collapse">
				{caption != null ? (
					<caption className="caption-bottom pt-2 text-left text-small text-gray-900">
						<RichTextCaption content={caption} footnoteScope={footnoteScope} />
					</caption>
				) : null}
				<tbody>{props.children}</tbody>
			</table>
		</div>
	);
}

const ExtendedHeading = Heading.extend({
	addAttributes() {
		return {
			...this.parent?.(),
			id: {
				default: null,
				renderHTML(attributes: HeadingAttributes) {
					const id = attributes.id;
					if (id != null) {
						return { id };
					}
					return {};
				},
			},
		};
	},
});

/**
 * A table caption is rich-text JSON stored as an attribute because the table's children must all be rows. Registering
 * it on the schema preserves it until the custom table mapping can render it.
 */
const CaptionedTable = Table.extend({
	addAttributes() {
		return {
			...this.parent?.(),
			caption: { default: null },
		};
	},
}).configure({ resizable: false });

export function RichText(props: Readonly<RichTextProps>): ReactNode {
	const { content, footnoteScope = "rich-text" } = props;

	const format = useFormatter();

	return renderToReactElement({
		content: withTrimmedBlankEdges(content),
		extensions: [
			StarterKit.configure({
				// `ExtendedHeading` replaces the bundled heading extension, which shares its name.
				heading: false,
				paragraph: {
					HTMLAttributes: {
						class: "text-regular mt-4",
					},
				},
				link: richTextLink.linkOptions,
				blockquote: {
					HTMLAttributes: {
						class: cn(
							"relative my-5 flex flex-col gap-6 bg-(image:--block-quote-section-bg) p-5 xl:my-13 xl:px-6 xl:py-4 [&>p]:z-2 [&>p]:mbs-0!",
							"after:absolute after:inset-s-1/2 after:inset-bs-1/2 after:z-1 after:-translate-1/2 after:bg-[url(/assets/images/quote-mark.svg)] after:content-[''] after:block-full after:inline-full after:max-block-38 after:max-inline-56",
						),
					},
				},
				bulletList: {
					HTMLAttributes: {
						class: cn(listStyles, "list-disc"),
					},
				},
				orderedList: {
					HTMLAttributes: {
						class: cn(listStyles, "list-decimal"),
					},
				},
				horizontalRule: {
					HTMLAttributes: {
						class: "mt-4",
					},
				},
			}),
			ExtendedHeading.configure({
				HTMLAttributes: {
					class: cn(
						// Every level takes the same top margin, one step above the `mt-4` between
						// paragraphs, so a heading reads as belonging to the text below it.
						"mbs-6",
						"[h1]:text-h2",
						"[h2]:text-h2 [h2]:text-[2rem] [h2]:leading-normal [h2]:font-medium [h2]:tracking-normal",
						"[h3]:text-h3",
						"[h4]:text-h4",
					),
				},
			}),
			PlaceholderValue,
			ButtonLink,
			Footnote,
			/**
			 * Tables carry data rather than layout, so column widths are left to the stylesheet: `resizable: false` matches
			 * the backend, which therefore never writes `colwidth`.
			 */
			TableKit.configure({ table: false }),
			CaptionedTable,
		],
		options: {
			markMapping: richTextLink.markMapping,
			nodeMapping: {
				footnote({ node }) {
					const number: unknown = node.attrs.number;

					return <RichTextFootnote footnoteScope={footnoteScope} number={number} />;
				},
				placeholderValue(nodeProps) {
					return renderPlaceholderValue(nodeProps, format);
				},
				/**
				 * Without a mapping the static renderer serialises the node via its `renderHTML` into a bare `<a
				 * data-button-link>`, indistinguishable from an ordinary link.
				 */
				buttonLink(nodeProps) {
					return renderButtonLink(nodeProps);
				},
				/**
				 * A table wider than the content column has to scroll on its own rather than widen the page, and the static
				 * renderer emits no wrapper to scroll. Overriding the node drops the `tbody` that the extension's own
				 * `renderHTML` provides, so reinstate it here.
				 */
				table(nodeProps) {
					return renderTable(nodeProps, footnoteScope);
				},

				tableHeader(nodeProps) {
					return renderTableCell("th", nodeProps);
				},

				tableCell(nodeProps) {
					return renderTableCell("td", nodeProps);
				},
			},
		},
	});
}
