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

export interface ImageAssetParams {
	prefix: "avatars" | "documents" | "images" | "logos";
	name: string;
	version: "v1";
}

/** Read the public variant endpoint's parameters, accepting only assets from our own api. */
export function parseImageAssetUrl(srcUrl: string): ImageAssetParams | null {
	try {
		const url = new URL(srcUrl);
		const base = new URL(`${env.NEXT_PUBLIC_API_BASE_URL}/`);
		if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) {
			return null;
		}
		const path = url.pathname.slice(base.pathname.length);
		const match = /^api\/v1\/assets\/(?<prefix>avatars|documents|images|logos)\/(?<name>[^/]+)\/image\/v1$/u.exec(path);
		const prefix = match?.groups?.prefix;
		const name = match?.groups?.name;
		if ((prefix !== "avatars" && prefix !== "documents" && prefix !== "images" && prefix !== "logos") || name == null) {
			return null;
		}
		const decodedName = decodeURIComponent(name);
		return decodedName !== "" && !/[\\/]/u.test(decodedName) && decodedName !== "." && decodedName !== ".."
			? { prefix, name: decodedName, version: "v1" }
			: null;
	} catch {
		return null;
	}
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
