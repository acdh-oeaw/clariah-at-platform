import { createUrl, createUrlSearchParams } from "@acdh-oeaw/lib";

import type { VideoProvider } from "@/lib/keystatic/component-options";

export function createVideoUrl(
	provider: VideoProvider,
	id: string,
	startTime?: number | null,
): URL {
	switch (provider) {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		case "youtube": {
			return createUrl({
				baseUrl: "https://www.youtube-nocookie.com",
				pathname: `/embed/${id}`,
				searchParams: startTime ? createUrlSearchParams({ start: startTime }) : undefined,
			});
		}
	}
}
