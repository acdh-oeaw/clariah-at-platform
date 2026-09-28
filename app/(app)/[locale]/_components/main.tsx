import type { ComponentProps, ReactNode } from "react";

import { Main as BaseMain } from "#/components/main.tsx";

export const mainContentId = "main-content";

interface MainProps extends Omit<ComponentProps<typeof BaseMain>, "id"> {
	children: ReactNode;
}

export function Main(props: Readonly<MainProps>): ReactNode {
	const { children, ...rest } = props;

	return (
		<BaseMain {...rest} id={mainContentId}>
			{children}
		</BaseMain>
	);
}
