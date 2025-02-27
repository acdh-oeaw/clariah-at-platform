import type { ReactNode } from "react";

import { ExternalLink } from "@/app/(app)/[locale]/search/_components/external-link";
import type { Link as ResourceLink } from "@/types/resources";

interface ExternalLinksProps {
	links: Array<ResourceLink>;
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
					return <li key={idx}>{<ExternalLink link={link} />}</li>;
				})}
		</ul>
	);
}
