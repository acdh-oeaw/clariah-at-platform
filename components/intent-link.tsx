"use client";

import type { ComponentProps, ReactNode } from "react";

import { Link } from "#/components/link.tsx";
import { useIntentPrefetch } from "#/lib/navigation/use-intent-prefetch.ts";

/** Safe for external urls as well, `next/link` does not prefetch those. */
export function IntentLink(props: Readonly<ComponentProps<typeof Link>>): ReactNode {
	const intentPrefetchProps = useIntentPrefetch();

	return <Link {...props} {...intentPrefetchProps} />;
}
