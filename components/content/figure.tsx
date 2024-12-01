import { cn } from "@acdh-oeaw/style-variants";
import type { ReactNode } from "react";

import { ServerImage as Image } from "@/components/server-image";
import type { FigureAlignment } from "@/lib/keystatic/component-options";

interface FigureProps {
	/** @default "stretch" */
	alignment?: FigureAlignment;
	alt?: string;
	children: ReactNode;
	/** Maybe added by `with-image-sizes` mdx plugin. */
	height?: number;
	src: string;
	/** Maybe added by `with-image-sizes` mdx plugin. */
	width?: number;
}

export function Figure(props: Readonly<FigureProps>): ReactNode {
	const { alignment = "stretch", alt = "", children, height, src, width } = props;

	return (
		<figure className={cn("grid gap-y-2", alignment === "center" ? "justify-center" : undefined)}>
			{/* @ts-expect-error @see https://github.com/vercel/next.js/discussions/67365 */}
			<Image
				alt={alt}
				className="overflow-hidden rounded-2"
				height={height}
				src={src}
				width={width}
			/>
			<figcaption>{children}</figcaption>
		</figure>
	);
}
