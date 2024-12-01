/** @typedef {import("shiki").BuiltinTheme} BuiltinTheme */

/** @type {import("shiki").CodeOptionsThemes<BuiltinTheme>} */
export const config = {
	defaultColor: "light",
	themes: {
		light: "github-light",
		dark: "github-dark",
	},
};
