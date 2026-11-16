import NextImage, { type ImageProps as NextImageProps } from "next/image";
import { Fragment, type ReactNode } from "react";

import { sourceWidthParam } from "#/configs/image.config.ts";
import { apiImageLoader } from "#/lib/images/loader.ts";
import { type ImageAsset, appendSearchParams, isSvgImage } from "#/lib/images/variants.ts";

export interface ImageProps extends Omit<NextImageProps, "loader" | "unoptimized"> {}

/** Locally served images: static imports and files under `/public`. Vectors are served as-is. */
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
	image: ImageAsset;
	/** Required: without it, phones download the desktop rendition. */
	sizes: string;
}

/**
 * An image served by the api's variant endpoint. A cropped image (`object-fit: cover`) keeps the asset's focal point in
 * view, by the same rule the cms's crop previews use. A caller's own `objectPosition` wins.
 */
export function ApiImage(props: Readonly<ApiImageProps>): ReactNode {
	const { alt, image, style: callerStyle, ...rest } = props;

	const objectPosition = toObjectPosition(image.focalPoint);
	const style = objectPosition != null ? { objectPosition, ...callerStyle } : callerStyle;

	/** Source dimensions stand in for a slot that declares none. `next/image` rejects them under `fill`. */
	const intrinsic = rest.fill === true ? {} : { height: image.height ?? undefined, width: image.width ?? undefined };

	/** Vectors, and rasters of unknown resolution, have nothing to resize, so they get one url and no `srcset`. */
	if (isSvgImage(image) || image.width == null) {
		const layoutWidth = toLayoutWidth(rest.width);
		const src = image.srcUrl;

		/** `next/image` refuses to render without dimensions, so this matches what it would render. */
		if (layoutWidth == null && rest.fill !== true) {
			const { className, fetchPriority, loading, preload } = rest;

			return (
				<Fragment>
					{/* `react-dom`'s `preload` emits nothing when called from a server component. */}
					{preload === true ? <link as="image" fetchPriority={fetchPriority} href={src} rel="preload" /> : null}
					{/* oxlint-disable-next-line next/no-img-element -- `next/image` cannot render this one. */}
					<img
						alt={alt ?? image.alt ?? ""}
						className={className}
						decoding="async"
						fetchPriority={fetchPriority}
						loading={loading ?? (preload === true ? "eager" : "lazy")}
						src={src}
						style={style}
					/>
				</Fragment>
			);
		}

		return (
			<NextImage {...intrinsic} {...rest} alt={alt ?? image.alt ?? ""} src={src} style={style} unoptimized={true} />
		);
	}

	const src = appendSearchParams(image.srcUrl, { [sourceWidthParam]: String(image.width) });

	return (
		<NextImage {...intrinsic} {...rest} alt={alt ?? image.alt ?? ""} loader={apiImageLoader} src={src} style={style} />
	);
}

/** Fractions of the source from the top left, as `object-position`. `undefined` keeps the default, the centre. */
function toObjectPosition(focalPoint: ImageAsset["focalPoint"]): string | undefined {
	if (focalPoint == null) {
		return undefined;
	}

	return `${toPercent(focalPoint.x)} ${toPercent(focalPoint.y)}`;
}

/** Rounded, so e.g. `0.3` gives `30%`, not `30.000000000000004%`. */
function toPercent(fraction: number): string {
	return `${String(Math.round(fraction * 10_000) / 100)}%`;
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
