import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import glob from "fast-glob";
import matter, { type GrayMatterFile } from "gray-matter";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { default as stripMarkdown } from "strip-markdown";
import { unified } from "unified";

import {
	CMS_CONTENT_TYPES,
	LANGUAGE_MAPPINGS,
	TYPESENSE_DOCUMENTS_DIR,
} from "@/lib/typesense/constants";
import type { CMSContentTypes, Link, Resource, ResourceLanguage } from "@/types/resources";

class TypesenseDocument implements Resource {
	title: string;
	description: string;
	kind: CMSContentTypes;
	keywords: Array<string>;
	links: Array<Link>;
	language: ResourceLanguage;
	importedAt: number;
	constructor(
		title: string,
		description: string,
		kind: CMSContentTypes,
		keywords: Array<string>,
		links: Array<Link>,
		language: ResourceLanguage,
		importedAt: number,
	) {
		this.title = title;
		this.description = description;
		this.kind = kind;
		this.keywords = keywords;
		this.links = links;
		this.language = language;
		this.importedAt = importedAt;
	}
}

const CMSContentToTypesenseDocument = function (
	lang: ResourceLanguage,
	contentType: CMSContentTypes,
	filePaths: Array<string>,
) {
	const typesenseDocuments: Array<TypesenseDocument> = [];

	filePaths.map((filePath) => {
		const mdxContent = readFileSync(filePath, "utf-8");

		try {
			const { data: frontmatter, content }: GrayMatterFile<string> = matter(mdxContent);
			const { title } = frontmatter;

			const processor = unified()
				.use(remarkParse)
				.use(remarkGfm)
				.use(stripMarkdown)
				.use(remarkStringify);

			const parsedContent = processor.processSync(content).toString();
			const keywords: Array<string> = [];
			const links: Array<Link> = [];
			const importedAt = Date.now();
			const typesenseDocument = new TypesenseDocument(
				title as string,
				parsedContent,
				contentType,
				keywords,
				links,
				lang,
				importedAt,
			);

			typesenseDocuments.push(typesenseDocument);
		} catch (err: unknown) {
			console.log(err);
		}
	});
	return typesenseDocuments;
};

CMS_CONTENT_TYPES.map((contentType) => {
	Object.values(LANGUAGE_MAPPINGS).forEach((lang) => {
		const filePaths = glob.sync(`${process.cwd()}/content/${lang}/${contentType}/**/index.mdx`);
		const typesenseDocuments: Array<TypesenseDocument> = CMSContentToTypesenseDocument(
			lang,
			contentType,
			filePaths,
		);
		writeFileSync(
			path.join(import.meta.dirname, TYPESENSE_DOCUMENTS_DIR, `${contentType}-${lang}.json`),
			JSON.stringify(typesenseDocuments),
			{ encoding: "utf-8" },
		);
	});
});
