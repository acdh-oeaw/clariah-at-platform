import type { ReactNode } from "react";
import { RefinementList, type RefinementListProps } from "react-instantsearch";

interface FilterProps extends RefinementListProps {
	className: string;
	label: string;
}

export function Filter(props: FilterProps): ReactNode {
	const { attribute, classNames, label } = props;

	return (
		<div>
			<p>{label}</p>
			<RefinementList attribute={attribute} classNames={classNames} />
		</div>
	);
}
