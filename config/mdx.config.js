/** @typedef {import("@acdh-oeaw/mdx-lib").MdxProcessorOptions} MdxProcessorOptions */
/** @typedef {import("hast").ElementContent} ElementContent */
/** @typedef {import("@/config/i18n.config").Locale} Locale */

import "server-only";

import {
	typographyConfig,
	withCustomHeadingIds,
	withFootnotes,
	withIframeTitles,
	withImageSizes,
	withTableOfContents,
	withUnwrappedMdxFlowContent,
} from "@acdh-oeaw/mdx-lib";
import withSyntaxHighlighter from "@shikijs/rehype";
import { getTranslations } from "next-intl/server";
import withHeadingIds from "rehype-slug";
import withFrontmatter from "remark-frontmatter";
import withGfm from "remark-gfm";
import withMdxFrontmatter from "remark-mdx-frontmatter";
import withTypographicQuotes from "remark-smartypants";

import { config as syntaxHighlighterConfig } from "./syntax-highlighter.config";

/** @type {(locale: Locale) => Promise<MdxProcessorOptions>} */
export async function createConfig(locale) {
	const t = await getTranslations({ locale, namespace: "mdx" });

	/** @type {MdxProcessorOptions} */
	const config = {
		remarkPlugins: [
			withFrontmatter,
			withMdxFrontmatter,
			withGfm,
			withFootnotes,
			[withTypographicQuotes, typographyConfig[locale]],
		],
		remarkRehypeOptions: {
			/** @see https://github.com/syntax-tree/mdast-util-to-hast/blob/13.0.0/lib/footer.js#L81 */
			footnoteBackContent(_, rereferenceIndex) {
				/** @type {Array<ElementContent>} */
				const result = [{ type: "text", value: "↩" }];

				if (rereferenceIndex > 1) {
					result.push({
						type: "element",
						tagName: "sup",
						properties: {},
						children: [{ type: "text", value: String(rereferenceIndex) }],
					});
				}

				return result;
			},
			/** @see https://github.com/syntax-tree/mdast-util-to-hast/blob/13.0.0/lib/footer.js#L108 */
			footnoteBackLabel(referenceIndex, rereferenceIndex) {
				return t("footnote-back-label", {
					reference:
						String(referenceIndex + 1) +
						(rereferenceIndex > 1 ? `-${String(rereferenceIndex)}` : ""),
				});
			},
			footnoteLabel: t("footnotes"),
			footnoteLabelProperties: { className: ["sr-only"] },
			footnoteLabelTagName: "h2",
		},
		rehypePlugins: [
			withCustomHeadingIds,
			withHeadingIds,
			[withIframeTitles, { components: ["Embed", "Video"] }],
			[withImageSizes, { components: ["Figure"] }],
			[withSyntaxHighlighter, syntaxHighlighterConfig],
			withTableOfContents,
			[withUnwrappedMdxFlowContent, { components: ["LinkButton"] }],
		],
	};

	return config;
}
