// https://github.com/DARIAH-ERIC/dariah-website/blob/21031d562d9f1651dc85843986fbdfb6210eef2a/components/ui/accordion.tsx

import { ChevronDownIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface AccordionItem {
	/** Stable within one accordion - content blocks carry no id of their own, so this is the item's position. */
	id: string;
	title: string | null;
	children: ReactNode;
}

interface AccordionProps {
	items: Array<AccordionItem>;
}

/**
 * An accordion content block, as native disclosures.
 *
 * `details`/`summary` rather than a scripted disclosure: an accordion in an article is content, and content a reader
 * cannot open until javascript arrives - or at all, if it never does - is worse than one without an animation. It also
 * keeps find-in-page working, which browsers implement by opening the `details` holding the match.
 *
 * The title is a real heading inside the `summary` - which the html spec allows there precisely for this - so an
 * accordion's sections appear in the heading outline a screen reader user navigates an article by. A bare `summary` is
 * announced as a summary, and its sections would be missing from that outline entirely.
 *
 * `h3` because an accordion is a block inside an item's content, under the `h1` of the page and any `h2` the prose
 * around it sets - the level cannot be derived from where the block sits, so it is fixed at the one level which is
 * correct for every current caller.
 *
 * No `name` attribute, so several items may be open at once: they are independent sections, and closing one to read
 * another loses the reader's place for no reason.
 */
export function Accordion(props: Readonly<AccordionProps>): ReactNode {
	const { items } = props;

	return (
		<div className="border-be border-stroke-strong">
			{items.map((item) => (
				<details className="group border-bs border-stroke-strong" key={item.id}>
					{/**
					 * `flex` drops the default disclosure triangle, which the chevron below replaces; the webkit pseudo-element is safari's
					 * own marker, which survives the display change.
					 */}
					<summary className="focus-visible-outline flex cursor-pointer items-center justify-between gap-4 pbs-3 pbe-3 font-medium [&::-webkit-details-marker]:hidden">
						<h3>{item.title}</h3>
						{/**
						 * The chevron is the only indication of state for a sighted reader; `details` carries it for everyone else, which is
						 * why the icon stays hidden from the accessibility tree.
						 */}
						<ChevronDownIcon
							aria-hidden={true}
							className="block-5 inline-5 shrink-0 transition-transform group-open:rotate-180"
							strokeWidth={2.5}
						/>
					</summary>
					<div className="pbe-3">{item.children}</div>
				</details>
			))}
		</div>
	);
}
