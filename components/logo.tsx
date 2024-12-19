import type { ReactNode } from "react";

import { Image } from "@/components/image";

interface LogoProps {
	className?: string;
}

export function Logo(props: Readonly<LogoProps>): ReactNode {
	const { className } = props;

	return (
		<Image
			alt=""
			className={className}
			height={1666}
			priority={true}
			sizes="300px"
			src="/assets/images/clariah-at-logo.png"
			width={676}
		/>
	);
}
