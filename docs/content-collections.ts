/* eslint-disable @typescript-eslint/no-unused-vars */

type IsoDateString = string;
type MdxInlineContent = string;
type MdxContent = string;

interface Event {
  title: string;
  publicationDate: IsoDateString;
  image: {
    src: string;
    caption?: MdxInlineContent;
  };
  summary: {
    content: MdxInlineContent;
    title?: string;
  };
  startDate: IsoDateString;
  endDate?: IsoDateString;
  location: string;
  hosts: Array<Person | Organisation>;
  speakers: Array<Person>;
  links: Array<{
    label: string;
    href: string;
  }>;
  attachments: Array<{
    label: string;
    href: string;
  }>;
  content: MdxContent;
}

interface News {
  title: string;
  publicationDate: IsoDateString;
  image: {
    src: string;
    caption?: MdxInlineContent;
  };
  summary: {
    content: MdxInlineContent;
    title?: string;
  };
	links: Array<{
    label: string;
    href: string;
  }>;
  attachments: Array<{
    label: string;
    href: string;
  }>;
  content: MdxContent;
}

interface Organisation {
  name: string;
  image: {
    src: string;
    caption?: MdxInlineContent;
  };
  affiliations: Array<Organisation>;
	contact: Array<Person>;
  consortiumStatus: "member" | "observer" | "none";
  description: MdxContent;
}

interface Page {
  title: string;
  image: {
    src: string;
    caption?: MdxInlineContent;
  };
  summary: {
    content: MdxInlineContent;
    title?: string;
  };
  content: MdxContent;
}

interface Person {
  name: string;
  image: {
    src: string;
    caption?: MdxInlineContent;
  };
  affiliations: Array<Organisation>;
  links: Array<SocialMediaLink>;
  description: MdxContent;
}

interface Project {
  title: string;
  image: {
    src: string;
    caption?: MdxInlineContent;
  };
  summary: {
    content: MdxInlineContent;
    title?: string;
  };
	funding: Funding;
	responsiblePersons: Array<Person>;
	projectPartners: Array<Organisation>
  startDate?: IsoDateString;
  endDate?: IsoDateString;
	keywords: Array<Keyword>;
	links: Array<{
    label: string;
    href: string;
  }>;
	content: MdxContent;
}

interface Keyword {
	label: string;
	description: MdxContent;
	links: Array<{
    label: string;
    href: string;
  }>;
	synonyms: Array<string>;
}

interface Funding {
	 type:
		| "go!digital"
	  | "CLARIAH-AT 2022"
}

interface SocialMediaLink {
  type:
    | "bluesky"
    | "email"
    | "facebook"
    | "instagram"
    | "linked-in"
    | "mastodon"
    | "orcid"
    | "twitter"
    | "website"
    | "youtube";
  href: string;
}
