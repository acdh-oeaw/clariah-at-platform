import { Fira_Code, Inter } from "next/font/google";

export const body = Inter({
	axes: ["opsz"],
	display: "swap",
	style: ["normal", "italic"],
	subsets: ["latin", "latin-ext"],
	variable: "--font-body",
});

export const heading = Inter({
	axes: ["opsz"],
	display: "swap",
	style: ["normal", "italic"],
	subsets: ["latin", "latin-ext"],
	variable: "--font-heading",
});

export const mono = Fira_Code({
	display: "swap",
	preload: false,
	subsets: ["latin", "latin-ext"],
	variable: "--font-mono",
});
