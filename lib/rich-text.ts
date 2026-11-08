import slugify from "@sindresorhus/slugify";
import type { JSONContent } from "@tiptap/core";

function isRecord(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === "object";
}

/** An empty editor still produces a `doc` with an empty paragraph. */
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
 * Every footnote's note, in reading order. Walks any JSON, so it works on one document or a whole content block array:
 * footnotes are numbered across all of an item's blocks.
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

/** Adds each footnote marker's 1-based position as `attrs.number`, in the same order as {@link collectFootnotes}. */
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

/** Block boundaries become single spaces. */
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

		return `${visit(node.content)} `;
	}

	return visit(input).replaceAll(/\s+/g, " ").trim();
}

/** The plain text of an item's top-level `rich_text` blocks, e.g. for a page description. */
export function toContentBlocksPlainText(
	blocks: ReadonlyArray<{ type: string; content?: unknown }> | undefined,
): string {
	return (blocks ?? [])
		.filter((block) => block.type === "rich_text")
		.map((block) => toPlainText(block.content))
		.join(" ")
		.trim();
}

export interface RichTextHeading {
	id: string;
	/** 2, 3 or 4. */
	level: number;
	text: string;
}

/**
 * Adds a slug of each heading's text as `attrs.id`. Ids must be unique across everything rendered together, so a
 * repeated slug gets a `-2`, `-3`, ... suffix.
 */
export function identifyHeadings<T>(input: T): T {
	const ids = new Set<string>();

	function toUniqueId(text: string): string {
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

		/** Before walking the children, so ids are handed out in reading order. */
		const id = node.type === "heading" ? toUniqueId(toPlainText(node)) : null;

		const visited = Object.fromEntries(Object.entries(node).map(([key, value]) => [key, visit(value)]));

		return id == null ? visited : { ...visited, attrs: { ...(isRecord(node.attrs) ? node.attrs : {}), id } };
	}

	return visit(input) as T;
}

/**
 * Every heading with an id from {@link identifyHeadings}, in reading order, for a table of contents. Skips headings
 * inside an accordion, since a link can't be relied on to open its panel.
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
