import { cn } from "@acdh-oeaw/style-variants";
import type { ReactNode } from "react";

import { ApiImage } from "#/components/api-image.tsx";
import { ContentBlocks } from "#/components/content-blocks.tsx";
import type { Event as EventProps } from "#/lib/data/api-client.ts";

export function Event(props: EventProps): ReactNode {
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
				<div className={cn("p-16", "max-inline-measure")}>
					<h1 className="text-h1">{title}</h1>

					<ContentBlocks blocks={content} />
				</div>
			</div>
		</section>
	);
}
