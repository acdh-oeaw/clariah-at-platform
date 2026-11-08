"use client";

import type { ComponentProps, ReactNode } from "react";

import { LinkButton } from "#/components/ui/button";
import { useIntentPrefetch } from "#/lib/navigation/use-intent-prefetch.ts";

export function CardLink(props: Readonly<ComponentProps<typeof LinkButton>>): ReactNode {
	const intentPrefetchProps = useIntentPrefetch();

	return <LinkButton {...props} {...intentPrefetchProps} />;
}
