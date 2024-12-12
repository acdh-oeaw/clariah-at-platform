import { createNavigation } from "next-intl/navigation";
import type { ComponentPropsWithRef, FC, ReactNode } from "react";

import { routing } from "@/config/i18n.config";

const { Link, redirect: _redirect, usePathname, useRouter } = createNavigation(routing);

/** FIXME: @see https://github.com/amannn/next-intl/issues/823 */
const redirect: typeof _redirect = _redirect;

export { redirect, usePathname, useRouter };

export type LocaleLinkProps = Omit<ComponentPropsWithRef<typeof Link>, "href"> & {
	children: ReactNode;
	href?: string | undefined;
};

export const LocaleLink = Link as FC<LocaleLinkProps>;
