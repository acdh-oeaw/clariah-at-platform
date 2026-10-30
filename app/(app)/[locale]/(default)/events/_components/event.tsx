import type { ReactNode } from "react";

import { DetailCard } from "#/app/(app)/[locale]/_components/detail-card";
import { ContentBlocks } from "#/components/content-blocks.tsx";
import type { Event as EventProps } from "#/lib/data/api-client.ts";

export function Event(props: EventProps): ReactNode {
	const { content, image, title } = props;

	return (
		<DetailCard className="max-inline-measure" image={image} title={title}>
			<ContentBlocks blocks={content} />
		</DetailCard>
	);
}
