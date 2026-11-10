import { getSvgOpenGraphImage } from "#/lib/images/open-graph.tsx";
import type { ImageAssetParams } from "#/lib/images/variants.ts";

/**
 * Render only SVG assets from the public api; never accept an arbitrary source URL. The path is versioned, so a
 * replaced asset gets a new url - which is why the response can be cached as immutable.
 */
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
	const png = await getSvgOpenGraphImage(params);

	if (png == null) {
		return new Response(null, { status: 404 });
	}

	return new Response(png, {
		headers: {
			"cache-control": "public, immutable, no-transform, max-age=31536000",
			"content-type": "image/png",
		},
	});
}
