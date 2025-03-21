import type { ReactNode } from "react";
import { Button, Input, Label, SearchField } from "react-aria-components";
import { useSearchBox, type UseSearchBoxProps } from "react-instantsearch";

export function SearchInput(props: UseSearchBoxProps): ReactNode {
	const { query, refine, clear } = useSearchBox(props);
	return (
		<SearchField
			onClear={() => {
				clear();
			}}
		>
			<Label className="sr-only">Search</Label>
			<Input
				className="border-2"
				onChange={(e) => {
					refine((e.target as HTMLInputElement).value);
				}}
				placeholder="Filter"
				value={query}
			/>
			{query ? <Button className="-ms-4">✕</Button> : null}
		</SearchField>
	);
}
