import type { ReactNode } from "react";

import { TableOfContentsList } from "#/components/table-of-contents-list.tsx";
import { collectHeadings, identifyHeadings } from "#/lib/rich-text.ts";

interface TableOfContentsProps {
	blocks: unknown;
	className?: string;
}

const maxLevel = 3;

/**
 * Runs the same {@link identifyHeadings} pass as `ContentBlocks`, so the ids match. A server component, so only the
 * headings are sent to the client.
 */
export function TableOfContents(props: Readonly<TableOfContentsProps>): ReactNode {
	const { blocks, className } = props;

	const headings = collectHeadings(identifyHeadings(blocks)).filter((heading) => heading.level <= maxLevel);

	if (headings.length === 0) {
		return null;
	}

	return (
		<div className={className}>
			<TableOfContentsList headings={headings} />
		</div>
	);
}
