import type { ReactNode } from "react";

import { Main } from "#/app/(app)/[locale]/_components/main";

interface PageLayoutProps {
	children: ReactNode;
	title: string;
	/**
	 * Detail pages render the item's own name as their `h1`, so the section title in the banner must not be a second
	 * heading there.
	 */
	titleElement?: "h1" | "p";
}

export function PageLayout(props: Readonly<PageLayoutProps>): ReactNode {
	const { children, title, titleElement: TitleElement = "h1" } = props;

	return (
		<Main className="flex flex-col gap-y-12 bg-primary-100">
			<div className="bg-primary-1000 px-28 py-4">
				<TitleElement className="flex relative items-end text-h2 text-white">{title}</TitleElement>
			</div>
			{children}
		</Main>
	);
}
