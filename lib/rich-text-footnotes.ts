import type { JSONContent } from "@tiptap/core";

function isRecord(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === "object";
}

/** Every footnote note in marker order, including empty notes. */
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

/** A copy of the input with every footnote carrying its 1-based position. */
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
