import type { NextConfig } from "next";

type Redirects = Awaited<ReturnType<NonNullable<NextConfig["redirects"]>>>;

export const redirects: Redirects = [
	/** Redirects for urls from the previous clariah.at website. */
	{
		/**
		 * No trailing slash: with the default `trailingSlash: false`, Next strips it with its own redirect before these
		 * run, so a source ending in `/` never matches. The old url with its slash still arrives here, just one hop later.
		 */
		source: "/:locale(en)/in-honor-of-thierry-declerck",
		destination: "/:locale/pages/in-honor-of-thierry-declerck",
		permanent: true,
	},
	{
		/**
		 * No trailing slash: with the default `trailingSlash: false`, Next strips it with its own redirect before these
		 * run, so a source ending in `/` never matches. The old url with its slash still arrives here, just one hop later.
		 */
		source: "/:locale(de)/in-honor-of-thierry-declerck",
		destination: "/:locale/pages/zu-ehren-thierry-declerck",
		permanent: true,
	},
];
