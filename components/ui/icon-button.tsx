"use client";

import cn from "clsx/lite";
import { type ComponentPropsWithRef, Fragment, type ReactNode } from "react";
import { composeRenderProps } from "react-aria-components";

import { Button } from "#/components/ui/button.tsx";

interface IconButtonProps extends Omit<ComponentPropsWithRef<typeof Button>, "variant"> {
	label: ReactNode;
}

export function IconButton(props: Readonly<IconButtonProps>): ReactNode {
	const { children, className, label, ...rest } = props;

	return (
		<Button
			{...rest}
			className={composeRenderProps(className, (className) =>
				cn("touch-area inline-flex rounded-sm hover:bg-primary-100", className),
			)}
			variant="unstyled"
		>
			{composeRenderProps(children, (children) => (
				<Fragment>
					{children}
					<span className="sr-only">{label}</span>
				</Fragment>
			))}
		</Button>
	);
}
