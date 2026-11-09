"use client";

import { cn } from "@acdh-oeaw/style-variants";
import { RssIcon } from "lucide-react";
import type { ReactNode } from "react";

import { linkStyles } from "#/components/link.tsx";

interface FeedLinkProps {
	children: ReactNode;
	className?: string;
	href: string;
}

/**
 * A visible link to the rss feed, styled like the footer's navigation links. Browsers no longer surface the `<link
 * rel="alternate">` which `FeedAlternateLink` adds, so without it only feed readers would find the feed.
 *
 * A plain `<a>`, since the feed is a route handler, not a page for client-side navigation to render. A client
 * component, because `linkStyles` comes from a client module.
 */
export function FeedLink(props: Readonly<FeedLinkProps>): ReactNode {
	const { children, className, href } = props;

	return (
		<a
			className={cn(linkStyles({ variant: "primary" }), "flex items-center gap-x-1", className)}
			href={href}
			type="application/rss+xml"
		>
			<RssIcon aria-hidden={true} className="size-4" />
			<span>{children}</span>
		</a>
	);
}
