import type { ReactNode } from "react";

import { DetailCard } from "#/app/(app)/[locale]/_components/detail-card";
import { ContentBlocks } from "#/components/content-blocks.tsx";
import type { Institution as InstitutionProps } from "#/lib/data/api-client.ts";

export function Member(props: InstitutionProps): ReactNode {
	const { description, name } = props;

	return (
		<DetailCard className="max-inline-measure" image={null} title={name}>
			<ContentBlocks blocks={description} />
		</DetailCard>
	);
}
