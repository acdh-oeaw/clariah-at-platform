"use client";
import { cn } from "@acdh-oeaw/style-variants";
import type { JSONContent } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import type { ReactNode } from "react";

import { linkStyles } from "#/components/link.tsx";
import { createRichTextLinkRenderer } from "#/components/rich-text-link.tsx";
import { Footnote, RichTextFootnote } from "#/components/richt-text-footnote.tsx";

interface RichTextCaptionProps {
	content: unknown;
	footnoteScope?: string;
}

const richTextCaptionLink = createRichTextLinkRenderer(
	cn(linkStyles({ variant: "paragraph" }), "inline [font-size:inherit]! leading-[inherit]!"),
);

function isJSONContent(content: unknown): content is JSONContent {
	return typeof content === "object" && content !== null && "type" in content && typeof content.type === "string";
}

export function getRichTextPlainText(content: unknown): string {
	if (typeof content === "string") {
		return content;
	}
	if (Array.isArray(content)) {
		// oxlint-disable-next-line unicorn/no-array-callback-reference
		return content.map(getRichTextPlainText).join("");
	}
	if (!isJSONContent(content)) {
		return "";
	}
	if (typeof content.text === "string") {
		return content.text;
	}

	return getRichTextPlainText(content.content);
}

export function RichTextCaption(props: Readonly<RichTextCaptionProps>): ReactNode {
	const { content, footnoteScope = "rich-text-caption" } = props;

	if (typeof content === "string") {
		return content;
	}
	if (!isJSONContent(content)) {
		return null;
	}

	return renderToReactElement({
		content,
		extensions: [
			StarterKit.configure({
				blockquote: false,
				bulletList: false,
				code: false,
				codeBlock: false,
				dropcursor: false,
				gapcursor: false,
				hardBreak: false,
				heading: false,
				horizontalRule: false,
				link: richTextCaptionLink.linkOptions,
				listItem: false,
				listKeymap: false,
				orderedList: false,
				paragraph: {
					HTMLAttributes: {
						class: "inline",
					},
				},
				strike: false,
				trailingNode: false,
				underline: false,
				undoRedo: false,
			}),
			Footnote,
		],
		options: {
			markMapping: richTextCaptionLink.markMapping,
			nodeMapping: {
				footnote({ node }) {
					const number: unknown = node.attrs.number;

					return <RichTextFootnote footnoteScope={footnoteScope} number={number} />;
				},
			},
		},
	});
}
