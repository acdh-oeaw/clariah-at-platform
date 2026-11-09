import type { GetVariantProps } from "@acdh-oeaw/style-variants";
import type { JSONContent } from "@tiptap/core";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import cn from "clsx/lite";
import { useLocale, useExtracted as useTranslations } from "next-intl";
import NextLink from "next/link";
import { Fragment, type ReactNode, useId } from "react";

import { LinkButton, type buttonStyles } from "#/components/ui/button.tsx";
import { isValidLocale } from "#/lib/i18n/locales.ts";
import { localizeHref } from "#/lib/navigation/convert.ts";
import { createRichTextExtensions } from "#/lib/rich-text-extensions.ts";
import { collectFootnotes, identifyHeadings, isEmptyRichTextDocument, numberFootnotes } from "#/lib/rich-text.ts";

type ButtonVariant = NonNullable<GetVariantProps<typeof buttonStyles>["variant"]>;

/** The variants the cms offers for an inline button. */
const richTextButtonVariants = new Set<ButtonVariant>(["primary", "secondary", "outline"]);

function asButtonVariant(value: unknown): ButtonVariant {
	return richTextButtonVariants.has(value as ButtonVariant) ? (value as ButtonVariant) : "primary";
}

const extensions = createRichTextExtensions();

const listFormatter = new Intl.ListFormat("en", { style: "long", type: "conjunction" });

function isRecord(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === "object";
}

/** `null` for a kind the api left unresolved. */
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
 * A link whose target the api could not resolve has no `href`, and renders as plain text. Entity links resolve to
 * locale-less paths, in the locale named by `entity.locale`, which falls back to the default locale for a target
 * without a translation.
 */
function LinkMark(
	props: Readonly<{
		mark: { attrs?: Record<string, unknown> | null };
		children?: ReactNode | Array<ReactNode>;
	}>,
): ReactNode {
	const href = props.mark.attrs?.href;
	const entity = props.mark.attrs?.entity;

	const currentLocale = useLocale();

	if (typeof href !== "string" || href === "") {
		return props.children ?? null;
	}

	if (href.startsWith("/") && !href.startsWith("//")) {
		const locale = isRecord(entity) && isValidLocale(entity.locale) ? entity.locale : currentLocale;

		return <NextLink href={localizeHref(href, locale)}>{props.children}</NextLink>;
	}

	return <a href={href}>{props.children}</a>;
}

const markMapping = { link: LinkMark };

/** Renders a `{ doc > paragraph }` value (a footnote's note, a caption) without the paragraph. */
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

/** `number` is attached by {@link numberFootnotes}. Ids and roles follow Pandoc's footnote markup. */
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

/** With the anchor {@link identifyHeadings} derived, which the stock `renderHTML` would drop. */
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
	// A qr code points to this anchor on the old website.
	return <Element id={id === "events-2024-and-2025" ? "events-2024--2025" : id}>{props.children}</Element>;
}

function renderLeadInNode(props: Readonly<{ children?: ReactNode | Array<ReactNode> }>): ReactNode {
	return <p className="lead-in">{props.children}</p>;
}

function ButtonLinkNode(props: Readonly<{ node: { attrs?: Record<string, unknown> | null } }>): ReactNode {
	const attrs = props.node.attrs ?? null;
	const href = attrs?.href;
	const label = attrs?.label;

	const locale = useLocale();

	if (typeof href !== "string" || href === "" || typeof label !== "string" || label === "") {
		return null;
	}

	return (
		/** Overrides the button's `*:inline-full`, which would stretch it across the line. */
		<LinkButton
			className="inline-flex [&>span]:inline-auto"
			href={localizeHref(href, locale)}
			variant={asButtonVariant(attrs?.variant)}
		>
			{label}
		</LinkButton>
	);
}

/** The caption is rich text, which the stock `renderHTML` can't render. */
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
	buttonLink: ButtonLinkNode,
	footnote: FootnoteNode,
	heading: renderHeadingNode,
	leadIn: renderLeadInNode,
	placeholderValue: renderPlaceholderValueNode,
	table: renderTableNode,
};

interface InlineRichTextProps {
	/** A `{ doc > paragraph }` value, e.g. a content block's `caption`. */
	content: unknown;
}

export function InlineRichText(props: Readonly<InlineRichTextProps>): ReactNode {
	return renderInlineRichText(props.content);
}

interface FootnotesProps {
	notes: Array<JSONContent | null>;
}

/** Rendered outside the typography plugin's `prose` scope, so links are styled here. */
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
			<ol className="flex list-decimal flex-col gap-3 ps-6 marker:text-text-weak marker:tabular-nums [&_a]:font-medium [&_a]:text-text-accent">
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
	/** Footnote markers must already be numbered, see {@link numberFootnotes}. Does not list the notes. */
	content: unknown;
	className?: string;
}

/** `max-inline-none`: the surrounding column sets the measure, so text and blocks share one width. */
export const richTextClassName =
	"leading-reading prose md:prose-lg max-inline-none prose-h2:mbs-10 md:prose-h2:mbs-14 prose-a:font-medium prose-a:hover:decoration-2 prose-headings:[&_a]:font-[inherit]";

export function RichTextContent(props: Readonly<RichTextContentProps>): ReactNode {
	const { content, className } = props;

	if (isEmptyRichTextDocument(content as JSONContent | null | undefined)) {
		return null;
	}

	return (
		<div className={cn(richTextClassName, className)}>
			{renderToReactElement({
				content: content as JSONContent,
				extensions,
				options: { markMapping, nodeMapping },
			})}
		</div>
	);
}

interface RichTextProps {
	content: unknown;
	className?: string;
}

/** A standalone document, which numbers and lists its own footnotes. For content blocks, use `ContentBlocks`. */
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
