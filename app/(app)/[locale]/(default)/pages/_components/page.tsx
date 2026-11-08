import type { ReactNode } from "react";

import { DetailCard } from "#/app/(app)/[locale]/_components/detail-card.tsx";
import { ContentBlocks } from "#/components/content-blocks.tsx";
import { TableOfContents } from "#/components/table-of-contents.tsx";
import type { Page as PageProps } from "#/lib/data/api-client.ts";

export function Page(props: PageProps): ReactNode {
	const { content, image, showTableOfContents, title } = props;

	return (
		<DetailCard image={image} title={title}>
			<div className="mt-12 flex flex-col gap-x-12 gap-y-8 lg:flex-row lg:items-start">
				<ContentBlocks blocks={content} className="flex-1 min-w-0 max-w-prose" />
				{showTableOfContents && (
					<TableOfContents blocks={content} className="hidden lg:sticky lg:top-8 lg:block lg:w-68 lg:shrink-0" />
				)}
			</div>
		</DetailCard>
	);
}
