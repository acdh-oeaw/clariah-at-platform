import { addTrailingSlash, removeTrailingSlash } from "@acdh-oeaw/lib";
import * as v from "valibot";

import { define } from "#/lib/env/index.ts";

const validate = define({
	buildArgsPrefix: "NEXT_PUBLIC_",
	buildArgs: v.object({
		NEXT_PUBLIC_API_BASE_URL: v.pipe(v.string(), v.url(), v.transform(removeTrailingSlash)),
		NEXT_PUBLIC_API_OPENAPI_PATHNAME: v.pipe(v.string(), v.nonEmpty(), v.transform(removeTrailingSlash)),
		NEXT_PUBLIC_APP_BASE_URL: v.pipe(v.string(), v.url(), v.transform(removeTrailingSlash)),
		NEXT_PUBLIC_APP_BOTS: v.optional(v.picklist(["disabled", "enabled"]), "disabled"),
		NEXT_PUBLIC_APP_GOOGLE_SITE_VERIFICATION: v.optional(v.pipe(v.string(), v.nonEmpty())),
		NEXT_PUBLIC_APP_IMPRINT_CUSTOM_CONFIG: v.optional(v.picklist(["disabled", "enabled"]), "enabled"),
		NEXT_PUBLIC_APP_IMPRINT_SERVICE_BASE_URL: v.pipe(v.string(), v.url(), v.transform(removeTrailingSlash)),
		NEXT_PUBLIC_APP_MATOMO_BASE_URL: v.optional(v.pipe(v.string(), v.url(), v.transform(addTrailingSlash))),
		NEXT_PUBLIC_APP_MATOMO_ID: v.optional(v.pipe(v.string(), v.toNumber(), v.integer(), v.minValue(1))),
		NEXT_PUBLIC_APP_SERVICE_ID: v.pipe(v.string(), v.toNumber(), v.integer(), v.minValue(1)),
		NEXT_PUBLIC_TYPESENSE_COLLECTION_NAME_RESOURCES: v.pipe(v.string(), v.nonEmpty()),
		NEXT_PUBLIC_TYPESENSE_COLLECTION_NAME_WEBSITE: v.pipe(v.string(), v.nonEmpty()),
		NEXT_PUBLIC_TYPESENSE_HOST: v.pipe(v.string(), v.nonEmpty()),
		NEXT_PUBLIC_TYPESENSE_PORT: v.pipe(v.string(), v.toNumber(), v.integer(), v.minValue(1)),
		NEXT_PUBLIC_TYPESENSE_PROTOCOL: v.optional(v.picklist(["http", "https"]), "https"),
		/**
		 * Optional, because we need to be able to create a collection, before we create a search-only api key for that
		 * collection.
		 */
		NEXT_PUBLIC_TYPESENSE_SEARCH_API_KEY: v.optional(v.pipe(v.string(), v.nonEmpty())),
	}),
	envVars: v.object({
		API_ACCESS_TOKEN: v.optional(v.pipe(v.string(), v.nonEmpty())),
		BUILD_MODE: v.optional(v.picklist(["export", "standalone"])),
		CI: v.optional(v.pipe(v.unknown(), v.toBoolean())),
		NEXT_RUNTIME: v.optional(v.picklist(["edge", "nodejs"])),
		PORT: v.optional(v.pipe(v.string(), v.toNumber(), v.integer(), v.minValue(1))),
		REVALIDATION_WEBHOOK_SECRET: v.optional(v.pipe(v.string(), v.nonEmpty())),
	}),
});

export const env = validate({
	environment: {
		API_ACCESS_TOKEN: process.env.API_ACCESS_TOKEN,
		BUILD_MODE: process.env.BUILD_MODE,
		CI: process.env.CI,
		NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
		NEXT_PUBLIC_API_OPENAPI_PATHNAME: process.env.NEXT_PUBLIC_API_OPENAPI_PATHNAME,
		NEXT_PUBLIC_APP_BASE_URL: process.env.NEXT_PUBLIC_APP_BASE_URL,
		NEXT_PUBLIC_APP_BOTS: process.env.NEXT_PUBLIC_APP_BOTS,
		NEXT_PUBLIC_APP_GOOGLE_SITE_VERIFICATION: process.env.NEXT_PUBLIC_APP_GOOGLE_SITE_VERIFICATION,
		NEXT_PUBLIC_APP_IMPRINT_CUSTOM_CONFIG: process.env.NEXT_PUBLIC_APP_IMPRINT_CUSTOM_CONFIG,
		NEXT_PUBLIC_APP_IMPRINT_SERVICE_BASE_URL: process.env.NEXT_PUBLIC_APP_IMPRINT_SERVICE_BASE_URL,
		NEXT_PUBLIC_APP_MATOMO_BASE_URL: process.env.NEXT_PUBLIC_APP_MATOMO_BASE_URL,
		NEXT_PUBLIC_APP_MATOMO_ID: process.env.NEXT_PUBLIC_APP_MATOMO_ID,
		NEXT_PUBLIC_APP_SERVICE_ID: process.env.NEXT_PUBLIC_APP_SERVICE_ID,
		NEXT_PUBLIC_TYPESENSE_COLLECTION_NAME_RESOURCES: process.env.NEXT_PUBLIC_TYPESENSE_COLLECTION_NAME_RESOURCES,
		NEXT_PUBLIC_TYPESENSE_COLLECTION_NAME_WEBSITE: process.env.NEXT_PUBLIC_TYPESENSE_COLLECTION_NAME_WEBSITE,
		NEXT_PUBLIC_TYPESENSE_HOST: process.env.NEXT_PUBLIC_TYPESENSE_HOST,
		NEXT_PUBLIC_TYPESENSE_PORT: process.env.NEXT_PUBLIC_TYPESENSE_PORT,
		NEXT_PUBLIC_TYPESENSE_PROTOCOL: process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL,
		NEXT_PUBLIC_TYPESENSE_SEARCH_API_KEY: process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_API_KEY,
		NEXT_RUNTIME: process.env.NEXT_RUNTIME,
		PORT: process.env.PORT,
		REVALIDATION_WEBHOOK_SECRET: process.env.REVALIDATION_WEBHOOK_SECRET,
	},
}).unwrap();
