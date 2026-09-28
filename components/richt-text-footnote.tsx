import { Node } from "@tiptap/core";
import type { ReactNode } from "react";

interface RichTextFootnoteProps {
	footnoteScope: string;
	number: unknown;
}

/**
 * The note is stored on the inline atom. `number` is derived by the page renderer and must be part of the schema or
 * Tiptap will discard it before the node mapping sees it.
 */
export const Footnote = Node.create({
	name: "footnote",
	group: "inline",
	inline: true,
	atom: true,

	addAttributes() {
		return {
			content: { default: null },
			number: {
				default: null,
				parseHTML() {
					return null;
				},
				renderHTML() {
					return {};
				},
			},
		};
	},

	parseHTML() {
		return [{ tag: "sup[data-footnote]" }];
	},

	renderHTML() {
		// The empty child closes `sup`; HTML does not have self-closing superscript tags.
		return ["sup", { "data-footnote": "" }, ""];
	},
});

export function RichTextFootnote(props: Readonly<RichTextFootnoteProps>): ReactNode {
	const { footnoteScope, number } = props;

	if (typeof number !== "number") {
		return <sup data-footnote="" />;
	}

	return (
		<a
			aria-label={`Footnote ${String(number)}`}
			className="font-medium text-primary underline"
			href={`#fn-${footnoteScope}-${String(number)}`}
			id={`fnref-${footnoteScope}-${String(number)}`}
			role="doc-noteref"
		>
			<sup data-footnote="">{number}</sup>
		</a>
	);
}
