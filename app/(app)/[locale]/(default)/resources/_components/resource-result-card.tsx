import type { ReactNode } from "react";

import { SearchResultCard } from "#/app/(app)/[locale]/(default)/_components/search-result-card.tsx";
import type { ResourceDocument } from "#/lib/search/collections/resources.ts";

interface ResourceResultCardProps {
	document: ResourceDocument;
}

/**
 * Shared by `/resources` and the resources half of the combined `/search`. Unlike website content, a resource's link
 * points at an external platform (Zenodo, HAL, DARIAH-Campus, ...), not a route on this site — so no `localizeHref`.
 */
export function ResourceResultCard(props: Readonly<ResourceResultCardProps>): ReactNode {
	const { document } = props;

	const meta = [document.authors?.join(", "), document.year]
		.filter((value) => value != null && value !== "")
		.join(" · ");

	return (
		<SearchResultCard
			description={document.description}
			href={document.source_url ?? document.links[0]}
			meta={meta}
			title={document.label}
			type={document.type}
		/>
	);
}
