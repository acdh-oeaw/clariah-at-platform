import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import { env } from "#/configs/env.config.ts";
import { imageQuality } from "#/configs/image.config.ts";
import { redirects } from "#/configs/redirects.config.ts";

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
	/**
	 * Api data is invalidated on demand by the revalidation webhook, so entries are long-lived. The daily background
	 * refresh is only a safety net for a lost webhook, and `stale` stays at the 5 minutes an entry needs to be part of
	 * the app shell. `expire` is shorter than the data needs, because the cache is local to the pod: it limits how old a
	 * copy from the image can be after a restart. Use a shorter profile for data no webhook covers.
	 */
	cacheLife: {
		content: {
			stale: 300,
			revalidate: 86_400,
			expire: 604_800,
		},
	},
	/** Traefik compresses responses, see `.github/auto-deploy-values.yaml`. */
	compress: false,
	experimental: {
		cachedNavigations: true,
		globalNotFound: true,
		strictRouteTypes: true,
		turbopackRustReactCompiler: true,
	},
	images: {
		/**
		 * The widths the api's image-variant endpoint accepts. The two narrower than any viewport go in `imageSizes`, so a
		 * full-width image is not offered a 320px candidate.
		 */
		deviceSizes: [640, 960, 1280, 1600, 2048, 2560, 3200, 3840],
		imageSizes: [320, 480],
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
	redirects() {
		return Promise.resolve(redirects);
	},
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
