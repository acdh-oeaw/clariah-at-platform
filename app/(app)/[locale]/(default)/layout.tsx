import { useExtracted } from "next-intl";
import { Fragment, type ReactNode, Suspense } from "react";

import { Footer } from "#/app/(app)/[locale]/_components/footer";
import { Header } from "#/app/(app)/[locale]/_components/header.tsx";
import { mainContentId } from "#/app/(app)/[locale]/_components/main.tsx";
import { SkipLink } from "#/components/skip-link.tsx";

interface DefaultLayoutProps extends LayoutProps<"/[locale]"> {}

export default function DefaultLayout(props: Readonly<DefaultLayoutProps>): ReactNode {
	const { children } = props;

	const t = useExtracted();

	return (
		<Fragment>
			<SkipLink href={`#${mainContentId}`}>{t("Zum Hauptinhalt springen")}</SkipLink>

			<div className="relative isolate flex min-h-full flex-col">
				<Suspense>
					<Header />
				</Suspense>
				{children}
				<Suspense>
					<Footer />
				</Suspense>
			</div>
		</Fragment>
	);
}
