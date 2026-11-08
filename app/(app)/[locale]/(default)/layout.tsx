import type { ReactNode } from "react";

import { SiteShell } from "#/app/(app)/[locale]/_components/site-shell.tsx";

interface DefaultLayoutProps extends LayoutProps<"/[locale]"> {}

export default function DefaultLayout(props: Readonly<DefaultLayoutProps>): ReactNode {
	const { children } = props;

	return <SiteShell>{children}</SiteShell>;
}
