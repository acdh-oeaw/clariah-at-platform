import { cn } from "@acdh-oeaw/style-variants";
import React, { type ReactNode } from "react";

interface HeroSectionProps {
	className?: string;
	children: ReactNode;
}

export function HeroSection(props: HeroSectionProps): ReactNode {
	const { className, children } = props;
	return (
		<section className={cn("py-28 text-white inline-full", className)}>
			<div className="flex flex-col items-center gap-y-4 max-w-4xl mx-auto">{children}</div>
		</section>
	);
}
