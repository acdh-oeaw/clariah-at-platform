import type { ReactNode } from "react";

import { DetailCard } from "#/app/(app)/[locale]/_components/detail-card";
import { ContentBlocks } from "#/components/content-blocks.tsx";
import { TableOfContents } from "#/components/table-of-contents";
import type { Page as PageProps } from "#/lib/data/api-client.ts";

export function Page(props: PageProps): ReactNode {
	const { content, image, showTableOfContents, title } = props;

	return (
		<DetailCard image={image} title={title}>
			<div className="mt-8 flex flex-col gap-x-12 gap-y-8 lg:flex-row lg:items-start">
				<ContentBlocks blocks={content} className="flex-1 min-w-0 max-w-prose" />
				{showTableOfContents && (
					<TableOfContents
						blocks={content}
						className="lg:sticky lg:top-8 lg:w-64 lg:shrink-0 lg:border-l-2 lg:ps-8 lg:border-primary-300"
					/>
				)}
			</div>
		</DetailCard>
	);
}
