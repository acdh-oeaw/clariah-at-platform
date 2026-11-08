"use client";

import type { ReactNode } from "react";

import { ErrorState } from "#/app/(app)/[locale]/_components/error-state.tsx";
import { StatusLogo } from "#/app/(app)/_components/status-state.tsx";

interface LocaleErrorPageProps {
	error: unknown;
}

/** Catches what the default layout itself throws, i.e. a failing header or footer, so there is no header to show. */
export default function LocaleErrorPage(props: Readonly<LocaleErrorPageProps>): ReactNode {
	const { error } = props;

	return (
		<ErrorState error={error}>
			<StatusLogo />
		</ErrorState>
	);
}
