// https://github.com/DARIAH-ERIC/dariah-website/blob/main/components/rich-text.tsx

import type { GetVariantProps } from "@acdh-oeaw/style-variants";
import type { JSONContent } from "@tiptap/core";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import cn from "clsx/lite";
import { useExtracted as useTranslations } from "next-intl";
import { Fragment, type ReactNode, useId } from "react";

import { LinkButton, type buttonStyles } from "#/components/ui/button.tsx";
import { createRichTextExtensions } from "#/lib/rich-text-extensions.ts";
import { collectFootnotes, identifyHeadings, isEmptyRichTextDocument, numberFootnotes } from "#/lib/rich-text.ts";

type ButtonVariant = NonNullable<GetVariantProps<typeof buttonStyles>["variant"]>;

/**
 * The cms's own editor constrains which variants an author can pick (see `rich-text-editor.tsx` in
 * `DARIAH-ERIC/knowledge-base`'s `packages/ui/lib`) - this only has to satisfy `LinkButton`'s type, so an unrecognised
 * or missing value falls back to the node schema's own default rather than being rejected.
 */
function asButtonVariant(value: unknown): ButtonVariant {
	return typeof value === "string" && value !== "" ? (value as ButtonVariant) : "primary";
}

const extensions = createRichTextExtensions();

const listFormatter = new Intl.ListFormat("en", { style: "long", type: "conjunction" });

function isRecord(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === "object";
}

/**
 * A resolved `placeholderValue` node's `value` attribute, formatted for display. `null` for a kind the api left
 * unresolved, which falls back to the node's own label.
 */
function formatPlaceholderValue(attrs: Record<string, unknown> | null | undefined): string | null {
	const value = attrs?.value;

	if (typeof value === "number") {
		return String(value);
	}

	if (Array.isArray(value)) {
		const names = value
			.map((item) => (isRecord(item) && typeof item.name === "string" ? item.name : null))
			.filter((name): name is string => name != null);

		return listFormatter.format(names);
	}

	return null;
}

/**
 * A link, resolved to a plain `href` by the api (see `lib/rich-text-extensions.ts`). A mark with no `href` - its target
 * was deleted, unpublished, or never resolved - degrades to plain text rather than a link to nowhere.
 */
function renderLinkMark(
	props: Readonly<{
		mark: { attrs?: Record<string, unknown> | null };
		children?: ReactNode | Array<ReactNode>;
	}>,
): ReactNode {
	const href = props.mark.attrs?.href;

	if (typeof href !== "string" || href === "") {
		return props.children ?? null;
	}

	return <a href={href}>{props.children}</a>;
}

const markMapping = { link: renderLinkMark };

/**
 * Renders a nested `{ doc > paragraph }` richtext value (a footnote's note, a table's caption, a content block's
 * caption) as part of the surrounding line rather than as its own paragraph block.
 *
 * Takes the same node mappings as a `rich_text` block: a caption can carry footnote markers and placeholder values too,
 * and the custom nodes declare no `renderHTML` to fall back on.
 */
function renderInlineRichText(content: unknown): ReactNode {
	if (isEmptyRichTextDocument(content as JSONContent | null | undefined)) {
		return null;
	}

	return renderToReactElement({
		content: content as JSONContent,
		extensions,
		options: {
			markMapping,
			nodeMapping: {
				// oxlint-disable-next-line typescript/no-use-before-define -- Only read at render time, after the module has loaded.
				...nodeMapping,
				paragraph: (paragraphProps: Readonly<{ children?: ReactNode | Array<ReactNode> }>) =>
					paragraphProps.children ?? null,
			},
		},
	});
}

/**
 * The marker, as a link to its note at the end of the document. `number` is attached by {@link numberFootnotes} before
 * rendering; a marker somehow without one (should not happen once numbered) renders nothing rather than an unanchored
 * mark.
 *
 * `fn`/`fnref` and the `doc-noteref`/`doc-backlink` roles are Pandoc's convention for footnotes, which most
 * markdown-to-html pipelines emit.
 *
 * The link sits inside the `sup`, not around it: an underline drawn at the line's baseline under a raised number reads
 * as a stray underscore. The number is underlined only on hover.
 */
function FootnoteNode(props: Readonly<{ node: { attrs?: Record<string, unknown> | null } }>): ReactNode {
	const number = props.node.attrs?.number;

	const t = useTranslations();

	if (typeof number !== "number") {
		return null;
	}

	return (
		<sup>
			<a
				aria-label={t("Footnote {number}", { number: String(number) })}
				className="no-underline hover:underline"
				href={`#fn${String(number)}`}
				id={`fnref${String(number)}`}
				role="doc-noteref"
			>
				{number}
			</a>
		</sup>
	);
}

function renderPlaceholderValueNode(props: Readonly<{ node: { attrs?: Record<string, unknown> | null } }>): ReactNode {
	const attrs = props.node.attrs ?? null;
	const resolved = formatPlaceholderValue(attrs);

	if (resolved != null) {
		return resolved;
	}

	const label = attrs?.label;
	const kind = attrs?.kind;

	return typeof label === "string" ? label : typeof kind === "string" ? kind : null;
}

/**
 * A heading, carrying the anchor {@link identifyHeadings} derived from its text, so a table of contents (and anyone
 * sharing a link to a section) can address it. The stock `renderHTML` would emit a bare `h2`/`h3`/`h4` - the id lives
 * in an attribute the schema does not serialize, the same way a table's caption does.
 *
 * The level is clamped to the range the schema allows (see `lib/rich-text-extensions.ts`), so content authored against
 * an older schema cannot produce an `h1` competing with the page's own, or an `h7`.
 */
function renderHeadingNode(
	props: Readonly<{
		node: { attrs?: Record<string, unknown> | null };
		children?: ReactNode | Array<ReactNode>;
	}>,
): ReactNode {
	const attrs = props.node.attrs ?? null;
	const level = typeof attrs?.level === "number" ? Math.min(Math.max(attrs.level, 2), 4) : 2;
	const id = typeof attrs?.id === "string" && attrs.id !== "" ? attrs.id : undefined;

	const Element = `h${String(level)}` as "h2" | "h3" | "h4";

	return <Element id={id}>{props.children}</Element>;
}

/**
 * Lead-in text, the introduction a content page or detail page opens with, set in the design's `lead-in` style. The cms
 * renders it with the typography plugin's `lead` class, whose smaller, weaker text is not the design's.
 */
function renderLeadInNode(props: Readonly<{ children?: ReactNode | Array<ReactNode> }>): ReactNode {
	return <p className="lead-in">{props.children}</p>;
}

function renderButtonLinkNode(props: Readonly<{ node: { attrs?: Record<string, unknown> | null } }>): ReactNode {
	const attrs = props.node.attrs ?? null;
	const href = attrs?.href;
	const label = attrs?.label;

	if (typeof href !== "string" || href === "" || typeof label !== "string" || label === "") {
		return null;
	}

	return (
		/**
		 * `[&>span]:inline-auto`: `buttonStyles`' base sets `*:inline-full` unconditionally on its child wrapper, sized for
		 * a standalone CTA - inline in a paragraph it would stretch to the full line width instead of sizing to the label.
		 * `[&>span]` outranks that `*:` universal-child selector on specificity, so it wins regardless of the two rules'
		 * order in the stylesheet (`buttonStyles` composes classes with `clsx`, not `tailwind-merge`, so source order there
		 * is not something to rely on).
		 */
		<LinkButton className="[&>span]:inline-auto" href={href} variant={asButtonVariant(attrs?.variant)}>
			{label}
		</LinkButton>
	);
}

/**
 * A table, with its caption rendered from the `caption` attribute {@link createRichTextExtensions} declares - the node's
 * default `renderHTML` would only be able to flatten it to text, since a dom output spec has nowhere to put richtext
 * json.
 */
function renderTableNode(
	props: Readonly<{
		node: { attrs?: Record<string, unknown> | null };
		children?: ReactNode | Array<ReactNode>;
	}>,
): ReactNode {
	const renderedCaption = renderInlineRichText(props.node.attrs?.caption);

	return (
		<table>
			{renderedCaption != null ? <caption>{renderedCaption}</caption> : null}
			<tbody>{props.children}</tbody>
		</table>
	);
}

const nodeMapping = {
	buttonLink: renderButtonLinkNode,
	footnote: FootnoteNode,
	heading: renderHeadingNode,
	leadIn: renderLeadInNode,
	placeholderValue: renderPlaceholderValueNode,
	table: renderTableNode,
};

interface InlineRichTextProps {
	/** Tiptap json for a nested `{ doc > paragraph }` value, e.g. a content block's `caption`. */
	content: unknown;
}

/**
 * A nested richtext value rendered inline, without a paragraph wrapper - for a caller which supplies the surrounding
 * element itself, like the `figcaption` of a content block (`components/content-blocks.tsx`).
 */
export function InlineRichText(props: Readonly<InlineRichTextProps>): ReactNode {
	return renderInlineRichText(props.content);
}

interface FootnotesProps {
	notes: Array<JSONContent | null>;
}

/**
 * The footnotes an item's `rich_text` content carries, in the reading order their markers appear. Exported for
 * `components/content-blocks.tsx`, which lists the notes of every `rich_text` block in an item's content once, at the
 * end, rather than once per block.
 *
 * Set apart from the text above by a rule, in caption-sized type, and numbered like the markers in the text. Notes are
 * rendered outside the typography plugin's `prose` scope, so their links take the accent colour and focus outline here.
 * Notes often cite a long url, which may break anywhere rather than overflow the column; the back link stays on the
 * line of the note's last word. The section's heading is for a screen reader only, as a landmark in the page's outline:
 * the rule already sets the notes apart visually.
 */
export function Footnotes(props: Readonly<FootnotesProps>): ReactNode {
	const t = useTranslations();

	const headingId = useId();

	return (
		<section
			aria-labelledby={headingId}
			className="clear-both border-bs border-stroke-weak text-caption mbs-14 pbs-8"
			role="doc-endnotes"
		>
			<h2 className="sr-only" id={headingId}>
				{t("Footnotes")}
			</h2>
			<ol className="flex list-decimal flex-col gap-3 ps-6 marker:text-text-weak marker:tabular-nums [&_a]:font-medium [&_a]:text-text-accent [&_a]:focus-visible-outline">
				{props.notes.map((note, index) => {
					const number = index + 1;

					return (
						<li
							className="wrap-anywhere ps-1 [&_a:not([role=doc-backlink])]:underline"
							id={`fn${String(number)}`}
							// oxlint-disable-next-line react/no-array-index-key -- Footnotes carry no id of their own; the list is server-rendered and never reordered.
							key={index}
						>
							{renderInlineRichText(note)}
							{"\u00A0"}
							<a
								aria-label={t("Back to footnote {number} in the text", { number: String(number) })}
								href={`#fnref${String(number)}`}
								role="doc-backlink"
							>
								{"↩"}
							</a>
						</li>
					);
				})}
			</ol>
		</section>
	);
}

interface RichTextContentProps {
	/**
	 * Tiptap json for one `rich_text` block. Footnote markers must already carry their `number` attr (see
	 * {@link numberFootnotes}) - this renders the tree only, with no footnotes section of its own, for a caller that
	 * lists notes once across several blocks (`components/content-blocks.tsx`). {@link RichText} is the standalone
	 * version that numbers and lists its own.
	 */
	content: unknown;
	className?: string;
}

export function RichTextContent(props: Readonly<RichTextContentProps>): ReactNode {
	const { content, className } = props;

	if (isEmptyRichTextDocument(content as JSONContent | null | undefined)) {
		return null;
	}

	return (
		/**
		 * `prose-lg` for the design's 18px body text, where plain `prose` would set 16px, at the reading line height.
		 * `max-inline-none` drops the plugin's own 65ch cap: the column the content is rendered into sets the measure (see
		 * `max-inline-measure`), so text and the blocks between it share one width. Headings take the design's title styles
		 * rather than the plugin's scale: 56px above a section, and above a subsection at least the space between
		 * paragraphs - the design's 16px would rely on collapsing into the margin of whatever precedes it, which a block
		 * with none, or in a formatting context of its own, does not provide. On a phone each heading is a step smaller,
		 * 24px and 20px: next to the page's title, 32px there and light, a bold 28px section heading reads as the stronger
		 * one. Links take the accent colour and the site's focus outline. Lists are tight or loose as in markdown (see
		 * `prose-tight-lists`).
		 */
		<div
			className={cn(
				"leading-reading prose prose-lg max-inline-none prose-h2:mbs-14 prose-a:font-medium prose-a:focus-visible-outline prose-a:hover:decoration-2",
				className,
			)}
		>
			{renderToReactElement({
				content: content as JSONContent,
				extensions,
				options: { markMapping, nodeMapping },
			})}
		</div>
	);
}

interface RichTextProps {
	/** Tiptap json, as sent by the api for a `rich_text` content block's `content` field. */
	content: unknown;
	className?: string;
}

/**
 * Renders a standalone tiptap document: numbers its own footnote markers and lists their notes at the end. An item
 * whose content is split across several `rich_text` blocks (interleaved with images, a callout, ...) needs to number
 * and list footnotes across all of them together instead, per the api's documented contract (see the `content` doc
 * comments in `lib/api/schemas.ts`) - `components/content-blocks.tsx` does that, using {@link RichTextContent} and
 * {@link Footnotes} directly.
 */
export function RichText(props: Readonly<RichTextProps>): ReactNode {
	const { content, className } = props;
	const numbered = numberFootnotes(identifyHeadings(content));
	const footnotes = collectFootnotes(numbered);

	return (
		<Fragment>
			<RichTextContent className={className} content={numbered} />
			{footnotes.length > 0 ? <Footnotes notes={footnotes} /> : null}
		</Fragment>
	);
}
