import { cn } from "@acdh-oeaw/style-variants";
import type { ReactNode } from "react";

import { Link } from "@/components/content/link";
import type { LinkSchema } from "@/lib/keystatic/get-link-props";

interface LinkButtonProps {
	children: ReactNode;
	className?: string;
	link: LinkSchema;
}

export function LinkButton(props: Readonly<LinkButtonProps>): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<Link
			{...rest}
			className={cn(
				"my-4 inline-flex min-h-12 w-fit rounded-2 border border-stroke-brand-strong bg-fill-brand-strong px-4 py-2.5 font-strong text-text-inverse-strong",
				"interactive focus-visible:focus-outline hover:hover-overlay pressed:press-overlay",
				className,
			)}
		>
			{children}
		</Link>
	);
}
