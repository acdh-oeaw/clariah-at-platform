import "@/styles/index.css";

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { env } from "@/config/env.config";

interface RootLayoutProps {
	children: ReactNode;
}

export const viewport: Viewport = {
	colorScheme: "light dark",
	initialScale: 1,
	width: "device-width",
};

export const metadata: Metadata = {
	metadataBase: new URL(env.NEXT_PUBLIC_APP_BASE_URL),
	alternates: {
		canonical: "./",
	},
};

/**
 * Since we have a root `not-found.tsx` page, a layout file is required,
 * even if it's just passing children through.
 */
export default function RootLayout(props: Readonly<RootLayoutProps>): ReactNode {
	const { children } = props;

	return children;
}
