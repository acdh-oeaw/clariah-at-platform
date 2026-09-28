import type { renderToReactElement } from "@tiptap/static-renderer/pm/react";

type ReactMarkMapping = NonNullable<NonNullable<Parameters<typeof renderToReactElement>[0]["options"]>["markMapping"]>;

interface RichTextLinkRenderer {
	linkOptions: {
		HTMLAttributes: {
			class: string;
			rel: null;
			target: null;
		};
	};
	markMapping: ReactMarkMapping;
}

/**
 * Keeps link attributes consistent between Tiptap's schema renderer and the React static renderer. Links intentionally
 * render without Tiptap's default target and rel attributes.
 */
export function createRichTextLinkRenderer(className: string): RichTextLinkRenderer {
	const markMapping: ReactMarkMapping = {
		link({ children, mark }) {
			const hrefAttribute: unknown = mark.attrs.href;
			const href = typeof hrefAttribute === "string" ? hrefAttribute : undefined;

			return (
				<a className={className} href={href}>
					{children}
				</a>
			);
		},
	};

	return {
		linkOptions: {
			HTMLAttributes: {
				class: className,
				target: null,
				rel: null,
			},
		},
		markMapping,
	};
}
