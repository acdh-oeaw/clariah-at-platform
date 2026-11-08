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
 * Native `details`, so it works without javascript and find-in-page can open it. The title is a heading, so the
 * sections appear in the page outline.
 */
export function Accordion(props: Readonly<AccordionProps>): ReactNode {
	const { items } = props;

	return (
		<div className="border-be border-stroke-strong">
			{items.map((item) => (
				<details className="group border-bs border-stroke-strong" key={item.id}>
					{/* `flex` drops the default marker, except safari's, which needs the webkit pseudo-element. */}
					<summary className="flex cursor-pointer items-center justify-between gap-4 pbs-3 pbe-3 font-medium [&::-webkit-details-marker]:hidden">
						<h3>{item.title}</h3>

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
