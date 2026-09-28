import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import { env } from "#/configs/env.config.ts";
import { imageQuality } from "#/configs/image.config.ts";

/** @see {@link https://github.com/adobe/react-spectrum/pull/10462} */
const reactAriaPackages = [
	"@react-stately",
	"@react-aria",
	"@react-spectrum",
	"@adobe/react-spectrum",
	"react-stately",
	"react-aria",
	"react-aria-components",
];

const reactAriaLocales = `**/{${reactAriaPackages.join(",")}}/**/??-??.{js,cjs,mjs,json}`;

const config: NextConfig = {
	cacheComponents: true,
	experimental: {
		cachedNavigations: true,
		globalNotFound: true,
		strictRouteTypes: true,
		turbopackRustReactCompiler: true,
	},
	images: {
		/**
		 * The api's image-variant endpoint accepts only the widths on its allowlist, so the ladder `next/image` picks
		 * `srcset` candidates from is that allowlist rather than the defaults. Both lists are candidates; what separates
		 * them is that the smallest `deviceSizes` entry is also the floor below which a `sizes`-bearing image is offered
		 * nothing. The two rungs narrower than any viewport therefore belong in `imageSizes`, where a fixed-width thumbnail
		 * can still reach them but a full-bleed slot is not handed a 320px candidate.
		 *
		 * @see {@link file://./config/image.config.ts}
		 */
		deviceSizes: [640, 960, 1280, 1600, 2048, 2560, 3200, 3840],
		imageSizes: [320, 480],
		/**
		 * Every image on the site is now addressed through `lib/images/loader.ts`: api images become variant-endpoint urls,
		 * and everything local is handed back to `/_next/image`. No image url reaches the optimizer from outside this app
		 * any more, which is what `remotePatterns` used to be here to allow.
		 */
		loaderFile: "./lib/images/loader.ts",
		qualities: [imageQuality],
	},
	logging: {
		browserToTerminal: true,
		fetches: {
			hmrRefreshes: true,
			fullUrl: true,
		},
	},
	output: env.BUILD_MODE,
	outputFileTracingIncludes: {
		"**/*": ["./public/assets/fonts/**/*.ttf"],
	},
	partialPrefetching: true,
	reactCompiler: true,
	turbopack: {
		rules: {
			[reactAriaLocales]: {
				condition: { all: ["foreign", "browser"] },
				loaders: ["./configs/turbopack/empty-locale-module-loader.cjs"],
				as: "*.js",
			},
			"*.css": {
				loaders: ["@tailwindcss/turbopack"],
				as: "*.css",
			},
		},
	},
	typedRoutes: false,
	typescript: {
		ignoreBuildErrors: true,
	},
};

const plugins: Array<(config: NextConfig) => NextConfig> = [
	createNextIntlPlugin({
		experimental: {
			extract: true,
			messages: {
				format: "po",
				locales: "infer",
				path: "./messages",
				precompile: true,
				sourceLocale: "de",
			},
			srcPath: ["./app", "./components", "./lib"],
		},
		requestConfig: "./lib/i18n/request.ts",
	}),
];

export default plugins.reduce((config, plugin) => plugin(config), config);
