import { mkdir, rm } from "node:fs/promises";
import path from "node:path";

import { log } from "@acdh-oeaw/lib";
import { Errors } from "typesense";

import { env } from "@/config/env.config";
import { TYPESENSE_DOCUMENTS_DIR } from "@/lib/typesense/constants";
import { createTypesenseClient } from "@/lib/typesense/typesense-client";
import { collectionSchema } from "@/lib/typesense/typesense-schema";

const client = createTypesenseClient(env.TYPESENSE_ADMIN_API_KEY);

try {
	await client.collections(env.NEXT_PUBLIC_TYPESENSE_COLLECTION_NAME).delete();
	log.info("Collection deleted");
} catch (error: unknown) {
	if (error instanceof Errors.ObjectNotFound) {
		log.error("Collection not found");
	} else {
		throw error;
	}
}
client
	.collections()
	.create(collectionSchema)
	.then(async () => {
		log.success("Collection created");
		await rm(path.join(import.meta.dirname, TYPESENSE_DOCUMENTS_DIR), {
			recursive: true,
			force: true,
		});
		await mkdir(path.join(import.meta.dirname, TYPESENSE_DOCUMENTS_DIR), {});
	})
	.catch((error: unknown) => {
		throw error;
	});
