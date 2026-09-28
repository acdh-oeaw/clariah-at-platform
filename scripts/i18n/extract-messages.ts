import { log } from "@acdh-oeaw/lib";
import { unstable_extractMessages as extractMessages } from "next-intl/extractor";

async function main() {
	await extractMessages({
		messages: {
			format: "po",
			locales: "infer",
			path: "./messages",
			sourceLocale: "en",
		},
		srcPath: ["./app", "./components", "./lib"],
	});

	log.success("Successfully extracted i18n messages.");
}

main().catch((error: unknown) => {
	log.error("Failed to extract i18n messages.\n", error);
});
