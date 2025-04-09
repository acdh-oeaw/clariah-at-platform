declare module "vfile" {
	interface DataMap {
		matter: {
			title?: string | undefined;
		};
	}
}

export type FrontmatterData = Record<string, unknown>;

export interface NewsPredecessor {
	title: string;
	date: string;
	image: string;
	shortTitle: string;
	summary: string;
}

export interface News {
	title: string;
	publicationDate: string;
	image: {
		readonly src: string;
		readonly caption: string;
	};
	summary: {
		readonly title: string;
		readonly content: string;
	};
	links: ReadonlyArray<{
		readonly label: string;
		readonly url: string;
	}>;
	attachments: ReadonlyArray<{
		readonly file: string;
		readonly label: string;
	}>;
}

export type FrontmatterTransformer<T, R> = (input: T) => R;
