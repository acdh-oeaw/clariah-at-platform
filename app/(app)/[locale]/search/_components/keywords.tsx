import type { ReactNode } from "react";

import { Keyword } from "@/app/(app)/[locale]/search/_components/keyword";

interface KeywordsProps {
	keywords: Array<string>;
}

export function Keywords(props: KeywordsProps): ReactNode {
	const { keywords } = props;
	return (
		<dl className="flex flex-wrap gap-2 text-xs">
			<dt>keywords</dt>
			{keywords.map((keyword) => {
				return <Keyword key={keyword}>{keyword}</Keyword>;
			})}
		</dl>
	);
}
