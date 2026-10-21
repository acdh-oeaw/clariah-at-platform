//https://github.com/DARIAH-ERIC/dariah-website/blob/main/lib/rich-text-extensions.ts

import { type Extensions, Mark, Node } from "@tiptap/core";
import { Heading } from "@tiptap/extension-heading";
import { Table } from "@tiptap/extension-table";
import { TableKit } from "@tiptap/extension-table/kit";
import { StarterKit } from "@tiptap/starter-kit";

/**
 * The built-in link mark, replaced with a minimal one of our own rather than depending on `@tiptap/extension-link`: the
 * api resolves every link to a plain `href` before this ever reaches the website (an asset download url, or an entity's
 * page url - see the `content` doc comments in `lib/api/schemas.ts`), so nothing here ever needs the editor's own
 * target-picking attributes.
 *
 * Declares no `renderHTML`: the renderer in `components/rich-text.tsx` maps this mark itself, so the schema only has to
 * describe the shape, never serialize it.
 */
const Link = Mark.create({
	name: "link",

	addAttributes() {
		return {
			href: { default: null },
		};
	},
});

/**
 * Inline marker for a footnote: the note itself travels in `attrs.content`, richtext of the same `{ doc > paragraph }`
 * shape a caption uses. See `lib/rich-text.ts` for how a marker's `number` is derived and how notes are collected in
 * reading order.
 */
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

/**
 * Inline reference to a value the api resolves at read time (e.g. the current number of member countries) - see the
 * `content` doc comments in `lib/api/schemas.ts`. `value` is the resolved data (a number, or a list of `{ name, slug
 * }`); `label`/`kind` are the fallback for a kind the api left unresolved.
 */
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

/** Inline call-to-action button, authored inline in prose rather than as its own content block. */
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

/**
 * Lead-in text: a paragraph set apart as the introduction to what follows. A textblock of its own in the cms's editor
 * (`LeadInNode` in `rich-text-editor.tsx`) rather than a paragraph with a class, so it has to be declared here for the
 * renderer to walk it.
 */
const LeadIn = Node.create({
	name: "leadIn",
	group: "block",
	content: "inline*",
});

/**
 * The stock table node, given a `caption` attribute: the cms's editor carries a table's caption as an attribute rather
 * than table content (so a caption editor can offer footnotes and formatting without those becoming part of the table's
 * own row content) - see `rich-text-editor.tsx` in `DARIAH-ERIC/knowledge-base`'s `packages/ui/lib`. The caption is
 * richtext of the same `{ doc > paragraph }` shape a footnote's note is.
 */
const RichTextTable = Table.extend({
	addAttributes() {
		return {
			...this.parent?.(),
			caption: { default: null },
		};
	},
});

/**
 * The stock heading node, given an `id` attribute: a heading's anchor is derived at render time from the whole set of
 * headings being rendered (see `identifyHeadings` in `lib/rich-text.ts`), and an attribute the schema does not declare
 * is dropped when the json is read back into a document, so the renderer would never see it.
 */
const RichTextHeading = Heading.extend({
	addAttributes() {
		return {
			...this.parent?.(),
			id: { default: null },
		};
	},
});

/**
 * Tiptap schema for rendering the richtext the api sends as `rich_text` content blocks. Read-only: nothing here
 * declares a node view or a parse rule, since this content is never edited or parsed from html, only walked by
 * `@tiptap/static-renderer`.
 *
 * Matches the node/mark vocabulary the cms's own editor can produce (`createRichTextExtensions` in
 * `packages/ui/lib/rich-text-editor.tsx`), minus the block-level nodes (image, gallery, callout, ...) that the api
 * splits out into their own, non-richtext content blocks instead.
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
