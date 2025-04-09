import { dump } from "js-yaml";
import type { Root } from "mdast";
import { visit } from "unist-util-visit";
import type { VFile } from "vfile";
import { matter } from "vfile-matter";

import type { FrontmatterData, FrontmatterTransformer } from "@/scripts/content-migration/types";

interface TransformFrontmatterPluginOptions<T, R> {
	transformFunction: FrontmatterTransformer<T, R>;
}

export const transformFrontmatterPlugin = <T, R>(
	options: TransformFrontmatterPluginOptions<T, R>,
) => {
	const { transformFunction } = options;
	return function transformer(tree: Root, file: VFile) {
		matter(file);
		const frontmatter = file.data.matter as FrontmatterData;
		const frontmatterTransformed = transformFunction(frontmatter as T);

		visit(tree, "yaml", (node) => {
			const updatedFrontmatter: string = dump(frontmatterTransformed);
			node.value = updatedFrontmatter;
		});
		return tree;
	};
};
