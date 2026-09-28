import { type GetVariantProps, styles } from "@acdh-oeaw/style-variants";
import type { ComponentPropsWithRef, ReactNode } from "react";

/** A static label. For something the user can select or remove, use a tag instead. */
const badgeStyles = styles({
	base: [
		"inline-flex items-center gap-x-1.5 py-0.5 text-xs/5 font-medium inline-fit forced-colors:outline",
		"*:data-[slot=icon]:shrink-0 *:data-[slot=icon]:block-3 *:data-[slot=icon]:inline-3",
	],
	variants: {
		intent: {
			primary: "bg-primary-1000 text-white",
			outline: "text-black inset-ring inset-ring-gray-300",
		},
		isCircle: {
			true: "rounded-full px-2",
			false: "rounded-sm px-1.5",
		},
	},
	defaults: {
		intent: "primary",
		isCircle: true,
	},
});

type BadgeStyleProps = GetVariantProps<typeof badgeStyles>;

interface BadgeProps extends Omit<ComponentPropsWithRef<"span">, "children">, BadgeStyleProps {
	children: ReactNode;
}

export function Badge(props: Readonly<BadgeProps>): ReactNode {
	const { children, className, intent, isCircle, ...rest } = props;

	return (
		<span {...rest} className={badgeStyles({ className, intent, isCircle })}>
			{children}
		</span>
	);
}
