//https://github.com/DARIAH-ERIC/dariah-website/blob/23204e0e79095e90799f957fa41b11aa8f045aab/components/content-blocks.tsx
import type { JSONContent } from "@tiptap/core";
import cn from "clsx/lite";
import type { ReactNode } from "react";

import { ApiImage } from "#/components/api-image.tsx";
import { Caption } from "#/components/caption.tsx";
import { Footnotes, RichTextContent } from "#/components/rich-text.tsx";
import { Accordion, type AccordionItem } from "#/components/ui/accordion.tsx";
import type { BlockImage } from "#/lib/data/api-client.ts";
import {
	collectFootnotes,
	identifyHeadings,
	isEmptyRichTextDocument,
	numberFootnotes,
	toPlainText,
} from "#/lib/rich-text.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === "object";
}

function asBlocks(value: unknown): Array<Record<string, unknown>> {
	return Array.isArray(value) ? value.filter((item) => isRecord(item)) : [];
}

/**
 * An api `BlockImage`, or `null` for a block whose asset is gone. Narrowed by hand like the blocks themselves - a
 * `srcUrl` is what {@link ApiImage} builds every rendition from, so a block without one has no image to render.
 */
function asImage(value: unknown): BlockImage | null {
	if (!isRecord(value) || typeof value.srcUrl !== "string" || value.srcUrl === "") {
		return null;
	}

	return value as BlockImage;
}

/**
 * The slot an `image` block claims, by its `layout`. These are the box, not the size the image is drawn at.
 *
 * A float only floats once the content column - the `@container` {@link ContentBlocks} opens, not the viewport - can
 * spare the width, so a phone-width column gets the image on its own line instead of a caption-width sliver with three
 * words wrapping beside it.
 */
const imageLayoutClassName: Record<string, string> = {
	"float-start": "mbe-4 @lg:float-start @lg:mbe-2 @lg:me-6 @lg:inline-[min(18rem,45%)]",
	"float-end": "mbe-4 @lg:float-end @lg:mbe-2 @lg:ms-6 @lg:inline-[min(18rem,45%)]",
	wide: "ms-auto me-auto inline-[min(56rem,92vw)]",
	full: "ms-[calc(50%-50vw)] me-[calc(50%-50vw)] inline-[100vw]",
	/**
	 * As wide as the image, and centred, so a caption lines up with an image narrower than the column instead of with the
	 * column's edge. `contain-inline-size` keeps a long caption from widening the figure: it wraps at the image.
	 */
	default: "ms-auto me-auto inline-fit [&>figcaption]:contain-inline-size",
};

/**
 * The widest a `default` image is drawn at, in css pixels, and still counts as narrow - about 60% of the reading
 * column. Under one that narrow a long caption wraps into a tall sliver, so it is set beside the image instead.
 */
const narrowImageMaxWidth = 416;

/**
 * A narrow `default` image with its caption beside it, bottom-aligned, the pair centred as one. Only once the column
 * can fit the widest narrow image, the gap and the caption's 12rem minimum (26 + 1.5 + 12rem), and only when there is a
 * caption to set there; otherwise it is stacked like any `default` image.
 */
const narrowImageClassName = cn(
	imageLayoutClassName.default,
	"@min-[40rem]:grid-cols-[auto_minmax(12rem,20rem)] @min-[40rem]:items-end @min-[40rem]:gap-x-6 @min-[40rem]:has-[>figcaption]:grid @min-[40rem]:[&>figcaption]:mbs-0",
);

function isNarrowImage(image: BlockImage, layout: string): boolean {
	return layout === "default" && image.width != null && image.width <= narrowImageMaxWidth;
}

/**
 * What each `layout` ends up occupying, for the browser to pick a rendition against before any css has loaded. Close
 * enough rather than exact: content is laid out in a reading column of about 44rem (`max-inline-measure`), narrower
 * beside a table of contents.
 *
 * On a phone the column is the viewport less the page's padding, 1.5rem on each side. Saying `100vw` there instead is
 * enough to tip a 360px screen at 3x, or a 412px one at 2.625x, onto the 1280 rung where 960 would do. A float floats
 * from its column's `@lg`, 32rem, which the viewport reaches at about 35rem; below that it is the column's width too.
 */
const imageLayoutSizes: Record<string, string> = {
	"float-start": "(min-width: 35rem) 18rem, calc(100vw - 3rem)",
	"float-end": "(min-width: 35rem) 18rem, calc(100vw - 3rem)",
	wide: "min(56rem, 92vw)",
	full: "100vw",
	default: "(min-width: 48rem) 45rem, calc(100vw - 3rem)",
};

function asLayout(value: unknown): string {
	return typeof value === "string" && value in imageLayoutClassName ? value : "default";
}

interface ContentBlockViewProps {
	block: Record<string, unknown>;
}

/**
 * One content block. Every entity's `content`/`description` field is generated as its own, structurally identical union
 * (see the `content` doc comments in `lib/api/schemas.ts`) rather than one shared type, so blocks arrive here loosely
 * typed and are narrowed by hand, the same way the richtext node/mark mappings in `components/rich-text.tsx` are.
 *
 * Every block type the knowledge base currently publishes renders. The two which do not - `hero`, and `data`, which
 * embeds a list of another entity type - carry no instance in any published item, and both need decisions this file
 * cannot make on its own: a page-level layout slot, and a query against another endpoint.
 *
 * Layout is deliberately structural - slots, flow and aspect ratios - since the design system's palette and type scale
 * are still placeholders (see `styles/index.css`); colour and rhythm land with it, not here.
 */
function ContentBlockView(props: Readonly<ContentBlockViewProps>): ReactNode {
	const { block } = props;

	switch (block.type) {
		case "rich_text": {
			return <RichTextContent content={block.content} />;
		}

		case "image": {
			const image = asImage(block.image);

			if (image == null) {
				return null;
			}

			const layout = asLayout(block.layout);

			return (
				<figure className={isNarrowImage(image, layout) ? narrowImageClassName : imageLayoutClassName[layout]}>
					{/**
					 * Sized by its `width` attribute (capped at the column by preflight's `max-inline-full`), not `inline-auto`: the figure
					 * is as wide as its image, so the image must have its width before it loads, or the figure collapses until it does.
					 */}
					<ApiImage
						className="ms-auto me-auto"
						image={image}
						sizes={imageLayoutSizes[layout] ?? imageLayoutSizes.default}
					/>
					<Caption content={block.caption} license={image.license} />
				</figure>
			);
		}

		case "media_text": {
			const image = asImage(block.image);

			if (image == null) {
				return <RichTextContent content={block.content} />;
			}

			const side = block.side === "end" ? "end" : "start";

			return (
				/** `flow-root` so the floated thumbnail is contained by this block rather than escaping into the next one. */
				<div className="flow-root">
					<figure
						className={cn(
							"mbe-2 inline-36",
							/**
							 * A thumbnail - a portrait, a logo - at a fixed width, never stretched to fill the column. It floats only
							 * once the column can spare the width; below that the pairing stacks, image then text.
							 */
							side === "end" ? "@sm:float-end @sm:ms-4 @sm:mbs-1.5" : "@sm:float-start @sm:me-4 @sm:mbs-1.5",
						)}
					>
						{/*
						 * At its own aspect ratio, so a portrait keeps its head and a logo its ends; capped, so an unusually tall
						 * image is cropped rather than towering beside the text.
						 */}
						<ApiImage className="block-auto inline-full max-block-56 object-cover" image={image} sizes="9rem" />
						<Caption content={block.caption} license={image.license} />
					</figure>
					<RichTextContent content={block.content} />
				</div>
			);
		}

		case "gallery": {
			return <GalleryBlockView block={block} />;
		}

		case "embed": {
			/**
			 * The api resolves a provider url to the url which may be framed - for youtube, its cookie-less variant - so an
			 * embed with none resolved is one we cannot frame, and is skipped rather than framed from `url`.
			 */
			const embedUrl = typeof block.embedUrl === "string" ? block.embedUrl : "";

			if (embedUrl === "") {
				return null;
			}

			/**
			 * The frame's accessible name. The api guarantees a non-empty `title` - either the editor's own, or a generic
			 * fallback naming the embed's provider - so it is used as-is rather than derived from the caption here.
			 */
			const title = typeof block.title === "string" && block.title !== "" ? block.title : "Embedded content";

			return (
				<figure>
					<iframe
						allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
						className="aspect-video inline-full"
						loading="lazy"
						referrerPolicy="strict-origin-when-cross-origin"
						// oxlint-disable-next-line react/iframe-missing-sandbox -- A player needs both to run; the pair only lifts the sandbox for a document served from our own origin, and an embed is always third-party.
						sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
						src={embedUrl}
						title={title}
					/>
					<Caption content={block.caption} />
				</figure>
			);
		}

		case "callout": {
			const title = typeof block.title === "string" ? block.title : null;
			const intent = typeof block.intent === "string" ? block.intent : "neutral";

			return (
				/**
				 * `aria-label` makes this an addressable region, so it is reachable by landmark and announced as a set-aside
				 * rather than blending into the prose. `intent` is carried as a data attribute for the design system to colour
				 * later - it is the block's only visual distinction, and nothing here can express it yet.
				 *
				 * The title is a paragraph set in a heavier weight, not a `strong` and not a heading. `strong` would claim the
				 * title is _important_, which is a different thing from being a label, and would repeat as emphasis what the
				 * `aria-label` above already announces as the region's name. A heading would enter the page outline (and the
				 * table of contents built from it - see `lib/rich-text.ts`) as though a set-aside were a section of the text.
				 *
				 * On a phone the padding narrows, so the text keeps a usable line length, and the title takes a step down, as
				 * the prose's headings do: at title 5 it would be as large as a subsection's heading there.
				 */
				<aside
					aria-label={title ?? "Callout"}
					className="bg-background-callout p-10 font-body text-body max-sm:p-6"
					data-intent={intent}
				>
					{title != null ? (
						<p className="mbe-2 font-heading text-title-5 max-sm:text-body max-sm:font-bold">{title}</p>
					) : null}
					<ContentBlockList blocks={block.blocks} />
				</aside>
			);
		}

		case "accordion": {
			const items = Array.isArray(block.items) ? block.items.filter((item) => isRecord(item)) : [];

			if (items.length === 0) {
				return null;
			}

			const accordionItems: Array<AccordionItem> = items.map((item, index) => {
				return {
					/** Content blocks carry no id of their own; an item's position is stable for as long as it is rendered. */
					id: String(index),
					title: typeof item.title === "string" ? item.title : null,
					children: <ContentBlockList blocks={item.blocks} />,
				};
			});

			return <Accordion items={accordionItems} />;
		}

		default: {
			return null;
		}
	}
}

interface GalleryBlockViewProps {
	block: Record<string, unknown>;
}

/**
 * A gallery, in one of three arrangements.
 *
 * Only a captioned gallery becomes a `figure` of its own, with the item figures nested inside it - that nesting is what
 * makes the outer caption read as the set's rather than as the last image's.
 */
function GalleryBlockView(props: Readonly<GalleryBlockViewProps>): ReactNode {
	const { block } = props;

	const items = (Array.isArray(block.items) ? block.items.filter((item) => isRecord(item)) : [])
		.map((item) => {
			return { image: asImage(item.image), caption: item.caption };
		})
		.filter((item): item is { image: BlockImage; caption: unknown } => item.image != null);

	if (items.length === 0) {
		return null;
	}

	const layout = block.layout;

	const images =
		layout === "logos" ? (
			/**
			 * A row of marks to recognise rather than images to look at, so it is sized by height: every logo carries the
			 * same optical weight and the row wraps instead of reflowing into tracks. A caption here only reaches `alt` - a
			 * caption under each mark would rebuild the grid this arrangement exists to avoid.
			 */
			<ul className="flex list-none flex-wrap items-center justify-center gap-x-8 gap-y-6 p-0" role="list">
				{items.map((item, index) => (
					// oxlint-disable-next-line react/no-array-index-key -- Gallery items carry no id of their own.
					<li className="flex items-center" key={index}>
						<ApiImage
							className="inline-auto max-block-24"
							image={{ ...item.image, alt: item.image.alt ?? toPlainText(item.caption) }}
							sizes="(min-width: 32rem) 12rem, 40vw"
						/>
					</li>
				))}
			</ul>
		) : layout === "carousel" ? (
			<div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pbe-2">
				{items.map((item, index) => (
					/** A cap, not a fixed width: a narrow source makes a narrow slide rather than being stretched over one. */
					// oxlint-disable-next-line react/no-array-index-key -- Gallery items carry no id of their own.
					<figure className="max-inline-[min(20rem,80vw)] shrink-0 snap-start" key={index}>
						<ApiImage
							className="ms-auto me-auto inline-auto max-block-96"
							image={item.image}
							sizes="min(20rem, 80vw)"
						/>
						<Caption content={item.caption} license={item.image.license} />
					</figure>
				))}
			</div>
		) : (
			/**
			 * `auto-fill`, not `auto-fit`: an empty track keeps its width, so a two-image gallery reads as the first two
			 * cells of a grid instead of two images marooned in half-width tracks. The `min(…, 100%)` guard keeps a track
			 * from overflowing a column narrower than the track minimum.
			 *
			 * Two tracks need 33rem and three 50rem, so a reading column (about 44rem) gets two, and a phone-width one a
			 * single track the column's width.
			 */
			<div className="grid grid-cols-[repeat(auto-fill,minmax(min(16rem,100%),1fr))] items-start gap-4">
				{items.map((item, index) => (
					// oxlint-disable-next-line react/no-array-index-key -- Gallery items carry no id of their own.
					<figure key={index}>
						<ApiImage
							className="ms-auto me-auto inline-auto max-block-96"
							image={item.image}
							sizes="(min-width: 36rem) 22rem, calc(100vw - 3rem)"
						/>
						<Caption content={item.caption} license={item.image.license} />
					</figure>
				))}
			</div>
		);

	if (isEmptyRichTextDocument(block.caption as JSONContent | null | undefined)) {
		return images;
	}

	return (
		<figure>
			{images}
			<Caption content={block.caption} />
		</figure>
	);
}

interface ContentBlockListProps {
	blocks: unknown;
}

/**
 * The blocks nested inside a `callout` or an accordion item. Flat, because a float can only escape into a sibling, and
 * a nested block has none of the surrounding prose to wrap around it.
 */
function ContentBlockList(props: Readonly<ContentBlockListProps>): ReactNode {
	return asBlocks(props.blocks).map((block, index) => (
		// oxlint-disable-next-line react/no-array-index-key -- Content blocks carry no id of their own.
		<ContentBlockView block={block} key={index} />
	));
}

/**
 * The space above and below a block set apart from the text - a figure, a callout, an accordion: the typography
 * plugin's spacing around a figure in `prose-lg`. The text's own blocks need none, since their paragraphs bring their
 * margins, except at a block's edges, where the plugin drops them.
 */
const setApartClassName = "mbs-8 mbe-8";

/** Whether a block is an image pulled aside for the text of the next block to wrap around. */
function isFloatedImage(block: Record<string, unknown> | undefined): boolean {
	return block?.type === "image" && (block.layout === "float-start" || block.layout === "float-end");
}

interface ContentBlocksProps {
	/** The `content`/`description` array an api entity carries - see `lib/api/schemas.ts`. */
	blocks: unknown;
	className?: string;
}

/**
 * Renders an item's content blocks. Numbers footnote markers and lists their notes once, across every `rich_text` (and
 * `media_text`) block in the array - including ones nested inside a `callout` or an `accordion` item - matching the
 * api's documented contract that a marker's number is its position across the whole item, not just the block it sits
 * in.
 *
 * Normal flow rather than a flex column, so a floated image's float reaches the block after it and its text wraps
 * around it. Only the `rich_text` immediately following such an image may wrap; every other block clears, so a float
 * can never overlap a figure or an accordion below it.
 *
 * `@container` makes every width decision inside a block depend on the column the blocks are rendered into rather than
 * on the viewport, since the same content renders in a full reading column on a details page and in something much
 * narrower elsewhere.
 *
 * Without any blocks it renders nothing, rather than an empty wrapper which would still take a gap or margin in its
 * parent's layout.
 */
export function ContentBlocks(props: Readonly<ContentBlocksProps>): ReactNode {
	const blocks = asBlocks(numberFootnotes(identifyHeadings(props.blocks)));

	if (blocks.length === 0) {
		return null;
	}

	const footnotes = collectFootnotes(blocks);

	return (
		<div className={cn("@container", props.className)}>
			{blocks.map((block, index) => {
				const wrapsPrecedingFloat = block.type === "rich_text" && isFloatedImage(blocks[index - 1]);
				const isSetApart = block.type !== "rich_text" && !isFloatedImage(block);
				/**
				 * The blocks start level with the columns beside them, so the first block brings no space above it: neither a
				 * set-apart block's, nor a leading heading's, whose `mbs-*` outranks the typography plugin's own reset for a
				 * first child (see `RichTextContent`).
				 */
				const isFirst = index === 0;

				return (
					<div
						className={cn(
							!wrapsPrecedingFloat && "clear-both",
							isSetApart && (isFirst ? "mbe-8" : setApartClassName),
							isFirst && block.type === "rich_text" && "[&>*>:first-child]:mbs-0",
						)}
						// oxlint-disable-next-line react/no-array-index-key -- Content blocks carry no id of their own.
						key={index}
					>
						<ContentBlockView block={block} />
					</div>
				);
			})}
			{footnotes.length > 0 ? <Footnotes notes={footnotes} /> : null}
		</div>
	);
}
