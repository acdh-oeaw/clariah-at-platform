import { MailIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Image } from "@/components/image";
import { Logo } from "@/components/logo";
import { NavLink, type NavLinkProps } from "@/components/nav-link";
import type { Locale } from "@/config/i18n.config";
import { createHref } from "@/lib/create-href";

export function AppFooter(): ReactNode {
	const locale = useLocale();
	const t = useTranslations("AppFooter");

	const links = {
		imprint: {
			href: createHref({ pathname: "/imprint" }),
			label: t("links.imprint"),
		},
	} satisfies Record<string, { href: NavLinkProps["href"]; label: string }>;

	const oeawLinks = {
		de: { href: "https://www.oeaw.ac.at/" },
		en: { href: "https://www.oeaw.ac.at/en/" },
	} satisfies Record<Locale, { href: string }>;

	return (
		<footer className="layout-grid grid gap-y-6 border-t border-stroke-weak py-12">
			<div className="grid gap-y-8 xs:flex xs:justify-between">
				<div className="grid gap-y-4">
					<div>CLARIAH-AT</div>
					<Logo className="h-11 w-auto shrink-0" />
					<div className="grid">
						<dl className="grid gap-y-2">
							<div className="inline-flex items-center gap-x-2">
								<dt>Consortium speaker:</dt>
								<dd>
									<a
										className="focus-visible:focus-outline rounded-0.5 hover:underline"
										href="mailto:office@clariah.at"
									>
										Walter Scholger
									</a>
								</dd>
							</div>
							<div className="inline-flex items-center gap-x-2">
								<dt>
									<span className="sr-only">Email:</span>
									<MailIcon className="size-4 shrink-0" />
								</dt>
								<dd>
									<a
										className="focus-visible:focus-outline rounded-0.5 hover:underline"
										href="mailto:office@clariah.at"
									>
										office@clariah.at
									</a>
								</dd>
							</div>
						</dl>
					</div>
				</div>
				<div>
					<div>{t("funded-by")}</div>
					<a
						className="focus-visible:focus-outline rounded-0.5 hover:underline"
						href="https://www.bmbwf.gv.at"
					>
						<span className="sr-only">{t("bmbwf")}</span>
						<Image alt="" height={75} src="/assets/images/bmbwf-logo.png" width={225}></Image>
					</a>
				</div>
			</div>

			<div className="grid gap-y-8">
				<nav aria-label={t("navigation-secondary")}>
					<ul
						className="flex items-center gap-x-6 text-small text-text-weak xs:justify-center"
						role="list"
					>
						<li>
							&copy; {new Date().getUTCFullYear()}{" "}
							<a
								className="focus-visible:focus-outline rounded-0.5 hover:underline"
								href={oeawLinks[locale].href}
							>
								OEAW
							</a>
						</li>
						{Object.entries(links).map(([id, link]) => {
							return (
								<li key={id}>
									<NavLink
										className="focus-visible:focus-outline rounded-0.5 hover:underline"
										href={link.href}
									>
										{link.label}
									</NavLink>
								</li>
							);
						})}
					</ul>
				</nav>
			</div>
		</footer>
	);
}
