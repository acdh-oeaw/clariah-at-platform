import type { ReactNode } from "react";

import { Keywords } from "@/app/(app)/[locale]/_components/search/keywords";
import { ResourceLinks } from "@/app/(app)/[locale]/_components/search/resource-links";
import type { Resource } from "@/types/resources";

export function Hit(props: Resource): ReactNode {
	const { description, title, keywords, links } = props;
	return (
		<div className="py-3 sm:py-4 sm:pe-8">
			<h3 className="pb-2 font-heading text-heading-4 font-strong text-text-strong">{title}</h3>
			<Keywords keywords={keywords} />
			<p className="line-clamp-3 pt-2">{description}</p>
			<ResourceLinks links={links} />
		</div>
	);
}
