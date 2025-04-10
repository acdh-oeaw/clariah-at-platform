import type { Entry } from "@keystatic/core/reader";

import type { Locale } from "@/config/i18n.config";
import type keystaticConfig from "@/keystatic.config";

declare module "@acdh-oeaw/keystatic-lib" {
	export interface KeystaticConfig {
		locales: Locale;
	}
}

type InferredConfig = typeof keystaticConfig;

type ExtractCollectionType<T extends string> = T extends `${string}:${infer R}` ? R : never;

type Collection = ExtractCollectionType<keyof InferredConfig["collections"]>;

type Keyword = Entry<InferredConfig["collections"]["de:keywords"]>;
type Person = Entry<InferredConfig["collections"]["de:persons"]>;
type Organisation = Entry<InferredConfig["collections"]["de:organisations"]>;

type IndexPage = Entry<InferredConfig["singletons"]["de:index-page"]>;

export type HeroSectionProps = IndexPage["hero"];
export type FeatureSectionProps = IndexPage["main"] & { locale: Locale };

type ExtractCardSection = Extract<
	FeatureSectionProps["sections"][number],
	{ discriminant: "cardsSection" }
>["value"] & { locale: Locale };

export type CardSectionProps = Omit<ExtractCardSection, "id">;
export type CardProps = ExtractCardSection["cards"][number]["value"] & {
	discriminent: ExtractCardSection["cards"][number]["discriminant"];
};
