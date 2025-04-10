import type { ReactNode } from "react";

interface KeywordProps {
	children: string;
}

export function Keyword(props: KeywordProps): ReactNode {
	const { children } = props;
	return <dd>{children}</dd>;
}
