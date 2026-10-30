import type { ReactNode } from "react";

import { Link } from "#/components/link.tsx";
import { Badge } from "#/components/ui/badge.tsx";

interface SearchResultCardProps {
	description?: string | null | undefined;
	/** Already resolved by the caller: localized for routes on this site, as-is for external platforms. */
	href?: string | null | undefined;
	/** A secondary line under the title, e.g. authors and year. */
	meta?: string | null | undefined;
	title: string;
	type: string;
}

export const searchResultListClassName = "flex flex-col gap-y-8";

/** A text-only search hit, for result lists which aren't a card grid with images (see `Card` for those). */
export function SearchResultCard(props: Readonly<SearchResultCardProps>): ReactNode {
	const { description, href, meta, title, type } = props;

	return (
		<div className="flex flex-col gap-y-3 rounded-sm bg-white p-8 shadow-card">
			<Badge className="inline" intent="primary">
				{type}
			</Badge>
			<h2 className="text-h3">{href != null && href !== "" ? <Link href={href}>{title}</Link> : title}</h2>
			{meta != null && meta !== "" ? <p className="text-small text-text-weak">{meta}</p> : null}
			{description != null && description !== "" ? <p className="line-clamp-3 text-regular">{description}</p> : null}
		</div>
	);
}
