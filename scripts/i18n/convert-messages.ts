import { readFile, writeFile } from "node:fs/promises";

import { log, set } from "@acdh-oeaw/lib";
import POParser from "po-parser";

async function main() {
	const content = await readFile("./messages/en.po", { encoding: "utf-8" });
	const result = POParser.parse(content);

	const json = {};

	/**
	 * The catalogs follow the gettext layout next-intl writes since amannn/next-intl#2393: the message key is in
	 * `msgctxt`, and `msgid` holds the source text. The header entry has neither, and is skipped.
	 */
	for (const message of result.messages ?? []) {
		if (message.msgctxt == null || message.msgctxt === "") {
			continue;
		}
		set(json, message.msgctxt, message.msgstr);
	}

	await writeFile("./messages/en.json", `${JSON.stringify(json, null, 2)}\n`);

	log.success("Successfully converted i18n messages.");
}

main().catch((error: unknown) => {
	log.error("Failed to convert i18n messages.\n", error);
});
