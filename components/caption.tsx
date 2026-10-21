// https://github.com/DARIAH-ERIC/dariah-website/blob/main/components/caption.tsx
import type { JSONContent } from "@tiptap/core";
import cn from "clsx/lite";
import type { ReactNode } from "react";

import { InlineRichText } from "#/components/rich-text.tsx";
import type { BlockImage } from "#/lib/data/api-client.ts";
import { isEmptyRichTextDocument } from "#/lib/rich-text.ts";

interface CaptionProps {
	/** The caption the api resolved for this image or block - from the asset or the block itself, see `captionSource`. */
	content: unknown;
	license?: BlockImage["license"];
	className?: string;
}

/**
 * An image's or a block's caption and, for an image, the licence its asset carries - or nothing when it has neither.
 *
 * The licence is part of the caption rather than a line of its own because it is a credit for the image above it, and
 * because an image may carry a licence without carrying a caption.
 *
 * Set as the typography plugin sets a caption inside prose (see `RichTextContent`), since it sits between paragraphs of
 * it: a step below the 18px body text, and in the plugin's caption gray, lighter than the body's - so it reads as a
 * note on the image rather than as another paragraph.
 *
 * Its links - the caption's own and the licence's - are underlined, since in the caption's colour nothing else tells
 * them from the text around them; on hover the underline thickens and the link darkens to the body's colour.
 */
export function Caption(props: Readonly<CaptionProps>): ReactNode {
	const { content, license, className } = props;
	const hasCaption = !isEmptyRichTextDocument(content as JSONContent | null | undefined);

	if (!hasCaption && license == null) {
		return null;
	}

	return (
		<figcaption
			className={cn(
				"mbs-3 [&_a]:underline [&_a]:underline-offset-2 [&_a]:focus-visible-outline [&_a]:hover:text-text-strong [&_a]:hover:decoration-2",
				className,
			)}
		>
			{hasCaption ? <InlineRichText content={content} /> : null}
			{license != null ? (
				<span>
					{hasCaption ? " " : null}
					<a href={license.url} rel="license">
						{license.name}
					</a>
				</span>
			) : null}
		</figcaption>
	);
}
