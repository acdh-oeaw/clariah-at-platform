import { useExtracted } from "next-intl";
import { Fragment, type ReactNode, Suspense } from "react";

import { mainContentId } from "#/app/(app)/[locale]/_components/main.tsx";
import { NotFoundTracker } from "#/app/(app)/_components/not-found-tracker.tsx";
import { StatusMessage, StatusState } from "#/app/(app)/_components/status-state.tsx";

/** Sets the title itself, because `notFound()` can end up rendering this in the browser, past `generateMetadata`. */
export function NotFoundState(): ReactNode {
	const t = useExtracted();

	const title = t("Seite nicht gefunden");

	return (
		<Fragment>
			<title>{title}</title>
			<StatusState id={mainContentId}>
				<StatusMessage
					codeLabel={t("Fehler 404")}
					description={t(
						"Die aufgerufene Seite konnte nicht gefunden werden. Sie wurde möglicherweise verschoben, umbenannt oder hat nie existiert.",
					)}
					title={title}
				/>
			</StatusState>
			{/* Reads the url, which is unknown when the page is prerendered. */}
			<Suspense>
				<NotFoundTracker />
			</Suspense>
		</Fragment>
	);
}
