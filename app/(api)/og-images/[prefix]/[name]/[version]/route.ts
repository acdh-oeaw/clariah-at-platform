import { createSvgOpenGraphImage, getSvgImage } from "#/lib/images/open-graph.tsx";
import type { ImageAssetParams } from "#/lib/images/variants.ts";

/** Render only SVG assets from the public api; never accept an arbitrary source URL. */
export async function GET(
	_request: Request,
	context: { params: Promise<{ prefix: string; name: string; version: string }> },
): Promise<Response> {
	const { prefix, name, version } = await context.params;

	if (
		(prefix !== "avatars" && prefix !== "documents" && prefix !== "images" && prefix !== "logos") ||
		version !== "v1" ||
		name === "" ||
		name === "." ||
		name === ".." ||
		/[\\/]/u.test(name)
	) {
		return new Response(null, { status: 404 });
	}

	const params: ImageAssetParams = { prefix, name, version };
	const svg = await getSvgImage(params);

	return svg == null ? new Response(null, { status: 404 }) : createSvgOpenGraphImage(svg);
}
