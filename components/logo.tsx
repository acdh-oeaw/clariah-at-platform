// eslint-disable-next-line no-restricted-imports
import type { StaticImageData } from "next/image";
import type { ReactNode } from "react";

import { Image } from "@/components/image";
import logo from "@/public/assets/images/clariah_at_logo_text_as_path.svg";

interface LogoProps {
	className?: string;
}

export function Logo(props: Readonly<LogoProps>): ReactNode {
	const { className } = props;

	return (
		<Image
			alt=""
			className={className}
			height={60}
			priority={true}
			src={logo as StaticImageData}
			width={163}
		/>
	);
}
