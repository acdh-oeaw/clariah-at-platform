import NextImage, { type ImageProps as NextImageProps } from "next/image";
import type { ReactNode } from "react";

import { sourceWidthParam } from "#/configs/image.config";
import { type ImageAsset, appendSearchParams } from "#/lib/images/variants.ts";

interface ImageProps extends Omit<NextImageProps, "loader" | "unoptimized"> {}

/**
 * Locally served images: static imports and files under `/public`.
 *
 * Vectors are served as-is. `next/image` normally arranges that itself, but only while the default loader is in play —
 * registering `images.loaderFile` turns the check off (`isDefaultLoader` in next's `get-img-props`), and the optimizer
 * refuses svg without `dangerouslyAllowSVG`. So the exemption has to be made here instead, or every local logo 400s.
 */
export function Image(props: Readonly<ImageProps>): ReactNode {
	const { alt, ...rest } = props;

	return <NextImage {...rest} alt={alt} unoptimized={isVectorSrc(rest.src)} />;
}

function isVectorSrc(src: NextImageProps["src"]): boolean {
	const path = typeof src === "string" ? src : "default" in src ? src.default.src : (src as { src: string }).src;

	return path.split("?", 1)[0]?.endsWith(".svg") === true;
}

interface ApiImageProps extends Omit<ImageProps, "alt" | "src"> {
	/** Overrides the alt text the api records for the asset; pass `""` to mark it decorative. */
	alt?: string;
	image: ImageAsset | null;
}

/**
 * An image served by the api's variant endpoint.
 *
 * The endpoint takes a width, so this renders a real `srcset`, unlike the fixed single rendition the api used to hand
 * out. What each slot still owes it is a `sizes` describing the width the image is laid out at — without one
 * `next/image` can only offer the declared width at 1x and 2x, and a phone downloads the desktop rung.
 */
export function ApiImage(props: Readonly<ApiImageProps>): ReactNode {
	const { alt, image, ...rest } = props;
	if (!image) {
		return <p>No Image found</p>;
	}

	/**
	 * Source dimensions stand in for a slot that declares none, which is how a logo or a content image gets its aspect
	 * ratio without every call site repeating it. Skipped under `fill`, where `next/image` rejects a width and height
	 * outright.
	 */
	const intrinsic = rest.fill === true ? {} : { height: image.height ?? undefined, width: image.width ?? undefined };

	/**
	 * A vector has no resolution to ladder against, and imgproxy runs with svg processing disabled, so it hands the
	 * source back untouched. Naming a width would only mint a second cache entry for the same bytes, so the base url is
	 * requested as it stands — one url, no `srcset`, which is what `unoptimized` asks `next/image` for.
	 */
	if (image.width == null) {
		const layoutWidth = toLayoutWidth(rest.width);
		const src = image.srcUrl;

		/**
		 * With neither a source resolution nor a declared box there is nothing left for `next/image` to contribute — it has
		 * no candidates to choose between and no dimensions to reserve space with, and would refuse to render for want of
		 * the latter. A plain element says the same thing without the ceremony; the loading attributes are the ones
		 * `next/image` would have set.
		 *
		 * Which includes the ones a slot asks for. Losing its `preload` here would be a silent downgrade — the call site
		 * cannot tell a vector from a raster, so an above-the-fold slot has to keep its priority whichever it is handed.
		 */
		if (layoutWidth == null && rest.fill !== true) {
			const { className, fetchPriority, loading, preload } = rest;

			return (
				<>
					{/**
					 * What `next/image` hoists for a preloaded image, minus the `imageSrcSet` there are no candidates for. Rendered as an
					 * element rather than requested through `react-dom`'s `preload`, which emits nothing when called from a server
					 * component; react hoists this into the head either way.
					 */}
					{preload === true ? <link as="image" fetchPriority={fetchPriority} href={src} rel="preload" /> : null}
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						alt={alt ?? image.alt ?? ""}
						className={className}
						decoding="async"
						fetchPriority={fetchPriority}
						/** `preload` is what takes an image out of lazy loading in `next/image`; match that. */
						loading={loading ?? (preload === true ? "eager" : "lazy")}
						src={src}
					/>
				</>
			);
		}

		return <NextImage {...intrinsic} {...rest} alt={alt ?? image.alt ?? ""} src={src} unoptimized={true} />;
	}

	const src = appendSearchParams(image.srcUrl, { [sourceWidthParam]: String(image.width) });

	return <NextImage {...intrinsic} {...rest} alt={alt ?? image.alt ?? ""} src={src} />;
}

function toLayoutWidth(width: NextImageProps["width"]): number | undefined {
	if (typeof width === "number") {
		return width;
	}

	if (typeof width === "string") {
		const parsed = Math.trunc(Number(width));

		return Number.isNaN(parsed) ? undefined : parsed;
	}

	return undefined;
}
