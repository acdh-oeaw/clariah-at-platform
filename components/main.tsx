import cn from "clsx/lite";
import type { ComponentProps, ReactNode } from "react";

interface MainProps extends Omit<ComponentProps<"main">, "tabIndex"> {
	children: ReactNode;
}

export function Main(props: Readonly<MainProps>): ReactNode {
	const { children, className, ...rest } = props;

	/**
	 * Focusable as the skip link's target only, so it shows no focus outline. `outline-hidden` rather than `outline-none`
	 * keeps one in forced colors mode.
	 */
	return (
		<main {...rest} className={cn("flex-1 outline-hidden", className)} tabIndex={-1}>
			{children}
		</main>
	);
}
