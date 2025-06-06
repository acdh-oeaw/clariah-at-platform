import type { ReactNode } from "react";

import { env } from "@/config/env.config";

export function TailwindIndicator(): ReactNode {
	if (env.NODE_ENV !== "development") return null;

	return (
		<div className="fixed bottom-4 right-4 z-10 grid size-8 cursor-default select-none place-content-center rounded-full bg-background-inverse font-mono text-tiny font-strong text-text-inverse-strong shadow-raised">
			<span className="xs:hidden" role="status">
				2xs
			</span>
			<span className="max-xs:hidden sm:hidden" role="status">
				xs
			</span>
			<span className="max-sm:hidden md:hidden" role="status">
				sm
			</span>
			<span className="max-md:hidden lg:hidden" role="status">
				md
			</span>
			<span className="max-lg:hidden xl:hidden" role="status">
				lg
			</span>
			<span className="max-xl:hidden 2xl:hidden" role="status">
				xl
			</span>
			<span className="max-2xl:hidden 3xl:hidden" role="status">
				2xl
			</span>
			<span className="max-3xl:hidden" role="status">
				3xl
			</span>
		</div>
	);
}
