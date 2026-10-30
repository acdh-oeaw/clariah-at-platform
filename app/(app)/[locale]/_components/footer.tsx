import { assert } from "@acdh-oeaw/lib";
import cn from "clsx/lite";
import { ChevronRightIcon, MailIcon } from "lucide-react";
import { getExtracted, getLocale } from "next-intl/server";
import { type ComponentProps, Fragment, type ReactNode } from "react";

import { pageColumnClassName } from "#/app/(app)/[locale]/_components/page-column";
import { Image } from "#/components/image";
import { Link } from "#/components/link.tsx";
import { NavLink } from "#/components/nav-link";
import { LinkButton } from "#/components/ui/button";
import { cachedNavigation } from "#/lib/data/api-cache";
import { localizeHref } from "#/lib/navigation/convert";
import funderLogoDE from "#/public/assets/images/BMFWF_Logo_srgb.svg";
import logo from "#/public/assets/images/CLARIAH-AT_Logo_long_white.svg";
import funderLogo from "#/public/assets/images/logo-bmfwf.svg";

interface FooterProps extends ComponentProps<"footer"> {}

export async function Footer(props: Readonly<FooterProps>): Promise<ReactNode> {
	const { className, ...rest } = props;
	const t = await getExtracted();
	const locale = await getLocale();
	const label = t("Weitere Informationen");
	const funderImage = locale === "de-AT" ? funderLogoDE : funderLogo;

	const response = await cachedNavigation(locale);
	//const { primary } = navigation();
	const navigation = response.find((menu) => menu.name === "secondary");
	assert(navigation != null, "Missing primary navigation.");

	return (
		<footer {...rest} className={cn("z-9", className)}>
			<div className={"flex flex-col"}>
				<section className="bg-primary-1000 py-12 text-white">
					<div className={cn(pageColumnClassName, "flex flex-col gap-y-4")}>
						<Image alt="" width={200} src={logo} className="pb-4" />
						<h2 className="font-bold">{t("Mailingliste beitreten")}</h2>
						<LinkButton variant="outline-white" href="mailto:dha-join@lists.oeaw.ac.at?subject=DHA list subscription">
							{t("Digital Humanities Austria E-Mail-Liste")}
						</LinkButton>
					</div>
				</section>
				<section>
					<div
						className={cn(pageColumnClassName, "grid grid-cols-1 justify-between gap-y-8 py-12 lg:grid-cols-[2fr_1fr]")}
					>
						<div>
							<nav aria-label={label}>
								<ul className="flex flex-wrap gap-x-16 gap-y-8">
									{navigation.items.map((item) => (
										<li key={item.id}>
											{item.children.length > 0 ? (
												<Fragment>
													<span className="font-heading font-bold">{item.label}</span>
													<ul className="list-none pt-2">
														{item.children.map((child) => (
															<li key={child.id}>
																{child.href != null && (
																	<Link
																		className="flex [&_span]:items-center [&_span]:gap-x-1 [&_span]:inline-flex"
																		href={child.href.startsWith("/") ? localizeHref(child.href, locale) : child.href}
																	>
																		{child.href.startsWith("mailto:") ? (
																			<MailIcon aria-hidden={true} className="size-4" />
																		) : undefined}
																		{child.label}
																		{<ChevronRightIcon className="size-4" />}
																	</Link>
																)}
															</li>
														))}
													</ul>
												</Fragment>
											) : (
												<NavLink>{item.label}</NavLink>
											)}
										</li>
									))}
								</ul>
							</nav>
						</div>
						<div className="lg:justify-self-end">
							<h2 className="font-bold">{t("Gefördert von")}</h2>
							<span className="sr-only">{t("Bundesministerium für Frauen, Wissenschaft und Forschung")}</span>
							<Image alt="" width={200} src={funderImage} className="pt-2" />
						</div>
					</div>
				</section>
			</div>
		</footer>
	);
}
