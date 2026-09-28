import type { Metadata } from "next";
import { useExtracted } from "next-intl";
import { getExtracted } from "next-intl/server";
import type { ReactNode } from "react";

import { HtmlDocument } from "#/app/(app)/_components/html-document.tsx";
import { NotFoundState } from "#/app/(app)/_components/not-found-state";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getExtracted();

	const metadata: Metadata = {
		title: [t("Page not found")].join(" | "),
		/**
		 * Automatically set by next.js.
		 *
		 * @see {@link https://nextjs.org/docs/app/api-reference/functions/not-found}
		 */
		// robots: {
		// 	index: false,
		// },
	};

	return metadata;
}

export default function GlobalNotFoundPage(): ReactNode {
	const t = useExtracted();
	return (
		<HtmlDocument locale="en-GB">
			<body>
				<NotFoundState
					codeLabel={t("Fehler 404")}
					description={t(
						"Die aufgerufene Seite konnte nicht gefunden werden. Sie wurde möglicherweise verschoben, umbenannt oder hat nie existiert.",
					)}
					homeHref="/"
					homeLabel={t("Zurück zur Startseite")}
					logoLabel={t("Startseite")}
					title={t("Seite nicht gefunden")}
				/>
			</body>
		</HtmlDocument>
	);
}
