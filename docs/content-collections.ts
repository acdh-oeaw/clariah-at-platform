/* eslint-disable @typescript-eslint/no-unused-vars */

interface Event {
	title: string;
	// publication date
	date: string;
	image: string;
	location: string;
	host: Array<Person | Organisation>;
	speaker: Array<Person>;
	summary: string;
	eventDateStart: string;
	eventLocation: string;
	eventDateEnd?: string;
	shortTitle?: string;
	links?: Array<{
		label: string;
		url: string;
	}>;
}

interface News {
	title: string;
	// publication date
	date: string;
	image: string;
	summary: string;
	shortTitle?: string;
}

interface Organisation {
	name: string;
	image: string;
	description: string;
	affiliation: Array<Organisation>;
	consortiumStatus: "member" | "observer";
}

interface Page {
	title: string;
	image?: string;
	summary?: string;
}

interface Person {
	name: string;
	image: string;
	description: string;
	affiliation: Array<Organisation>;
	links: Array<SocialMediaLink>;
	contact: Array<Person>;
}

interface Project {
	title: string;
	summary: string;
	shortTitle?: string;
	startDate?: string;
	endDate?: string;
	image: string;
}

interface SocialMediaLink {
	type: "Bluesky" | "Instagram" | "LinkedIn" | "Mastodon" | "ORCID";
	url: string;
}
