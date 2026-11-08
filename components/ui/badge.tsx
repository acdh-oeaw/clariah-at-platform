import cn from "clsx/lite";
import type { ComponentPropsWithRef, ReactNode } from "react";

/** A static label. For something the user can select or remove, use a tag instead. */
const badgeClassName = cn(
	/** Forced colors drop the background, which the border then stands in for. Outlines are only for focus. */
	"inline-flex items-center gap-x-1.5 rounded-full bg-primary-1000 px-2 py-0.5 text-xs/5 font-medium text-white inline-fit forced-colors:border",
	"*:data-[slot=icon]:shrink-0 *:data-[slot=icon]:block-3 *:data-[slot=icon]:inline-3",
);

interface BadgeProps extends Omit<ComponentPropsWithRef<"span">, "children"> {
	children: ReactNode;
}

export function Badge(props: Readonly<BadgeProps>): ReactNode {
	const { children, className, ...rest } = props;

	return (
		<span {...rest} className={cn(badgeClassName, className)}>
			{children}
		</span>
	);
}
