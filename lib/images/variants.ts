import { env } from "#/configs/env.config.ts";
import { imageVariantWidths, maxImageVariantWidth, sourceWidthParam } from "#/configs/image.config.ts";

/**
 * An image as the api describes it.
 *
 * `width` and `height` are the source's own pixel dimensions and are null for vectors, which have no raster resolution
 * — see `ApiImage` for what that changes about how one is rendered.
 */
export interface ImageAsset {
	alt?: string | null;
	height: number | null;
	srcUrl: string;
	width: number | null;
}

/**
 * Whether a `src` addresses the api, and so the variant endpoint, rather than something this app serves itself.
 *
 * The loader is global — `images.loaderFile` replaces the default one for every image on the site, not just the api's —
 * so it has to tell the two apart before it can decide what to build.
 */
export function isApiImageSrc(src: string): boolean {
	return src.startsWith(env.NEXT_PUBLIC_API_BASE_URL);
}

/**
 * Round a requested width up to a rung the endpoint will accept.
 *
 * With the ladder mirrored into `images.deviceSizes`/`images.imageSizes` this is a no-op for anything `next/image` asks
 * for; it exists so that a rung dropped from one of the two lists degrades into a slightly larger image rather than a
 * 400 from the endpoint.
 */
export function toVariantWidth(width: number): number {
	return imageVariantWidths.find((rung) => rung >= width) ?? maxImageVariantWidth;
}

/**
 * The endpoint url for one rendition, with the loader's own bookkeeping stripped back out.
 *
 * Only the loader calls this, and only for a src it has already established addresses the api, so the url is known to
 * be absolute here.
 */
export function createImageVariantUrl(srcUrl: string, width: number): string {
	const url = new URL(srcUrl);

	url.searchParams.delete(sourceWidthParam);
	url.searchParams.set("w", String(toVariantWidth(width)));

	return url.href;
}

/**
 * Append query parameters to a `src` without assuming it is absolute.
 *
 * `ApiImage` runs before the loader and takes whatever `srcUrl` an asset carries, which in a story or a fixture is a
 * plain path — enough for `next/image` but not for `new URL`.
 */
export function appendSearchParams(srcUrl: string, params: Record<string, string>): string {
	const query = new URLSearchParams(params).toString();

	return srcUrl.includes("?") ? `${srcUrl}&${query}` : `${srcUrl}?${query}`;
}
