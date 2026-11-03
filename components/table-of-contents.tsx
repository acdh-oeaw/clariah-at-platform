import type { ReactNode } from "react";

import { TableOfContentsList } from "#/components/table-of-contents-list.tsx";
import { collectHeadings, identifyHeadings } from "#/lib/rich-text.ts";

interface TableOfContentsProps {
	/** The `content`/`description` array an api entity carries - same input {@link ContentBlocks} takes. */
	blocks: unknown;
	className?: string;
}

/** Headings past this level still render (and still get an anchor) - they just don't clutter the list. */
const maxLevel = 3;

/**
 * Ids are derived here with the same {@link identifyHeadings} pass `ContentBlocks` runs over the same `blocks`, so an
 * entry's link always resolves to the heading actually rendered - not a slug computed independently, which would
 * disagree the moment two headings share text (see `identifyHeadings`'s collision suffixing).
 *
 * Stays a server component, so only the headings - not the whole `blocks` array - are sent to the client list, which
 * tracks the section currently being read.
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
