import type { ReactNode } from "react";

import { Providers } from "#/app/(app)/[locale]/_components/providers.tsx";
import { SiteShell } from "#/app/(app)/[locale]/_components/site-shell.tsx";
import { HtmlDocument } from "#/app/(app)/_components/html-document.tsx";
import { MatomoAnalytics } from "#/app/(app)/_components/matomo-analytics.tsx";
import { NotFoundState } from "#/app/(app)/_components/not-found-state.tsx";
import { env } from "#/configs/env.config.ts";
import { defaultLocale } from "#/lib/i18n/locales.ts";

/** For urls which match no route. This is one static page without a locale segment, so it uses the default locale. */
export default function GlobalNotFoundPage(): ReactNode {
	return (
		<HtmlDocument locale={defaultLocale}>
			<body>
				<Providers>
					<SiteShell>
						<NotFoundState />
					</SiteShell>
				</Providers>
				{env.NEXT_PUBLIC_APP_MATOMO_ID != null && env.NEXT_PUBLIC_APP_MATOMO_BASE_URL != null ? (
					<MatomoAnalytics baseUrl={env.NEXT_PUBLIC_APP_MATOMO_BASE_URL} id={env.NEXT_PUBLIC_APP_MATOMO_ID} />
				) : null}
			</body>
		</HtmlDocument>
	);
}
