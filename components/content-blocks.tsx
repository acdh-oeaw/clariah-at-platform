import { log, unreachable } from "@acdh-oeaw/lib";
import { cn } from "@acdh-oeaw/style-variants";
import type { JSONContent } from "@tiptap/core";
import { ChevronsDownIcon } from "lucide-react";
import { type ReactNode, useId } from "react";

import { GalleryCarousel } from "#/components/gallery-carousel.tsx";
import { GalleryGrid } from "#/components/gallery-grid.tsx";
import { ApiImage } from "#/components/image.tsx";
import { RichTextCaption, getRichTextPlainText } from "#/components/rich-text-caption.tsx";
import { RichText } from "#/components/rich-text.tsx";
import type { components } from "#/lib/openapi/types.ts";
import { collectFootnotes, numberFootnotes } from "#/lib/rich-text-footnotes.ts";

interface ContentBlocksProps {
	className?: string;
	fields: components["schemas"]["Page"]["content"];
}

export function ContentBlocks(props: Readonly<ContentBlocksProps>): ReactNode {
	const { className, fields } = props;
	const footnoteScope = useId();
	const numberedFields = numberFootnotes(fields);
	const footnotes = collectFootnotes(numberedFields);
	const footnotesLabelId = `footnotes-${footnoteScope}`;

	/** Footnotes are separated by the same `mt-4` that sits between paragraphs. */
	const listStyles = cn("list-outside ps-6", "[&>li>p:first-child]:mbs-0!", "[&>li+li]:mbs-4");

	return (
		<div className={cn("@container", className)}>
			{numberedFields.map((field, index) => renderContentBlock(field, index, footnoteScope))}
			{footnotes.length > 0 ? (
				<section
					aria-labelledby={footnotesLabelId}
					className="clear-both border-t border-gray-300 pt-4 mt-6"
					role="doc-endnotes"
				>
					<p className="text-small font-semibold text-gray-700 uppercase" id={footnotesLabelId}>
						Footnotes
					</p>
					<ol className={cn(listStyles, "mbs-2 list-decimal")}>
						{footnotes.map((note, index) => {
							const number = index + 1;

							return (
								<li id={`fn-${footnoteScope}-${String(number)}`} key={number}>
									{note != null ? <RichTextCaption content={note} /> : null}
									{"\u00A0"}
									<a
										aria-label={`Back to footnote ${String(number)} in the text`}
										className="text-gray-700 no-underline"
										href={`#fnref-${footnoteScope}-${String(number)}`}
										role="doc-backlink"
									>
										↩
									</a>
								</li>
							);
						})}
					</ol>
				</section>
			) : null}
		</div>
	);
}

function renderContentBlock(
	field: components["schemas"]["Page"]["content"][number],
	index: number,
	footnoteScope: string,
): ReactNode {
	switch (field.type) {
		case "accordion": {
			if (field.items.length === 0) {
				return null;
			}

			return (
				<div key={index} className="flex flex-col divide-y divide-gray-300 rounded-lg border border-gray-300 mt-4">
					{field.items.map((item, itemIndex) => (
						// Accordion items do not have ids in the API schema.
						// eslint-disable-next-line @eslint-react/no-array-index-key
						<details key={itemIndex} className="group px-4">
							<summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-3 font-medium text-regular [&::-webkit-details-marker]:hidden">
								{item.title}
								<ChevronsDownIcon aria-hidden="true" className="shrink-0 transition-transform group-open:rotate-180" />
							</summary>
							{item.blocks.length > 0 ? (
								<div className="flow-root pb-3 *:first:mt-0!">
									{item.blocks.map((block, blockIndex) => renderContentBlock(block, blockIndex, footnoteScope))}
								</div>
							) : null}
						</details>
					))}
				</div>
			);
		}

		case "callout": {
			const hasTitle = field.title !== "" && field.title !== null;

			return (
				<aside key={index} className="flow-root p-10 bg-primary-100 mt-4 *:first:mt-0!">
					{hasTitle ? <h5>{field.title}</h5> : null}
					{field.blocks.length > 0 ? (
						<div className={cn("flow-root *:first:mbs-0!", hasTitle && "mbs-2.5")}>
							{field.blocks.map((block, blockIndex) => renderContentBlock(block, blockIndex, footnoteScope))}
						</div>
					) : null}
				</aside>
			);
		}

		case "data": {
			return null;
		}

		case "embed": {
			const caption = getRichTextPlainText(field.caption);

			return (
				<figure key={index} className="flex flex-col gap-y-2 py-4">
					<iframe
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						allowFullScreen={true}
						className="max-w-full max-h-900 aspect-video"
						referrerPolicy="strict-origin-when-cross-origin"
						// oxlint-disable-next-line react/iframe-missing-sandbox
						sandbox="allow-scripts allow-same-origin"
						src={`${field.url}?hl=en`}
						title={caption || "Embedded content"}
						width="1600"
					></iframe>
					{field.caption !== null && (
						<figcaption className="text-small text-gray-900">
							<RichTextCaption content={field.caption} footnoteScope={footnoteScope} />
						</figcaption>
					)}
				</figure>
			);
		}

		case "gallery": {
			if (field.items.length === 0) {
				return null;
			}

			/**
			 * The gallery's own caption says what the set shows, as against the per-item captions that credit the individual
			 * images. It therefore belongs to the figure wrapping the whole arrangement rather than to any one item, and
			 * renders under every layout.
			 */
			const caption =
				field.caption !== null ? (
					<figcaption className="text-small text-gray-900">
						<RichTextCaption content={field.caption} footnoteScope={footnoteScope} />
					</figcaption>
				) : null;

			/**
			 * A logo row renders no item captions — one under every mark would rebuild the grid the layout exists to avoid —
			 * so an item's caption, which credits the asset, is only reachable as alternative text. The asset's own alt still
			 * wins wherever it has one.
			 */

			const items = field.items.map((item) => {
				return {
					caption:
						item.caption != null ? <RichTextCaption content={item.caption} footnoteScope={footnoteScope} /> : undefined,
					image: item.image,
				};
			});

			return (
				<figure key={index} className="flex flex-col gap-y-2 py-4">
					{field.layout === "carousel" ? <GalleryCarousel items={items} /> : <GalleryGrid items={items} />}
					{caption}
				</figure>
			);
		}

		case "hero": {
			return null;
		}

		case "image": {
			/**
			 * The layout determines the slot claimed by the figure, not the rendered image width. Keep narrower sources at
			 * their intrinsic width and centre them instead of stretching them to fill.
			 */
			const layoutClassName = {
				default: "",
				wide: "-mx-4 lg:-mx-12",
				full: "-mx-4 lg:-mx-24",
				"float-start": "max-w-72 @2xl:float-start @2xl:mr-7",
				"float-end": "max-w-72 @2xl:float-end @2xl:ml-7",
			}[field.layout];

			const isFloated = field.layout === "float-start" || field.layout === "float-end";

			return (
				<figure key={index} className={cn("mbs-1.5 flex flex-col gap-y-2 py-4", layoutClassName)}>
					<ApiImage
						className="ms-auto me-auto inline-auto max-inline-full"
						image={field.image}
						/** A floated figure is capped at `max-w-72`; every other layout fills the column. */
						sizes={isFloated ? "288px" : "(min-width: 80rem) 1150px, 100vw"}
					/>
					{field.caption !== null && (
						<figcaption className="text-small text-gray-900">
							<RichTextCaption content={field.caption} footnoteScope={footnoteScope} />
						</figcaption>
					)}
				</figure>
			);
		}

		case "media_text": {
			if (field.content == null) {
				return null;
			}

			return (
				<div key={index} className="flow-root py-4 [&>figure+*]:mt-0!">
					<figure
						className={cn(
							"mbe-4 inline-50 max-inline-full @xl:mbs-1.5",
							field.side === "end" ? "@xl:float-end @xl:ms-7" : "@xl:float-start @xl:me-7",
						)}
					>
						<ApiImage
							className="size-50 max-w-full object-cover"
							height={400}
							image={field.image}
							sizes="200px"
							width={400}
						/>
						{field.caption !== null && (
							<figcaption className="text-small text-gray-900 mt-2">
								<RichTextCaption content={field.caption} footnoteScope={footnoteScope} />
							</figcaption>
						)}
					</figure>
					<RichText content={field.content} footnoteScope={footnoteScope} />
				</div>
			);
		}

		case "rich_text": {
			return <RichText key={index} content={field.content as JSONContent} footnoteScope={footnoteScope} />;
		}

		default: {
			log.error("Unknown content block type.");
			unreachable();
		}
	}
}
