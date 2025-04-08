import type { Root } from "mdast";
import { visit } from "unist-util-visit";

export const transformLinkButtons = () => {
	return function transformer(tree: Root) {
		visit(tree, "mdxJsxFlowElement", (node) => {
			if (node.name === "LinkButton") {
				const label = node.attributes.find((attr) => {
					return attr.type === "mdxJsxAttribute" && attr.name === "label";
				});
				if (label) {
					node.children.push({
						type: "paragraph",
						children: [{ type: "text", value: label.value as string }],
					});
				}
				node.attributes = node.attributes.filter((attr) => {
					return attr.type === "mdxJsxAttribute" && attr.name !== "label";
				});
			}
		});
		return tree;
	};
};
