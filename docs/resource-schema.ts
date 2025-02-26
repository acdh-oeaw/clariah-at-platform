/* eslint-disable @typescript-eslint/no-unused-vars */

import type { Keyword } from "@/docs/content-collections";

interface Resource {
	title: string;
	kind: "publication" | "tool" | "training" | "course";
	description: string;
	links: Array<{
		label: string;
		href: string;
	}>;
	language: "de" | "en" | "un";
	keywords: Array<Keyword>;
}
