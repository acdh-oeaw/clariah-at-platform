import type { Metadata, ResolvingMetadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { MainContent } from "@/components/main-content";
import type { Locale } from "@/config/i18n.config";

interface NotFoundPageProps {
	params: {
		locale: Locale;
	};
}

export async function generateMetadata(
	props: Readonly<NotFoundPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = params;
	const t = await getTranslations({ locale, namespace: "NotFoundPage" });

	const metadata: Metadata = {
		title: t("meta.title"),
		/**
		 * Automatically set by next.js.
		 *
		 * @see https://nextjs.org/docs/app/api-reference/functions/not-found
		 */
		// robots: {
		// 	index: false,
		// },
	};

	return metadata;
}

export default function NotFoundPage(_props: Readonly<NotFoundPageProps>): ReactNode {
	const t = useTranslations("NotFoundPage");

	return (
		<MainContent className="layout-grid bg-fill-weaker">
			<section className="grid place-content-center place-items-center py-16 xs:py-24">
				<h1 className="text-balance text-center font-heading text-display font-strong text-text-strong">
					{t("title")}
				</h1>
			</section>
		</MainContent>
	);
}
