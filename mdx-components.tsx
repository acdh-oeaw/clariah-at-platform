import { Callout } from "@/components/content/callout";
import { Disclosure } from "@/components/content/disclosure";
import { Embed } from "@/components/content/embed";
import { Figure } from "@/components/content/figure";
import { Grid, GridItem } from "@/components/content/grid";
import { Link as ContentLink } from "@/components/content/link";
import { LinkButton } from "@/components/content/link-button";
import { TableOfContents } from "@/components/content/table-of-contents";
import { Tab, Tabs } from "@/components/content/tabs";
import { Video } from "@/components/content/video";
import { Link } from "@/components/link";
import { ServerImage as Image } from "@/components/server-image";

const components = {
	a: Link,
	Callout,
	Disclosure,
	Embed,
	Figure,
	Grid,
	GridItem,
	img: Image,
	Link: ContentLink,
	LinkButton,
	Tab,
	TableOfContents,
	Tabs,
	Video,
};

declare global {
	type MDXProvidedComponents = typeof components;
}

export function useMDXComponents(): MDXProvidedComponents {
	return components;
}
