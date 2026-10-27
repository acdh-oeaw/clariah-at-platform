import { cn } from "@acdh-oeaw/style-variants";
import React, { type ReactNode } from "react";

interface HeroSectionProps {
	className?: string;
	children: ReactNode;
}

export function HeroSection(props: HeroSectionProps): ReactNode {
	const { className, children } = props;
	return (
		<section className={cn("px-8 py-14 text-white inline-full", className)}>
			<div className="flex flex-col items-start px-4 gap-y-4 container max-w-7xl">{children}</div>
		</section>
	);
}
