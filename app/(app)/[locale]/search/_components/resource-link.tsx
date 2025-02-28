import { cn } from "@acdh-oeaw/style-variants";
import { ExternalLink as ExternalLinkIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Link } from "@/components/link";
import type { Link as ResourceLink } from "@/types/resources";

interface ResourceLinkProps {
	link: ResourceLink;
}

export function ResourceLink(props: ResourceLinkProps): ReactNode {
	const { link } = props;
	let externalResourceHost;
	try {
		const url = new URL(link.href);
		externalResourceHost = url.host;
	} catch (err: unknown) {
		console.warn(err);
	}

	return (
		<Link
			className={cn(
				link.order === 0 &&
					"inline-flex w-fit rounded-2 border-2 border-gray-950 px-2 py-0.5 text-sm ",
				"focus-visible:focus-outline pressed:press-overlay",
			)}
			href={link.href}
			rel="noreferrer"
			target="_blank"
		>
			{link.order === 0 ? (
				link.label
			) : (
				<>
					<ExternalLinkIcon className={"size-5"} />
					{externalResourceHost ? (
						<span className="sr-only">External Resource at {externalResourceHost}</span>
					) : null}
				</>
			)}
		</Link>
	);
}
