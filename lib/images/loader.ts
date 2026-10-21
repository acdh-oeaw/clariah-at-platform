"use client";

import type { ImageLoaderProps } from "next/image";

import { sourceWidthParam } from "#/configs/image.config.ts";
import { createImageVariantUrl } from "#/lib/images/variants.ts";

/**
 * The `loader` for images rendered by the api's variant endpoint, passed per instance by `ApiImage` (both the
 * client-safe one in `./image.tsx` and the server-only one in `./api-image.tsx`).
 *
 * Deliberately not registered as `images.loaderFile`: a site-wide custom loader makes next answer every `/_next/image`
 * request with a 404, which would take the built-in optimizer away from static imports and `/public` files too — see
 * the comment on `images` in `next.config.ts`.
 *
 * `"use client"` because `next/image` is a client component, and a function only crosses from a server component into
 * one as a client reference.
 */
export function apiImageLoader(props: Readonly<ImageLoaderProps>): string {
	const { src, width } = props;

	/**
	 * Imgproxy does not enlarge. A candidate wider than the source comes back at the source's size while its `srcset`
	 * descriptor claims otherwise — and the browser, believing the descriptor, picks it. Clamping collapses every such
	 * candidate onto the same url, which the browser then fetches once.
	 */
	const sourceWidth = Number(new URL(src).searchParams.get(sourceWidthParam));
	const isKnownSourceWidth = Number.isFinite(sourceWidth) && sourceWidth > 0;

	return createImageVariantUrl(src, isKnownSourceWidth ? Math.min(width, sourceWidth) : width);
}
