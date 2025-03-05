import { withI18nPrefix } from "@acdh-oeaw/keystatic-lib";
import { config } from "@keystatic/core";

import { Logo } from "@/components/logo";
import { env } from "@/config/env.config";
import { locales } from "@/config/i18n.config";
import {
	createDocumentation,
	createEvents,
	createKeywords,
	createNews,
	createOrganisation,
	createPages,
	createPersons,
	createProjects,
} from "@/lib/keystatic/collections";
import {
	createEventsOverview,
	createIndexPage,
	createMetadata,
	createNavigation,
	createNewsOverview,
	createProjectsOverview,
	createSearch,
} from "@/lib/keystatic/singletons";

export default config({
	collections: {
		[withI18nPrefix("events", "de")]: createEvents("de"),
		[withI18nPrefix("events", "en")]: createEvents("en"),

		[withI18nPrefix("keywords", "de")]: createKeywords("de"),
		[withI18nPrefix("keywords", "en")]: createKeywords("en"),

		[withI18nPrefix("news", "de")]: createNews("de"),
		[withI18nPrefix("news", "en")]: createNews("en"),

		[withI18nPrefix("organisations", "de")]: createOrganisation("de"),
		[withI18nPrefix("organisations", "en")]: createOrganisation("en"),

		[withI18nPrefix("persons", "de")]: createPersons("de"),
		[withI18nPrefix("persons", "en")]: createPersons("en"),

		[withI18nPrefix("projects", "de")]: createProjects("de"),
		[withI18nPrefix("projects", "en")]: createProjects("en"),

		[withI18nPrefix("pages", "de")]: createPages("de"),
		[withI18nPrefix("pages", "en")]: createPages("en"),

		[withI18nPrefix("documentation", "de")]: createDocumentation("de"),
		[withI18nPrefix("documentation", "en")]: createDocumentation("en"),
	},
	singletons: {
		[withI18nPrefix("index-page", "de")]: createIndexPage("de"),
		[withI18nPrefix("index-page", "en")]: createIndexPage("en"),

		[withI18nPrefix("metadata", "de")]: createMetadata("de"),
		[withI18nPrefix("metadata", "en")]: createMetadata("en"),

		[withI18nPrefix("navigation", "de")]: createNavigation("de"),
		[withI18nPrefix("navigation", "en")]: createNavigation("en"),

		[withI18nPrefix("events-overview", "de")]: createEventsOverview("de"),
		[withI18nPrefix("events-overview", "en")]: createEventsOverview("en"),

		[withI18nPrefix("news-overview", "de")]: createNewsOverview("de"),
		[withI18nPrefix("news-overview", "en")]: createNewsOverview("en"),

		[withI18nPrefix("projects-overview", "de")]: createProjectsOverview("de"),
		[withI18nPrefix("projects-overview", "en")]: createProjectsOverview("en"),

		[withI18nPrefix("search", "de")]: createSearch("de"),
		[withI18nPrefix("search", "en")]: createSearch("en"),
	},
	storage:
		env.NEXT_PUBLIC_KEYSTATIC_MODE === "github" &&
		env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_OWNER &&
		env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_NAME
			? {
					kind: "github",
					repo: {
						owner: env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_OWNER,
						name: env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_NAME,
					},
					branchPrefix: "content/",
				}
			: {
					kind: "local",
				},
	ui: {
		brand: {
			mark() {
				return <Logo />;
			},
			name: "ACDH-CH",
		},
		navigation: {
			HomePage: locales.map((locale) => {
				return withI18nPrefix("index-page", locale);
			}),
			Events: locales.map((locale) => {
				return withI18nPrefix("events", locale);
			}),
			"Events Overview": locales.map((locale) => {
				return withI18nPrefix("events-overview", locale);
			}),
			Keywords: locales.map((locale) => {
				return withI18nPrefix("keywords", locale);
			}),
			News: locales.map((locale) => {
				return withI18nPrefix("news", locale);
			}),
			"News Overview": locales.map((locale) => {
				return withI18nPrefix("news-overview", locale);
			}),
			Organisations: locales.map((locale) => {
				return withI18nPrefix("organisations", locale);
			}),
			Persons: locales.map((locale) => {
				return withI18nPrefix("persons", locale);
			}),
			Projects: locales.map((locale) => {
				return withI18nPrefix("projects", locale);
			}),
			"Projects Overview": locales.map((locale) => {
				return withI18nPrefix("projects-overview", locale);
			}),
			Pages: locales.map((locale) => {
				return withI18nPrefix("pages", locale);
			}),
			Navigation: locales.map((locale) => {
				return withI18nPrefix("navigation", locale);
			}),
			Metadata: locales.map((locale) => {
				return withI18nPrefix("metadata", locale);
			}),
			Search: locales.map((locale) => {
				return withI18nPrefix("search", locale);
			}),
		},
	},
});
