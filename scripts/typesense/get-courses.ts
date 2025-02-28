import { writeFile } from "node:fs/promises";
import path from "node:path";

import { createUrl, createUrlSearchParams } from "@acdh-oeaw/lib";

import { COURSE_REGISTRY_FRONTEND, TYPESENSE_DOCUMENTS_DIR } from "@/lib/typesense/constants";
import type { Course, Link, Resource } from "@/types/resources";

class TypesenseDocument implements Resource {
	title: string;
	description: string;
	kind: "course";
	keywords: Array<string>;
	links: Array<Link>;
	importedAt: number;
	constructor(
		title: string,
		description: string,
		kind: "course",
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

const baseUrl = "https://dhcr.clarin-dariah.eu/api/v2/";

async function getCourses() {
	const url = createUrl({
		baseUrl,
		pathname: "courses/index",
		searchParams: createUrlSearchParams({
			country_id: 9,
		}),
	});
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${String(response.status)}`);
	}
	const { courses } = (await response.json()) as { courses: Array<Course> };
	const typesenseDocuments = courses.map((course) => {
		return courseToTypesenseDocument(course);
	});
	await writeFile(
		path.join(import.meta.dirname, TYPESENSE_DOCUMENTS_DIR, "courses.json"),
		JSON.stringify(typesenseDocuments),
		{ encoding: "utf-8" },
	);
}

function courseToTypesenseDocument(course: Course) {
	const keywords: Array<string> = [];
	const links: Array<Link> = [];

	links.push({
		label: "Visit at Course Registry",
		href: `${COURSE_REGISTRY_FRONTEND}/${String(course.id)}`,
		order: 0,
	});

	links.push({
		label: "Accessable at",
		href: course.info_url,
		order: 1,
	});

	const importedAt = Date.now();
	return new TypesenseDocument(
		course.name,
		course.description,
		"course",
		keywords,
		links,
		importedAt,
	);
}

await getCourses();
