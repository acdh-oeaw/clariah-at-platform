import { cn } from "@acdh-oeaw/style-variants";
import type { ReactNode } from "react";

import { pageColumnClassName } from "#/app/(app)/[locale]/_components/page-column.ts";

interface HeroSectionProps {
	className?: string;
	children: ReactNode;
}

export function HeroSection(props: HeroSectionProps): ReactNode {
	const { className, children } = props;

	return (
		<section className={cn("py-14 text-white inline-full", className)}>
			<div className={cn(pageColumnClassName, "flex flex-col items-start gap-y-4")}>{children}</div>
		</section>
	);
}
