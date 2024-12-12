import "client-only";

import { assert } from "@acdh-oeaw/lib";
import { useLocale } from "next-intl";
import { useLayoutEffect, useSyncExternalStore } from "react";

import type { ColorScheme, ColorSchemeState } from "@/lib/color-scheme-script";

interface UseColorSchemeReturnValue {
	colorSchemeState: ColorSchemeState;
	setColorScheme: (colorScheme: ColorScheme | null) => void;
}

export function useColorScheme(): UseColorSchemeReturnValue {
	/**
	 * Throws on server and delegates to nearest suspense boundary, re-tries rendering on client.
	 * .
	 * @see https://react.dev/reference/react/Suspense#providing-a-fallback-for-server-errors-and-client-only-content
	 */
	assert(typeof document !== "undefined");

	const locale = useLocale();

	const state = useSyncExternalStore(window.__colorScheme.subscribe, window.__colorScheme.get);

	/**
	 * When the `locale` param changes, next.js will re-render the locale layout, but not
	 * re-execute the color scheme script, resulting in an `<html>` element without
	 * the `data-ui-color-scheme` attribute. So we need to programmatically re-apply it before
	 * next paint.
	 */
	useLayoutEffect(() => {
		window.__colorScheme.sync();
	}, [locale]);

	return {
		colorSchemeState: state,
		setColorScheme: window.__colorScheme.set,
	};
}
