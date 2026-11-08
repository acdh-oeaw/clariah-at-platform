import type { ReactNode } from "react";

import { IntentLink } from "#/components/intent-link.tsx";
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
		<div className="rounded-sm relative bg-white p-8 shadow-card">
			<div className="max-w-5xl flex flex-col gap-y-3">
				<Badge className="inline">{type}</Badge>
				<h2 className="text-h3">
					{href != null && href !== "" ? (
						<IntentLink className="after:absolute after:inset-0 after:z-20" href={href}>
							{title}
						</IntentLink>
					) : (
						title
					)}
				</h2>
				{meta != null && meta !== "" ? <p className="text-small text-text-weak">{meta}</p> : null}
				{description != null && description !== "" ? <p className="line-clamp-3 text-regular">{description}</p> : null}
			</div>{" "}
		</div>
	);
}
