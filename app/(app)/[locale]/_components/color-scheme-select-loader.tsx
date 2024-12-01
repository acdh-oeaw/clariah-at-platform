"use client";

import dynamic from "next/dynamic";

import { ColorSchemeSelectLoadingIndicator } from "@/app/(app)/[locale]/_components/color-scheme-select-loading-indicator";

export const ColorSchemeSelect = dynamic(
	() => {
		return import("@/app/(app)/[locale]/_components/color-scheme-select").then((module) => {
			return { default: module.ColorSchemeSelect };
		});
	},
	{
		// @ts-expect-error `ReactNode` is a valid return type.
		loading: ColorSchemeSelectLoadingIndicator,
		ssr: false,
	},
);
