import type { ValueForReading } from "@keystatic/core";

import type { createLinkSchema } from "@/lib/keystatic/create-link-schema";

export type LinkSchema = ValueForReading<ReturnType<typeof createLinkSchema>>;

export function getLinkProps(params: LinkSchema) {
	switch (params.discriminant) {
		case "download": {
			return { download: true, href: params.value };
		}

		case "external": {
			return { href: params.value };
		}

		case "index-page": {
			return { href: "/" };
		}

		case "events": {
			return { href: `/events/${params.value}/` };
		}

		case "events-overview": {
			return { href: "/events" };
		}

		case "news": {
			return { href: `/news/${params.value}/` };
		}

		case "news-overview": {
			return { href: "/news" };
		}

		case "in-a-nutshell": {
			return { href: "/in-a-nutshell" };
		}

		case "projects": {
			return { href: `/projects/${params.value}/` };
		}

		case "projects-overview": {
			return { href: `/projects` };
		}

		case "pages": {
			return { href: `/${params.value}` };
		}

		case "search": {
			return { href: `/search` };
		}
	}
}
