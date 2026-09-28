import cn from "clsx/lite";
import type { ReactNode } from "react";

import { Link, type LinkProps } from "#/components/link.tsx";

export function SkipLink(props: Readonly<LinkProps>): ReactNode {
	const { children, className, href, ...rest } = props;

	return (
		<Link {...rest} className={cn("absolute z-0 focus:z-9", className)} href={href}>
			{children}
		</Link>
	);
}
