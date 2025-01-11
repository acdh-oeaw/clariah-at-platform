/** @typedef {import("@shikijs/rehype").RehypeShikiOptions} RehypeShikiOptions */

/** @type {RehypeShikiOptions} */
export const config = {
	defaultColor: "light",
	defaultLanguage: "text",
	/** Languages are lazy-loaded on demand. */
	langs: [],
	lazy: true,
	themes: {
		light: "github-light",
		dark: "github-dark",
	},
};
