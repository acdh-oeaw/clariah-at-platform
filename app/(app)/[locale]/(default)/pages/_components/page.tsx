import type { ReactNode } from "react";

import { ApiImage } from "#/components/api-image.tsx";
import { ContentBlocks } from "#/components/content-blocks.tsx";
import { TableOfContents } from "#/components/table-of-contents";
import type { Page as PageProps } from "#/lib/data/api-client.ts";

export function Page(props: PageProps): ReactNode {
	const { content, image, showTableOfContents, title } = props;

	return (
		<section className="container">
			<div className="rounded-md shadow-card flex flex-col md:mb-16 container bg-white max-w-7xl">
				{image != null ? (
					<ApiImage
						className="rounded-t-md w-full max-h-100 object-cover"
						fetchPriority="high"
						image={image}
						loading="eager"
						preload={true}
					/>
				) : null}
				<div className="p-16">
					<h1 className="text-h1">{title}</h1>
					<div className="mt-8 flex flex-col gap-x-12 gap-y-8 lg:flex-row lg:items-start">
						<ContentBlocks blocks={content} className="flex-1 min-w-0 max-w-prose" />
						{showTableOfContents && (
							<TableOfContents
								blocks={content}
								className="lg:sticky lg:top-8 lg:w-64 lg:shrink-0 lg:border-l-2 lg:ps-8 lg:border-primary-300"
							/>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
