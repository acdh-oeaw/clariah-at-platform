import cn from "clsx/lite";
import type { ReactNode } from "react";

import { pageColumnClassName } from "#/app/(app)/[locale]/_components/page-column.ts";

interface PageContentProps {
	children: ReactNode;
	/** Added to, not replacing, the container's own classes — e.g. to lay out its children. */
	className?: string;
	/**
	 * `narrow` is for single-column content, e.g. the events list. It caps the content's width inside the page column
	 * rather than narrowing the column itself, so the content keeps the left edge it shares with the banner title and the
	 * navigation.
	 */
	width?: "default" | "narrow";
}

/** The page column a listing page's content sits in, below the `PageLayout` banner. */
export function PageContent(props: Readonly<PageContentProps>): ReactNode {
	const { children, className, width = "default" } = props;

	if (width === "narrow") {
		return (
			<div className={cn(pageColumnClassName, "py-8 md:py-16")}>
				<div className={cn("max-inline-6xl", className)}>{children}</div>
			</div>
		);
	}

	return <div className={cn(pageColumnClassName, "py-8 md:py-16", className)}>{children}</div>;
}
