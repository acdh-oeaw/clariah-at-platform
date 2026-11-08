import { type Extensions, Mark, Node } from "@tiptap/core";
import { Heading } from "@tiptap/extension-heading";
import { Table } from "@tiptap/extension-table";
import { TableKit } from "@tiptap/extension-table/kit";
import { StarterKit } from "@tiptap/starter-kit";

/** The api resolves every link to a plain `href`. Rendered by `components/rich-text.tsx`. */
const Link = Mark.create({
	name: "link",

	addAttributes() {
		return {
			href: { default: null },
		};
	},
});

/** The note is in `attrs.content`. `number` is attached by `numberFootnotes` in `lib/rich-text.ts`. */
const Footnote = Node.create({
	name: "footnote",
	group: "inline",
	inline: true,
	atom: true,

	addAttributes() {
		return {
			content: { default: null },
			number: { default: null },
		};
	},
});

/** A value the api resolves (a number, or a list of `{ name, slug }`). `label`/`kind` are the fallback. */
const PlaceholderValue = Node.create({
	name: "placeholderValue",
	group: "inline",
	inline: true,
	atom: true,

	addAttributes() {
		return {
			kind: { default: null },
			label: { default: null },
			value: { default: null },
		};
	},
});

const ButtonLink = Node.create({
	name: "buttonLink",
	group: "inline",
	inline: true,
	atom: true,

	addAttributes() {
		return {
			href: { default: null },
			label: { default: null },
			variant: { default: "primary" },
		};
	},
});

const LeadIn = Node.create({
	name: "leadIn",
	group: "block",
	content: "inline*",
});

/** The cms stores a table's caption as a `{ doc > paragraph }` attribute. */
const RichTextTable = Table.extend({
	addAttributes() {
		return {
			...this.parent?.(),
			caption: { default: null },
		};
	},
});

/** Undeclared attributes are dropped, so the anchor `identifyHeadings` attaches needs declaring. */
const RichTextHeading = Heading.extend({
	addAttributes() {
		return {
			...this.parent?.(),
			id: { default: null },
		};
	},
});

/**
 * The nodes and marks the cms's editor produces, minus images, galleries, callouts etc., which the api sends as
 * separate content blocks.
 */
export function createRichTextExtensions(): Extensions {
	return [
		StarterKit.configure({
			heading: false,
			link: false,
		}),
		RichTextHeading.configure({ levels: [2, 3, 4] }),
		TableKit.configure({ table: false }),
		RichTextTable,
		Link,
		Footnote,
		PlaceholderValue,
		ButtonLink,
		LeadIn,
	];
}
