import type { FrontmatterTransformer, News, NewsPredecessor } from "../types";

export const transformNewsFrontmatter: FrontmatterTransformer<NewsPredecessor, News> = function (
	newsPredecessor,
) {
	const { title, date: publicationDate, image, shortTitle, summary } = newsPredecessor;

	const newsFrontMatter: News = {
		title,
		publicationDate,
		image: {
			src: image,
			caption: "",
		},
		summary: {
			title: shortTitle,
			content: summary,
		},
		links: [],
		attachments: [],
	};
	return newsFrontMatter;
};
