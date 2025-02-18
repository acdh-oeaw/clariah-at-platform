import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { log } from "@acdh-oeaw/lib";

import { env } from "@/config/env.config";
import { TYPESENSE_DOCUMENTS_DIR } from "@/lib/typesense/constants";
import { client } from "@/lib/typesense/typesense-client";
import type { Resource } from "@/types/resources";

async function importDocuments() {
	const filenames = readdirSync(path.join(import.meta.dirname, TYPESENSE_DOCUMENTS_DIR));
	const jsonFiles = filenames.filter((file) => {
		return file.endsWith(".json");
	});
	for (const file of jsonFiles) {
		const fileContent = readFileSync(
			path.join(import.meta.dirname, TYPESENSE_DOCUMENTS_DIR, file),
			"utf-8",
		);
		const documents: Array<Resource> = JSON.parse(fileContent) as Array<Resource>;
		await client
			.collections(env.NEXT_PUBLIC_TYPESENSE_COLLECTION_NAME)
			.documents()
			.import(documents, { action: "create" });
	}
}

importDocuments()
	.then(() => {
		log.info("documents created");
	})
	.catch((error: unknown) => {
		log.error(error);
	});
