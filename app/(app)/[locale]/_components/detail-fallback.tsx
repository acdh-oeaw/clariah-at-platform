import { useExtracted } from "next-intl";
import type { ReactNode } from "react";

/**
 * Suspense fallback for a detail page's content. Takes up at least a full viewport, so the footer stays below the fold
 * while the content streams in, instead of flashing up under the banner and then being pushed down again.
 *
 * Says it is loading only to assistive technology - visually, the empty space is the placeholder.
 */
export function DetailFallback(): ReactNode {
	const t = useExtracted();

	return (
		<div className="min-h-svh" role="status">
			<span className="sr-only">{t("Wird geladen…")}</span>
		</div>
	);
}
