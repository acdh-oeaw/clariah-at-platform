import type { ReactNode } from "react";

import { ContentBlocks } from "#/components/content-blocks.tsx";

interface PageIntroProps {
	blocks: unknown;
}

export function PageIntro(props: Readonly<PageIntroProps>): ReactNode {
	const { blocks } = props;

	return <ContentBlocks blocks={blocks} className="max-w-prose md:max-w-[61rem]" />;
}
