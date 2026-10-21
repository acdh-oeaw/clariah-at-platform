// https://github.com/DARIAH-ERIC/dariah-website/blob/21031d562d9f1651dc85843986fbdfb6210eef2a/components/api-image.tsx

import "server-only";

import NextImage from "next/image";
import type { ReactNode } from "react";

import type { ImageProps } from "#/components/image.tsx";
import { sourceWidthParam } from "#/configs/image.config.ts";
import type { BlockImage } from "#/lib/data/api-client.ts";
import { apiImageLoader } from "#/lib/images/loader.ts";
import { appendSearchParams, isSvgImage } from "#/lib/images/variants.ts";

interface ApiImageProps extends Omit<ImageProps, "alt" | "src"> {
	/** Overrides the alt text the api records for the asset; pass `""` to mark it decorative. */
	alt?: string;
	image: BlockImage;
}

/**
 * An image served by the api's variant endpoint.
 *
 * Server only, unlike `Image` in `./image.tsx`, which the mobile navigation renders on the client: it reads the
 * validated environment, which would otherwise be bundled for the browser.
 *
 * The endpoint takes a width, so this renders a real `srcset` through `lib/images/loader.ts`. What each slot still owes
 * it is a `sizes` describing the width the image is laid out at - without one `next/image` can only offer the declared
 * width at 1x and 2x, and a phone downloads the desktop rung.
 */
export function ApiImage(props: Readonly<ApiImageProps>): ReactNode {
	const { alt, image, style, ...rest } = props;

	/**
	 * A vector has no resolution to ladder against, and the endpoint hands one back untouched, so naming a width would
	 * only mint a second cache entry for the same bytes. One url, no `srcset` - which is what `unoptimized` asks
	 * `next/image` for. The same goes for a raster whose resolution the api does not know.
	 */
	if (isSvgImage(image) || image.width == null) {
		/**
		 * With neither a source resolution nor a declared box there is nothing left for `next/image` to contribute - no
		 * candidates to choose between, and no dimensions to reserve space with, for want of which it refuses to render at
		 * all. A plain element says the same thing without the ceremony, and the loading attributes are the ones
		 * `next/image` would have set.
		 *
		 * Its box is reserved by the api's aspect ratio instead: with a slot which fixes one side, e.g. a logo's height,
		 * the other follows before the file arrives, where it would otherwise start at nothing and grow once it had.
		 */
		if (rest.width == null && rest.fill !== true) {
			const { className, fetchPriority, loading } = rest;

			return (
				// oxlint-disable-next-line next/no-img-element -- See above: `next/image` cannot render this one.
				<img
					alt={alt ?? image.alt ?? ""}
					className={className}
					decoding="async"
					fetchPriority={fetchPriority}
					loading={loading ?? "lazy"}
					src={image.srcUrl}
					style={style}
				/>
			);
		}

		return <NextImage {...rest} alt={alt ?? image.alt ?? ""} src={image.srcUrl} style={style} unoptimized={true} />;
	}

	/**
	 * The source's own dimensions stand in for a slot that declares none, which is how a content image gets its aspect
	 * ratio - and so its reserved box - without every call site repeating it. Skipped under `fill`, where `next/image`
	 * rejects a width and height outright.
	 */
	const intrinsic = rest.fill === true ? {} : { height: image.height ?? undefined, width: image.width };

	return (
		<NextImage
			{...intrinsic}
			{...rest}
			alt={alt ?? image.alt ?? ""}
			loader={apiImageLoader}
			src={appendSearchParams(image.srcUrl, { [sourceWidthParam]: String(image.width) })}
			style={style}
		/>
	);
}
