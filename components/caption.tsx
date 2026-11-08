import type { JSONContent } from "@tiptap/core";
import cn from "clsx/lite";
import type { ReactNode } from "react";

import { InlineRichText } from "#/components/rich-text.tsx";
import type { BlockImage } from "#/lib/data/api-client.ts";
import { isEmptyRichTextDocument } from "#/lib/rich-text.ts";

interface CaptionProps {
	content: unknown;
	license?: BlockImage["license"];
	className?: string;
}

/** An image's or a block's caption and, for an image, its licence. */
export function Caption(props: Readonly<CaptionProps>): ReactNode {
	const { content, license, className } = props;
	const hasCaption = !isEmptyRichTextDocument(content as JSONContent | null | undefined);

	if (!hasCaption && license == null) {
		return null;
	}

	return (
		<figcaption
			className={cn(
				"mbs-3 [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-text-strong [&_a]:hover:decoration-2",
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
