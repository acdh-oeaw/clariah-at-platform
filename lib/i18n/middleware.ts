import createI18nMiddleware from "next-intl/middleware";

import { routing } from "#/lib/i18n/routing.ts";

/**
 * `routing.ts` sets `alternateLinks: false`, so this no longer needs to touch the `Link` response header itself — see
 * the comment there and the linked Next.js issue for why.
 */
export const middleware = createI18nMiddleware(routing);
