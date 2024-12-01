import { ChevronDownIcon } from "lucide-react";
import type { ReactNode } from "react";

interface DisclosureProps {
	children: ReactNode;
	title: string;
}

export function Disclosure(props: Readonly<DisclosureProps>): ReactNode {
	const { children, title } = props;

	return (
		<details className="group my-4 grid border-y open:pb-2">
			<summary className="my-4 inline-flex cursor-pointer list-none items-center justify-between gap-x-4 font-strong text-text-strong hover:underline">
				{title}
				<ChevronDownIcon
					aria-hidden={true}
					className="size-6 shrink-0 text-icon-neutral group-open:rotate-180"
				/>
			</summary>
			{children}
		</details>
	);
}
