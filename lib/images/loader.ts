import type { ImageLoaderProps } from "next/image";

import { imageQuality, sourceWidthParam } from "#/configs/image.config.ts";
import { createImageVariantUrl, isApiImageSrc } from "#/lib/images/variants.ts";

/**
 * The `images.loaderFile` for the whole site.
 *
 * Registering a loader replaces the built-in one everywhere, so this has to serve both kinds of image the site has:
 * renditions from the api's variant endpoint, and the static imports and `/public` files that still belong to the
 * built-in optimizer. Which one a `src` is decides the branch; nothing else about the two paths is shared.
 *
 * @see {@link https://nextjs.org/docs/app/api-reference/components/image#loaderfile}
 */
// eslint-disable-next-line import-x/no-default-export -- next resolves `images.loaderFile` by its default export.
export default function imageLoader(props: Readonly<ImageLoaderProps>): string {
	const { quality, src, width } = props;

	/**
	 * Locally served images keep going through `/_next/image`. The url is assembled by hand because a custom loader is
	 * deliberately not handed the image config — the default loader's own `basePath`, `path` and `qualities` are not
	 * reachable from here, so the two values this app actually diverges from the defaults on live in `image.config.ts`
	 * instead.
	 *
	 * Delegating to the default loader instead is not an option, tempting as it looks: registering a `loaderFile` makes
	 * the bundler alias `next/dist/shared/lib/image-loader` to this very file, so importing it calls back into here.
	 */
	if (!isApiImageSrc(src)) {
		/**
		 * Except vectors, which the optimizer rejects outright without `dangerouslyAllowSVG` — there is nothing to resize
		 * in one anyway. `Image` marks these `unoptimized`, so in practice they do not reach here; the guard is what keeps
		 * a call site that forgets from emitting a url that 400s.
		 */
		if (src.split("?", 1)[0]?.endsWith(".svg") === true) {
			return src;
		}

		const { deploymentId, url } = detachDeploymentId(src);
		const stamp = deploymentId == null ? "" : `&dpl=${deploymentId}`;

		return `/_next/image?url=${encodeURIComponent(url)}&w=${String(width)}&q=${String(quality ?? imageQuality)}${stamp}`;
	}

	/**
	 * Imgproxy does not enlarge. A candidate wider than the source comes back at the source's size while its `srcset`
	 * descriptor claims otherwise — and the browser, believing the descriptor, picks it. Clamping collapses every such
	 * candidate onto the same url, which the browser then fetches once.
	 */
	const sourceWidth = Number(new URL(src).searchParams.get(sourceWidthParam));
	const isKnownSourceWidth = Number.isFinite(sourceWidth) && sourceWidth > 0;

	return createImageVariantUrl(src, isKnownSourceWidth ? Math.min(width, sourceWidth) : width);
}

/**
 * Split a `?dpl=` stamp off a locally served asset url.
 *
 * A deployment that versions its immutable assets — Vercel does — hands `next/image` a `src` that already carries the
 * stamp. It cannot stay inside the `url` parameter: the optimizer matches that value against `images.localPatterns`,
 * whose default admits no query string at all, and answers a stamped one with a 400. The default loader lifts it out
 * and re-attaches it to the optimizer url, where it keeps doing its job of parting one deployment's renditions from the
 * next's, and this does the same.
 *
 * Deliberately no fallback to the ambient deployment id for a `src` that arrives without a stamp: next reads that id
 * once, off an attribute it removes from the document as it goes, so there is nothing left here to read. Only string
 * `src`s addressing `/public` are affected, of which the site currently has none — every local image is a static
 * import, and those are stamped.
 */
function detachDeploymentId(src: string): { deploymentId: string | null; url: string } {
	/**
	 * Sidestepping `new URL` because `src` is a path, and resolving it against a base would normalize the result into
	 * something `encodeURIComponent` then double-encodes.
	 */
	const separatorIndex = src.indexOf("?");

	if (separatorIndex === -1) {
		return { deploymentId: null, url: src };
	}

	const params = new URLSearchParams(src.slice(separatorIndex + 1));
	const deploymentId = params.get("dpl");

	if (deploymentId == null) {
		return { deploymentId: null, url: src };
	}

	params.delete("dpl");

	const path = src.slice(0, separatorIndex);
	const rest = params.toString();

	return { deploymentId, url: rest === "" ? path : `${path}?${rest}` };
}
