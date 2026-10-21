// https://github.com/DARIAH-ERIC/dariah-website/blob/main/lib/rich-text.ts

import slugify from "@sindresorhus/slugify";
import type { JSONContent } from "@tiptap/core";

function isRecord(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === "object";
}

/**
 * Whether a richtext document carries no meaningful text. An empty editor still produces a `doc` with a single empty
 * paragraph, so a caller can treat that the same as `null` content.
 */
export function isEmptyRichTextDocument(content: JSONContent | null | undefined): boolean {
	if (content == null) {
		return true;
	}
	if (content.type !== "doc") {
		return false;
	}

	const nodes = content.content ?? [];

	if (nodes.length === 0) {
		return true;
	}

	return nodes.every((node) => {
		if (node.type === "paragraph" || node.type === "leadIn") {
			const paragraphContent = node.content ?? [];
			if (paragraphContent.length === 0) {
				return true;
			}

			return paragraphContent.every((child) => child.type === "text" && (child.text ?? "").trim() === "");
		}

		return false;
	});
}

/**
 * Every footnote's note, in reading order - which is the order the markers are numbered in.
 *
 * Accepts arbitrary JSON (one richtext document, or the whole ordered content-block array of an item) and walks every
 * value, so a caller composing several `rich_text` blocks into one article can number and list footnotes across all of
 * them at once, matching the api's documented contract ("a renderer numbers the markers by their order across all of an
 * item's content blocks and lists the notes, in that order, at the end of the item").
 */
export function collectFootnotes(input: unknown): Array<JSONContent | null> {
	const notes: Array<JSONContent | null> = [];

	function visit(node: unknown) {
		if (Array.isArray(node)) {
			for (const item of node) {
				visit(item);
			}
			return;
		}

		if (!isRecord(node)) {
			return;
		}

		if (node.type === "footnote") {
			notes.push(isRecord(node.attrs) ? ((node.attrs.content as JSONContent | null) ?? null) : null);
			return;
		}

		for (const value of Object.values(node)) {
			visit(value);
		}
	}

	visit(input);

	return notes;
}

/**
 * A copy of `input` with every footnote marker carrying its 1-based position in `attrs.number`, so a renderer can
 * anchor a marker to its note and back.
 *
 * Walks in the same order as {@link collectFootnotes}, so `number` indexes that list directly. The number is derived
 * here rather than stored on the document: a marker's number is only ever its place among the footnotes it is rendered
 * with.
 */
export function numberFootnotes<T>(input: T): T {
	let number = 0;

	function visit(node: unknown): unknown {
		if (Array.isArray(node)) {
			return node.map((item) => visit(item));
		}

		if (!isRecord(node)) {
			return node;
		}

		if (node.type === "footnote") {
			number += 1;
			return { ...node, attrs: { ...(isRecord(node.attrs) ? node.attrs : {}), number } };
		}

		return Object.fromEntries(Object.entries(node).map(([key, value]) => [key, visit(value)]));
	}

	return visit(input) as T;
}

/**
 * The plain text of a richtext document, with block boundaries collapsed to single spaces - for a place which can only
 * take a string, like an `iframe` title. Returns an empty string for content which carries no text.
 */
export function toPlainText(input: unknown): string {
	function visit(node: unknown): string {
		if (Array.isArray(node)) {
			return node.map((item) => visit(item)).join("");
		}

		if (!isRecord(node)) {
			return "";
		}

		if (node.type === "text") {
			return typeof node.text === "string" ? node.text : "";
		}

		/** Every other node ends a run of text - two adjacent paragraphs must not read as one word. */
		return `${visit(node.content)} `;
	}

	return visit(input).replaceAll(/\s+/g, " ").trim();
}

/**
 * The plain text of an item's top-level `rich_text` blocks - for a place which wants its prose as one string, like a
 * page description. Callouts, media and the other blocks are skipped, since their text does not read as running prose.
 */
export function toContentBlocksPlainText(
	blocks: ReadonlyArray<{ type: string; content?: unknown }> | undefined,
): string {
	return (blocks ?? [])
		.filter((block) => block.type === "rich_text")
		.map((block) => toPlainText(block.content))
		.join(" ")
		.trim();
}

/** One heading of a richtext document, as {@link collectHeadings} reports it. */
export interface RichTextHeading {
	/** The `id` {@link identifyHeadings} stamped on the heading node, which is also the rendered element's. */
	id: string;
	/** 2, 3 or 4 - the levels the editor's schema allows (see `lib/rich-text-extensions.ts`). */
	level: number;
	/** The heading's text, flattened - a table of contents entry is a line of text, not markup. */
	text: string;
}

/**
 * A copy of `input` with every heading carrying a slug of its own text in `attrs.id`, so a renderer can anchor a link
 * to it and {@link collectHeadings} can list the anchors without slugifying anything a second time.
 *
 * Ids are derived here rather than stored on the document for the same reason a footnote's number is (see
 * {@link numberFootnotes}): a heading's anchor is only ever unique among the headings it is rendered with, so it depends
 * on the whole set - two blocks may each carry a "Background" heading, and only the walk over both can see that. A
 * repeated slug therefore takes a `-2`, `-3`, ... suffix in reading order, and the suffixed candidate is itself checked
 * against the ids already taken, so a heading literally titled "Background 2" cannot steal the anchor of the second
 * "Background".
 */
export function identifyHeadings<T>(input: T): T {
	const ids = new Set<string>();

	function toUniqueId(text: string): string {
		/** A heading with no text of its own - an image, a stray mark - still needs an anchor to be addressable. */
		const base = slugify(text) || "section";

		let candidate = base;
		let suffix = 1;

		while (ids.has(candidate)) {
			suffix += 1;
			candidate = `${base}-${String(suffix)}`;
		}

		ids.add(candidate);

		return candidate;
	}

	function visit(node: unknown): unknown {
		if (Array.isArray(node)) {
			return node.map((item) => visit(item));
		}

		if (!isRecord(node)) {
			return node;
		}

		/**
		 * The id is taken before the children are walked, so ids are handed out in reading order even when a heading holds
		 * nodes of its own (a footnote marker, say).
		 */
		const id = node.type === "heading" ? toUniqueId(toPlainText(node)) : null;

		const visited = Object.fromEntries(Object.entries(node).map(([key, value]) => [key, visit(value)]));

		return id == null ? visited : { ...visited, attrs: { ...(isRecord(node.attrs) ? node.attrs : {}), id } };
	}

	return visit(input) as T;
}

/**
 * Every heading of an item's content, in reading order - the outline a table of contents is built from.
 *
 * Takes the same input as {@link collectFootnotes} (one document, or a whole content-block array) and reads the `id`
 * {@link identifyHeadings} stamped on, so an entry and the element it links to can never disagree; a heading which was
 * never stamped, or which carries no text to name the link with, is left out rather than listed as a link to nowhere.
 *
 * Headings inside an `accordion` block are skipped: they sit in a collapsed panel, which a link into it cannot be
 * relied on to open, and they are sections of that block rather than of the page. They remain part of the rendered
 * heading outline - see `components/ui/accordion.tsx` - just not of this list.
 */
export function collectHeadings(input: unknown): Array<RichTextHeading> {
	const headings: Array<RichTextHeading> = [];

	function visit(node: unknown) {
		if (Array.isArray(node)) {
			for (const item of node) {
				visit(item);
			}
			return;
		}

		if (!isRecord(node)) {
			return;
		}

		if (node.type === "accordion") {
			return;
		}

		if (node.type === "heading") {
			const attrs = isRecord(node.attrs) ? node.attrs : null;
			const id = attrs?.id;
			const level = attrs?.level;
			const text = toPlainText(node);

			if (typeof id === "string" && id !== "" && typeof level === "number" && text !== "") {
				headings.push({ id, level, text });
			}

			return;
		}

		for (const value of Object.values(node)) {
			visit(value);
		}
	}

	visit(input);

	return headings;
}
