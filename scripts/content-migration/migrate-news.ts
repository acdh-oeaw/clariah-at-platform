import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import glob from "fast-glob";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import fromMarkdown from "remark-parse";
import remarkStringify from "remark-stringify";
import { unified } from "unified";

import { locales } from "@/config/i18n.config";
import { transformNewsFrontmatter } from "@/scripts/content-migration/lib/frontmatter-transformers";
import { transformFrontmatterPlugin } from "@/scripts/content-migration/lib/transform-frontmatter";
import { transformLinkButtons } from "@/scripts/content-migration/lib/transform-link-buttons";

const processor = unified()
	.use(fromMarkdown)
	.use(remarkFrontmatter)
	.use(remarkGfm)
	.use(remarkMdx)
	.use(transformLinkButtons)
	.use(transformFrontmatterPlugin, { transformFunction: transformNewsFrontmatter })
	.use(remarkStringify);

const migrateData = () => {
	locales.forEach((locale) => {
		const filePaths = glob.sync(`./clariah-at-website/content/${locale}/news/**/index.mdx`);
		Promise.all(
			filePaths.map(async (filePath) => {
				const mdxContent = readFileSync(filePath, "utf-8");
				const outputFilePath: string = filePath.replace("clariah-at-website/", "");
				if (!existsSync(outputFilePath)) {
					mkdirSync(dirname(outputFilePath));
					await processor.process(mdxContent).then((updatedContent) => {
						writeFileSync(outputFilePath, String(updatedContent), "utf-8");
					});
				}
			}),
		)
			.then(() => {
				// eslint-disable-next-line no-console
				console.info(`migration for ${locale} complete`);
			})
			.catch((err: unknown) => {
				console.error(err);
			});
	});
};

migrateData();
