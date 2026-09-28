import type { ReactNode } from "react";

import { ContentBlocks } from "#/components/content-blocks.tsx";
import { ApiImage } from "#/components/image";
import type { Project as ProjectProps } from "#/lib/data/api-client.ts";

export function Project(props: ProjectProps): ReactNode {
	const { description, image, name } = props;

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
					<h1 className="text-h1">{name}</h1>

					<ContentBlocks fields={description} />
				</div>
			</div>
		</section>
	);
}
