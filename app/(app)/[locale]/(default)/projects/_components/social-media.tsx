import { useExtracted } from "next-intl";
import type { ReactNode } from "react";

import type { Schemas } from "#/lib/data/api-client.ts";
import { WebsiteIcon } from "#/lib/social-media/social-media-icons";
import { config } from "#/lib/social-media/social-media.config.ts";

type SocialMediaType = Schemas["ProjectSocialMedia"]["type"];

interface SocialMediaLink {
	id: string;
	/** The label entered in the cms. Optional, so links from a schema without one can be passed as they are. */
	name?: string | null;
	type: SocialMediaType;
	url: string;
}

interface SocialMediaLinksProps {
	className?: string;
	links: ReadonlyArray<SocialMediaLink>;
}

/**
 * The fallback label for a link the cms gave no name. Platform names are brands, so they are not translated - only the
 * generic types are, see `getLabel`.
 */
const platformNames = {
	bluesky: "Bluesky",
	facebook: "Facebook",
	flickr: "Flickr",
	instagram: "Instagram",
	linkedin: "LinkedIn",
	mastodon: "Mastodon",
	twitter: "X (Twitter)",
	vimeo: "Vimeo",
	youtube: "YouTube",
} as const satisfies Partial<Record<SocialMediaType, string>>;

/** The url's host, e.g. `example.org` - names a link of no particular platform better than a generic word does. */
function getHostname(url: string): string | null {
	try {
		return new URL(url).hostname.replace(/^www\./, "");
	} catch {
		return null;
	}
}

/**
 * An entity's social media and website links, each an icon and a visible label (the name entered in the cms, else one
 * derived from the type or url), so the link names itself without an icon having to be recognised. Types without an
 * icon of their own (`vimeo`, `other`) fall back to the website icon.
 */
export function SocialMediaLinks(props: Readonly<SocialMediaLinksProps>): ReactNode {
	const { className, links } = props;

	const t = useExtracted();

	if (links.length === 0) {
		return null;
	}

	function getLabel(link: SocialMediaLink): string {
		const name = link.name?.trim();
		if (name != null && name !== "") {
			return name;
		}

		if (link.type === "website" || link.type === "other") {
			return getHostname(link.url) ?? t("Website");
		}

		return platformNames[link.type];
	}

	return (
		<ul className={className ?? "flex flex-col gap-y-3"} role="list">
			{links.map((link) => {
				const Icon = link.type in config ? config[link.type as keyof typeof config].icon : WebsiteIcon;

				return (
					<li key={link.id}>
						<a
							className="inline-flex items-center gap-x-2 text-primary-1000 underline-offset-4 hover:underline"
							href={link.url}
							rel="noreferrer"
						>
							<Icon className="shrink-0 size-5" />
							<span>{getLabel(link)}</span>
						</a>
					</li>
				);
			})}
		</ul>
	);
}
