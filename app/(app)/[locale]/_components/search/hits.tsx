import type { ReactNode } from "react";
import { useHits, type UseHitsProps } from "react-instantsearch";

import { Hit } from "@/app/(app)/[locale]/_components/search/hit";
import type { Resource } from "@/types/resources";

interface HitsProps extends UseHitsProps<Resource> {}

export function Hits(props: HitsProps): ReactNode {
	const { items } = useHits(props);

	return (
		<ul className="list-none">
			{items.map((item, idx) => {
				return (
					<li key={idx}>
						<Hit {...item} />
					</li>
				);
			})}
		</ul>
	);
}
