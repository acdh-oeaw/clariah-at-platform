import cn from "clsx/lite";
import type { ReactNode } from "react";

import { Link, type LinkProps } from "#/components/link.tsx";

export function SkipLink(props: Readonly<LinkProps>): ReactNode {
	const { children, className, href, ...rest } = props;

	return (
		<Link
			{...rest}
			/**
			 * Hidden until focused, then above the header, and far enough from the corner of the viewport for the focus
			 * outline to show in full.
			 */
			className={cn(
				"sr-only focus:not-sr-only focus:absolute focus:inset-s-4 focus:inset-bs-4 focus:z-20 focus:bg-white focus:px-4",
				className,
			)}
			href={href}
		>
			{children}
		</Link>
	);
}
