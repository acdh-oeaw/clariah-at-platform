import { getExtracted } from "next-intl/server";
import { type ReactNode, Suspense } from "react";

import { ResourcesSearch } from "#/app/(app)/[locale]/(default)/resources/_components/resources-search";
import { Main } from "#/app/(app)/[locale]/_components/main.tsx";

export default async function ResourcesPage(): Promise<ReactNode> {
	const t = await getExtracted();

	return (
		<Main className="flex flex-col gap-y-12 bg-primary-100">
			<div className="bg-primary-1000 px-28 py-4">
				<h1 className="flex relative items-end text-h2 text-white">{t("Suche")}</h1>
			</div>
			<div className="container  max-w-7xl">
				<Suspense>
					<ResourcesSearch />
				</Suspense>
			</div>
		</Main>
	);
}
