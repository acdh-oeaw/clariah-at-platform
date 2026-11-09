"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { trackNotFound } from "#/lib/analytics/matomo.ts";

/**
 * Tracks the not-found page's view with Matomo, in place of `PageViewTracker`, see `trackNotFound`. Also when the path
 * stays the same - e.g. a page's search params turned out invalid - which `PageViewTracker` would not track at all.
 */
export function NotFoundTracker(): null {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	useEffect(() => {
		const search = searchParams.toString();
		trackNotFound(new URL(search.length > 0 ? `${pathname}?${search}` : pathname, window.location.origin));
	}, [pathname, searchParams]);

	return null;
}
