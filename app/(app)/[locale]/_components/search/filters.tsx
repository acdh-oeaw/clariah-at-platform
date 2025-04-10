import type { ReactNode } from "react";
import { RefinementList } from "react-instantsearch";

interface FilterProps {
	content?: string;
}

const FILTERS = [
	{ value: "kind", label: "Kind" },
	{ value: "keywords", label: "Keywords" },
];

export function Filters(props: FilterProps): ReactNode {
	const { content } = props;

	return (
		<>
			{FILTERS.map((filter, idx) => {
				return (
					<div key={idx} className="pb-5">
						<p className="font-medium uppercase">{filter.label}</p>
						<RefinementList
							attribute={filter.value}
							classNames={{
								root: "min-h-[4rem] pt-2",
								label: "inline-flex w-full",
								labelText: "ps-1",
								count: "ml-auto",
							}}
							content={content}
						/>
					</div>
				);
			})}
		</>
	);
}
