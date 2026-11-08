import { env } from "#/configs/env.config.ts";
import { imageVariantWidths, maxImageVariantWidth, sourceWidthParam } from "#/configs/image.config.ts";

/** `width` and `height` are null for vectors. Use `""` for an unknown `mimeType`. */
export interface ImageAsset {
	alt?: string | null;
	height: number | null;
	mimeType: string;
	srcUrl: string;
	width: number | null;
}

export function isSvgImage(image: Readonly<{ mimeType: string }>): boolean {
	return image.mimeType === "image/svg+xml";
}

/** The loader is global, so it has to tell api images from the app's own. */
export function isApiImageSrc(src: string): boolean {
	return src.startsWith(env.NEXT_PUBLIC_API_BASE_URL);
}

/** Round a requested width up to a rung the endpoint accepts, rather than getting a 400. */
export function toVariantWidth(width: number): number {
	return imageVariantWidths.find((rung) => rung >= width) ?? maxImageVariantWidth;
}

/** The endpoint url for one rendition, with the loader's own bookkeeping stripped back out. */
export function createImageVariantUrl(srcUrl: string, width: number): string {
	const url = new URL(srcUrl);

	url.searchParams.delete(sourceWidthParam);
	url.searchParams.set("w", String(toVariantWidth(width)));

	return url.href;
}

/** Append query parameters to a `src` without assuming it is absolute. */
export function appendSearchParams(srcUrl: string, params: Record<string, string>): string {
	const query = new URLSearchParams(params).toString();

	return srcUrl.includes("?") ? `${srcUrl}&${query}` : `${srcUrl}?${query}`;
}
