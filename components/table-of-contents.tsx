import type { ReactNode } from "react";

import { Link } from "#/components/link";
import { collectHeadings, identifyHeadings } from "#/lib/rich-text.ts";

interface TableOfContentsProps {
	/** The `content`/`description` array an api entity carries - same input {@link ContentBlocks} takes. */
	blocks: unknown;
	className?: string;
}

/** Indents a subsection's entry under its section's, matching the levels `lib/rich-text-extensions.ts` allows. */
const indentClassName: Record<number, string> = {
	2: "",
	3: "ps-4",
	4: "ps-8",
};

/**
 * Ids are derived here with the same {@link identifyHeadings} pass `ContentBlocks` runs over the same `blocks`, so an
 * entry's link always resolves to the heading actually rendered - not a slug computed independently, which would
 * disagree the moment two headings share text (see `identifyHeadings`'s collision suffixing).
 */
export function TableOfContents(props: Readonly<TableOfContentsProps>): ReactNode {
	const { blocks, className } = props;

	const headings = collectHeadings(identifyHeadings(blocks));

	if (headings.length === 0) {
		return null;
	}

	return (
		<div className={className}>
			<ul>
				{headings.map((heading) => (
					<li className={indentClassName[heading.level]} key={heading.id}>
						<Link href={`#${heading.id}`}>{heading.text}</Link>
					</li>
				))}
			</ul>
		</div>
	);
}
