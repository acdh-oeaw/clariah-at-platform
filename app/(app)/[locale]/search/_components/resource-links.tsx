import type { ReactNode } from "react";

import { ResourceLink } from "@/app/(app)/[locale]/search/_components/resource-link";
import type { Link } from "@/types/resources";

interface ExternalLinksProps {
	links: Array<Link>;
}

export function ExternalLinks(props: ExternalLinksProps): ReactNode {
	const { links } = props;
	return (
		<ul className="flex flex-wrap items-center gap-8 pt-2">
			{links
				.sort((a, b) => {
					return a.order - b.order;
				})
				.map((link, idx) => {
					return <li key={idx}>{<ResourceLink link={link} />}</li>;
				})}
		</ul>
	);
}
