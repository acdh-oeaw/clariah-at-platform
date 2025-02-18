import type { ReactNode } from "react";

import { Keywords } from "@/app/(app)/[locale]/search/_components/keywords";
import type { Resource } from "@/types/resources";

export function Hit(props: Resource): ReactNode {
	const { description, title, keywords } = props;
	return (
		<div className="py-3 sm:py-4 sm:pe-8">
			<h3 className="pb-2 font-heading text-heading-4 font-strong text-text-strong">{title}</h3>
			<Keywords keywords={keywords} />
			<p className="line-clamp-3 pt-2">{description}</p>
		</div>
	);
}
