import type { ReactNode } from "react";

import { ContentBlocks } from "#/components/content-blocks.tsx";
import { ApiImage } from "#/components/image";
import type { NewsItem as NewsItemProps } from "#/lib/data/api-client.ts";

export function NewsItem(props: NewsItemProps): ReactNode {
	const { content, image, title } = props;

	return (
		<section className="container">
			<div className="rounded-md shadow-card flex flex-col md:mb-16 container bg-white max-w-7xl">
				<ApiImage
					className="rounded-t-md w-full max-h-100 object-cover"
					fetchPriority="high"
					image={image}
					loading="eager"
					preload={true}
				/>
				<div className="p-16">
					<h1 className="text-h1">{title}</h1>

					<ContentBlocks fields={content} />
				</div>
			</div>
		</section>
	);
}
