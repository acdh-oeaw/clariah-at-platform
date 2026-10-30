import type { ReactNode } from "react";

import { DetailCard } from "#/app/(app)/[locale]/_components/detail-card";
import { ContentBlocks } from "#/components/content-blocks.tsx";
import type { NewsItem as NewsItemProps } from "#/lib/data/api-client.ts";

export function NewsItem(props: NewsItemProps): ReactNode {
	const { content, image, title } = props;

	return (
		<DetailCard image={image} title={title}>
			<ContentBlocks blocks={content} />
		</DetailCard>
	);
}
