import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { createUrl, createUrlSearchParams } from "@acdh-oeaw/lib";

import {
	SSHOC_ACTOR_ID,
	SSHOC_FRONTEND,
	SSHOC_ITEM_CATEGORIES,
	SSHOC_ITEMS_BATCH_SIZE,
	SSHOC_ITEMS_FILE_NAME,
	TYPESENSE_DOCUMENTS_DIR,
} from "@/lib/typesense/constants";
import type { Item, Link, Resource, SShocActor, SShocItemCategory } from "@/types/resources";

class TypesenseDocument implements Resource {
	title: string;
	description: string;
	kind: SShocItemCategory;
	keywords: Array<string>;
	links: Array<Link>;
	importedAt: number;
	constructor(
		title: string,
		description: string,
		kind: SShocItemCategory,
		keywords: Array<string>,
		links: Array<Link>,
		importedAt: number,
	) {
		this.title = title;
		this.description = description;
		this.kind = kind;
		this.keywords = keywords;
		this.links = links;
		this.importedAt = importedAt;
	}
}

const baseUrl = "https://marketplace-api.sshopencloud.eu/api/";

const sshocEndpoints: Record<SShocItemCategory | "actor", string> = {
	"tool-or-service": "tools-services",
	"training-material": "training-materials",
	actor: "actors",
};

async function getSSHOCActorWithItems() {
	const url = createUrl({
		baseUrl,
		pathname: `${sshocEndpoints.actor}/${String(SSHOC_ACTOR_ID)}`,
		searchParams: createUrlSearchParams({
			items: true,
		}),
	});
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${String(response.status)}`);
	}
	const actor = (await response.json()) as SShocActor;
	await writeFile(
		path.join(import.meta.dirname, SSHOC_ITEMS_FILE_NAME),
		JSON.stringify(actor.items),
		{ encoding: "utf-8" },
	);
}

async function getSSHOCItemDetails(category: string, persistentId: string) {
	const endpoint = sshocEndpoints[category as SShocItemCategory];
	const url = createUrl({ baseUrl, pathname: `${endpoint}/${persistentId}` });
	const response = await fetch(url);
	return response;
}

async function getSSHOCItemsDetails() {
	const requests: Array<Promise<Response>> = [];
	try {
		const fileContent = await readFile(path.join(import.meta.dirname, SSHOC_ITEMS_FILE_NAME), {
			encoding: "utf-8",
		});
		const items: Array<Item> = JSON.parse(fileContent) as Array<Item>;
		items
			.map(({ category, persistentId }) => {
				return { category, persistentId };
			})
			.filter((v, i, s) => {
				return (
					i ===
						s.findIndex((t) => {
							return t.category === v.category && t.persistentId === v.persistentId;
						}) && SSHOC_ITEM_CATEGORIES.includes(v.category as SShocItemCategory)
				);
			})
			.forEach((item) => {
				requests.push(getSSHOCItemDetails(item.category, item.persistentId));
			});

		for (let i = 0; i < requests.length; i += SSHOC_ITEMS_BATCH_SIZE) {
			const batch = requests.slice(i, i + SSHOC_ITEMS_BATCH_SIZE);
			const responses = await Promise.allSettled(batch);
			const results = responses.filter((r) => {
				return r.status === "fulfilled" && r.value.ok;
			});
			const detailedItems = results.map((r) => {
				return (r as PromiseFulfilledResult<Response>).value.json();
			});
			const detailedItemsData: Array<Item> = (await Promise.all(detailedItems)) as Array<Item>;
			const typesenseDocuments = detailedItemsData.map((item) => {
				return sshocItemToTypesenseDocument(item);
			});
			await writeFile(
				path.join(
					import.meta.dirname,
					TYPESENSE_DOCUMENTS_DIR,
					`sshoc-items-details-${String(i)}.json`,
				),
				JSON.stringify(typesenseDocuments),
				{ encoding: "utf-8" },
			);
		}
	} catch (err) {
		console.error(err);
	}
}

function sshocItemToTypesenseDocument(item: Item) {
	const keywords = item.properties
		.filter((property) => {
			return property.type.code === "keyword";
		})
		.map((prop) => {
			return prop.concept.label;
		});
	const links: Array<Link> = item.accessibleAt.map((link, idx) => {
		return {
			href: link,
			label: "Accessable at",
			order: idx + 1,
		};
	});
	links.push({
		label: "Visit at SSHOC",
		href: `${SSHOC_FRONTEND}/${item.category}/${item.persistentId}`,
		order: 0,
	});
	const importedAt = Date.now();
	return new TypesenseDocument(
		item.label,
		item.description,
		item.category as SShocItemCategory,
		keywords,
		links,
		importedAt,
	);
}

await getSSHOCActorWithItems();
await getSSHOCItemsDetails();
