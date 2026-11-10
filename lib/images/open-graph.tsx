import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { ImageResponse } from "next/og";

import { env } from "#/configs/env.config.ts";
import { openGraphImageSize } from "#/configs/image.config.ts";
import type { ImageAssetParams } from "#/lib/images/variants.ts";

/** The space kept clear around an svg, so a logo does not run into the preview's edges. */
const padding = 120;

/**
 * An svg's own size, from its `viewBox`, or failing that its `width` and `height` (a unit such as `px` is dropped) -
 * only the ratio matters, since the image is scaled to fit anyway. `null` for markup which declares neither.
 */
function getSvgSize(svg: string): { width: number; height: number } | null {
	const root = /<svg\b[^>]*>/u.exec(svg)?.[0];

	if (root == null) {
		return null;
	}

	const viewBox = /\bviewBox\s*=\s*["'](?<value>[^"']+)["']/u
		.exec(root)
		?.groups?.value?.trim()
		.split(/[\s,]+/u)
		.map(Number);

	if (viewBox?.length === 4) {
		const [, , width = 0, height = 0] = viewBox;

		if (width > 0 && height > 0) {
			return { width, height };
		}
	}

	const width = Number(/\bwidth\s*=\s*["'](?<value>[\d.]+)/u.exec(root)?.groups?.value ?? "");
	const height = Number(/\bheight\s*=\s*["'](?<value>[\d.]+)/u.exec(root)?.groups?.value ?? "");

	return width > 0 && height > 0 ? { width, height } : null;
}

/**
 * An svg as a png link preview, since crawlers do not render an svg `og:image`: scaled to fit inside the padding and
 * centred on white, so a logo is never cropped. Satori needs the `<img>`'s size up front, which is why the svg's own is
 * read from its markup; one which declares none fills the padded box.
 */
export function createSvgOpenGraphImage(svg: string): ImageResponse {
	const { width, height } = openGraphImageSize;

	const box = { width: width - 2 * padding, height: height - 2 * padding };
	const size = getSvgSize(svg) ?? box;
	const scale = Math.min(box.width / size.width, box.height / size.height);

	return new ImageResponse(
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				width: "100%",
				height: "100%",
				background: "white",
			}}
		>
			{/* oxlint-disable-next-line nextjs/no-img-element -- satori renders plain elements, `next/image` means nothing to it. */}
			<img
				alt=""
				height={size.height * scale}
				src={`data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`}
				width={size.width * scale}
			/>
		</div>,
		openGraphImageSize,
	);
}

/**
 * An svg from the api's variant endpoint, as markup, or `null` if the asset is missing or is not an svg - the route
 * which renders one to a png takes an asset's name from its url, so it must not trust it.
 *
 * A plain `fetch` rather than the endpoint's `request`: the variant endpoint is public, and redirects to the image
 * proxy, which the api's access token has no business reaching.
 */
export async function getSvgImage(params: ImageAssetParams): Promise<string | null> {
	"use cache";
	cacheLife("content");
	cacheTag("assets");

	try {
		const response = await fetch(
			`${env.NEXT_PUBLIC_API_BASE_URL}/api/v1/assets/${params.prefix}/${encodeURIComponent(params.name)}/image/${params.version}`,
		);

		if (!response.ok || response.headers.get("content-type")?.startsWith("image/svg+xml") !== true) {
			return null;
		}

		return await response.text();
	} catch {
		return null;
	}
}
