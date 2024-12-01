import { styles } from "@acdh-oeaw/style-variants";
import type { ReactNode } from "react";

import type { CalloutKind } from "@/lib/keystatic/component-options";

const calloutStyles = styles({
	base: "my-4 grid rounded-2 border p-4 [&_*::marker]:text-inherit [&_*]:text-inherit",
	variants: {
		kind: {
			caution: "border-stroke-error-weak bg-fill-error-weak text-text-error",
			important: "border-stroke-information-weak bg-fill-information-weak text-text-information",
			note: "border-stroke-weak bg-fill-weak text-text-strong",
			tip: "border-stroke-success-weak bg-fill-success-weak text-text-success",
			warning: "border-stroke-warning-weak bg-fill-warning-weak text-text-warning",
		},
	},
	defaults: {
		kind: "note",
	},
});

interface CalloutProps {
	children: ReactNode;
	/** @default "note" */
	kind?: CalloutKind;
	title?: string;
}

export function Callout(props: Readonly<CalloutProps>): ReactNode {
	const { children, kind = "note", title } = props;

	return (
		<aside className={calloutStyles({ kind })}>
			{title ? <strong className="my-3 font-strong text-text-strong">{title}</strong> : null}
			{children}
		</aside>
	);
}
