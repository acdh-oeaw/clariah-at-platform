import { useState } from "react";

interface UseIntentPrefetchReturnValue {
	onFocus: () => void;
	onHoverStart: () => void;
	onTouchStart: () => void;
	prefetch: "auto" | true;
}

/**
 * Cards come in grids, and `prefetch={true}` costs a request per visible link. So only a link the user shows interest
 * in prefetches its content, the others stay on `"auto"`, which prefetches the shell of the page.
 *
 * Touch has no hover, so a finger landing on the link counts as interest. That includes the start of a scroll, but the
 * destination pages set `ensureStatic = "prefetch"`, so such a prefetch is served from static output.
 */
export function useIntentPrefetch(): UseIntentPrefetchReturnValue {
	const [hasIntent, setHasIntent] = useState(false);

	function onIntent(): void {
		setHasIntent(true);
	}

	return { onFocus: onIntent, onHoverStart: onIntent, onTouchStart: onIntent, prefetch: hasIntent ? true : "auto" };
}
