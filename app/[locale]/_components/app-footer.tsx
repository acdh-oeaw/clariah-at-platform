import { useLocale, useTranslations } from "next-intl";
import type { FC, ReactNode } from "react";

import {
	// BlueskyLogo,
	MastodonLogo,
	TwitterLogo,
	YouTubeLogo,
} from "@/app/[locale]/_components/social-media-logos";
import { Logo } from "@/components/logo";
import { NavLink, type NavLinkProps } from "@/components/nav-link";
import type { Locale } from "@/config/i18n.config";
import { createHref } from "@/lib/create-href";

export function AppFooter(): ReactNode {
	const locale = useLocale();
	const t = useTranslations("AppFooter");

	const links = {
		contact: {
			href: createHref({ pathname: "/contact" }),
			label: t("links.contact"),
		},
		imprint: {
			href: createHref({ pathname: "/imprint" }),
			label: t("links.imprint"),
		},
	} satisfies Record<string, { href: NavLinkProps["href"]; label: string }>;

	const socialMedia = {
		// bluesky: {
		// 	href: "https://bsky.app/acdh_oeaw",
		// 	label: t("social-media.bluesky"),
		// 	// icon: "/assets/images/logo-bluesky.svg",
		// 	icon: BlueskyLogo,
		// },
		mastodon: {
			href: "https://fedihum.org/@acdhch_oeaw",
			label: t("social-media.mastodon"),
			// icon: "/assets/images/logo-mastodon.svg",
			icon: MastodonLogo,
		},
		twitter: {
			href: "https://www.twitter.com/acdh_oeaw",
			label: t("social-media.twitter"),
			// icon: "/assets/images/logo-twitter.svg",
			icon: TwitterLogo,
		},
		youtube: {
			href: "https://www.youtube.com/channel/UCgaEMaMbPkULYRI5u6gvG-w",
			label: t("social-media.youtube"),
			// icon: "/assets/images/logo-youtube.svg",
			icon: YouTubeLogo,
		},
	} satisfies Record<string, { href: string; label: string; icon: FC }>;

	const acdhLinks = {
		de: { href: "https://www.oeaw.ac.at/de/acdh/" },
		en: { href: "https://www.oeaw.ac.at/acdh/" },
	} satisfies Record<Locale, { href: string }>;

	return (
		<footer className="layout-grid grid gap-y-6 border-t border-stroke-weak py-12">
			<div className="grid gap-y-8 xs:flex xs:items-center xs:justify-between">
				<Logo className="h-8 w-auto shrink-0" />

				<nav aria-label="navigation-social-media">
					<ul className="flex flex-wrap items-center gap-x-6" role="list">
						{Object.entries(socialMedia).map(([id, link]) => {
							const Icon = link.icon;

							return (
								<li key={id} className="shrink-0">
									<NavLink
										className="focus-visible:focus-outline inline-block rounded-0.5"
										href={link.href}
									>
										{/* <img
											alt=""
											className="size-6 text-icon-neutral transition hover:text-icon-brand"
											loading="lazy"
											src={link.icon}
										/> */}
										<Icon className="size-6 text-icon-neutral transition hover:text-icon-brand" />
										<span className="sr-only">{link.label}</span>
									</NavLink>
								</li>
							);
						})}
					</ul>
				</nav>
			</div>

			<div className="grid gap-y-8">
				<nav aria-label={t("navigation-secondary")}>
					<ul className="flex items-center gap-x-6 text-small text-text-weak" role="list">
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

				<small className="text-tiny text-text-weak">
					&copy; {new Date().getUTCFullYear()}{" "}
					<a
						className="focus-visible:focus-outline rounded-0.5 hover:underline"
						href={acdhLinks[locale].href}
					>
						Austrian Centre for Digital Humanities and Cultural Heritage
					</a>
				</small>
			</div>
		</footer>
	);
}
