import type { JSONContent } from "@tiptap/core";
import cn from "clsx/lite";
import { useExtracted } from "next-intl";
import type { ReactNode } from "react";

import { Caption } from "#/components/caption.tsx";
import { ApiImage } from "#/components/image.tsx";
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

/** `null` for a block whose asset is gone. */
function asImage(value: unknown): BlockImage | null {
	if (!isRecord(value) || typeof value.srcUrl !== "string" || value.srcUrl === "") {
		return null;
	}

	return value as BlockImage;
}

/** A float only floats once the content column (not the viewport) can spare the width. */
const imageLayoutClassName: Record<string, string> = {
	"float-start": "mbe-4 @lg:float-start @lg:mbe-2 @lg:me-6 @lg:inline-[min(18rem,45%)]",
	"float-end": "mbe-4 @lg:float-end @lg:mbe-2 @lg:ms-6 @lg:inline-[min(18rem,45%)]",
	wide: "ms-auto me-auto inline-[min(56rem,92vw)]",
	full: "ms-[calc(50%-50vw)] me-[calc(50%-50vw)] inline-[100vw]",
	/** As wide as the image, so the caption lines up with it. `contain-inline-size` keeps a long caption from widening it. */
	default: "ms-auto me-auto inline-fit [&>figcaption]:contain-inline-size",
};

/** Up to this width (css pixels), a `default` image gets its caption beside it rather than below. */
const narrowImageMaxWidth = 416;

/** `40rem` fits the widest narrow image, the gap and the caption's minimum width (26 + 1.5 + 12rem). */
const narrowImageClassName = cn(
	imageLayoutClassName.default,
	"@min-[40rem]:grid-cols-[auto_minmax(12rem,20rem)] @min-[40rem]:items-end @min-[40rem]:gap-x-6 @min-[40rem]:has-[>figcaption]:grid @min-[40rem]:[&>figcaption]:mbs-0",
);

function isNarrowImage(image: BlockImage, layout: string): boolean {
	return layout === "default" && image.width != null && image.width <= narrowImageMaxWidth;
}

/**
 * On a phone the column is the viewport less the page's padding (`calc(100vw - 3rem)`): `100vw` would make high-density
 * screens pick a larger rendition than needed.
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
 * Every entity's content field is generated as its own union type, so blocks are narrowed by hand.
 *
 * `hero` and `data` blocks are not rendered yet.
 */
function ContentBlockView(props: Readonly<ContentBlockViewProps>): ReactNode {
	const { block } = props;

	const t = useExtracted();

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
					{/* Not `inline-auto`: the figure is as wide as the image, so the image needs its width before it loads. */}
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
							side === "end" ? "@sm:float-end @sm:ms-4 @sm:mbs-1.5" : "@sm:float-start @sm:me-4 @sm:mbs-1.5",
						)}
					>
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
			/** The api resolves the url which may be framed. Without one, the embed is skipped rather than framed from `url`. */
			const embedUrl = typeof block.embedUrl === "string" ? block.embedUrl : "";

			if (embedUrl === "") {
				return null;
			}

			const title = typeof block.title === "string" && block.title !== "" ? block.title : t("Eingebetteter Inhalt");

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
				 * `intent` is not styled yet. The title is not a heading, so the callout stays out of the page outline and the
				 * table of contents.
				 */
				<aside
					aria-label={title ?? t("Hinweis")}
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

/** Only a captioned gallery becomes a `figure`, so that its caption reads as the set's rather than the last image's. */
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
			/** Logos are sized by height, so they carry the same visual weight. Captions only become `alt` text. */
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
			/** `auto-fill`, not `auto-fit`: a two-image gallery keeps the track width instead of stretching to half the row. */
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

/** The blocks nested inside a `callout` or an accordion item. */
function ContentBlockList(props: Readonly<ContentBlockListProps>): ReactNode {
	return asBlocks(props.blocks).map((block, index) => (
		// oxlint-disable-next-line react/no-array-index-key -- Content blocks carry no id of their own.
		<ContentBlockView block={block} key={index} />
	));
}

/** The typography plugin's spacing around a figure, the same in `prose` and `prose-lg`. */
const setApartClassName = "mbs-8 mbe-8";

/** Whether a block is an image pulled aside for the text of the next block to wrap around. */
function isFloatedImage(block: Record<string, unknown> | undefined): boolean {
	return block?.type === "image" && (block.layout === "float-start" || block.layout === "float-end");
}

interface ContentBlocksProps {
	blocks: unknown;
	className?: string;
}

/**
 * Footnotes are numbered across all blocks, including nested ones, and listed once at the end.
 *
 * Normal flow rather than a flex column, so a floated image's text can wrap around it. Only a `rich_text` block right
 * after a floated image wraps; every other block clears the float.
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
				/** A leading heading's `mbs-*` would override the typography plugin's reset for a first child. */
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
