import { Node } from "@tiptap/core";
import type { useFormatter } from "next-intl";
import type { ReactNode } from "react";

import { Link } from "#/components/link.tsx";

type Formatter = ReturnType<typeof useFormatter>;

interface PlaceholderValueListItem {
	name: string;
	slug: string;
}

interface PlaceholderValueAttributes {
	kind: string | null;
	label: string | null;
	value: number | Array<PlaceholderValueListItem> | null;
}

interface PlaceholderValueNodeProps {
	node: { attrs: Record<string, unknown> };
}

export const PlaceholderValue = Node.create({
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

	parseHTML() {
		return [{ tag: "span[data-placeholder-value]" }];
	},

	renderHTML({ HTMLAttributes }) {
		return ["span", HTMLAttributes];
	},
});

export function renderPlaceholderValue(props: PlaceholderValueNodeProps, format: Formatter): ReactNode {
	const { kind, label, value } = props.node.attrs as unknown as PlaceholderValueAttributes;

	if (typeof value === "number") {
		return <span data-placeholder-value={kind ?? undefined}>{value}</span>;
	}

	if (Array.isArray(value)) {
		if (value.length === 0) {
			return null;
		}

		const links = value.map((item) => (
			<Link key={item.slug} className="inline" href={`/network/members-and-partners/${item.slug}`} variant="paragraph">
				{item.name}
			</Link>
		));

		return (
			<span data-placeholder-value={kind ?? undefined}>
				{format.list(links, { style: "long", type: "conjunction" })}
			</span>
		);
	}

	return <span data-placeholder-value={kind ?? undefined}>{label ?? ""}</span>;
}
