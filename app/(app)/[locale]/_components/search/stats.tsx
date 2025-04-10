import type { ReactNode } from "react";
import { useStats } from "react-instantsearch";

export function Stats(): ReactNode {
	const { nbHits } = useStats();
	//TODO: decide on and use translations
	return (
		<div>
			<span>
				{nbHits === 1
					? `${String(nbHits)} result`
					: nbHits > 1
						? `${String(nbHits)} results`
						: "No results"}
			</span>
		</div>
	);
}
