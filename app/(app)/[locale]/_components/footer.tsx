import { assert } from "@acdh-oeaw/lib";
import cn from "clsx/lite";
import { ChevronRightIcon, MailIcon } from "lucide-react";
import { getExtracted, getLocale } from "next-intl/server";
import { type ComponentProps, Fragment, type ReactNode } from "react";

import { Image } from "#/components/image";
import { Link } from "#/components/link.tsx";
import { NavLink } from "#/components/nav-link";
import { LinkButton } from "#/components/ui/button";
import { cachedNavigation } from "#/lib/data/api-cache";
import { localizeHref } from "#/lib/navigation/convert";
import funderLogo from "#/public/assets/images/logo-bmfwf.svg";

interface FooterProps extends ComponentProps<"footer"> {}

export async function Footer(props: Readonly<FooterProps>): Promise<ReactNode> {
	const { className, ...rest } = props;
	const t = await getExtracted();
	const locale = await getLocale();
	const label = t("Weiter Informationen");

	const response = await cachedNavigation(locale);
	//const { primary } = navigation();
	const navigation = response.find((menu) => menu.name === "secondary");
	assert(navigation != null, "Missing primary navigation.");

	return (
		<footer {...rest} className={cn("z-9 p-12 text-primary-1000", className)}>
			<div className="flex flex-col gap-12 lg:flex-row px-8 py-4 sm:px-16">
				<section className="grid grid-cols-1 gap-y-8 lg:grid-cols-[2fr_1fr_1fr] justify-between">
					{/** <Image alt="" width={200} src={logo} />* */}
					<div>
						<nav aria-label={label}>
							<ul className="flex flex-wrap gap-x-16 gap-y-4">
								{navigation.items.map((item) => (
									<li key={item.id}>
										{item.children.length > 0 ? (
											<Fragment>
												<span className="font-heading font-bold">{item.label}</span>
												<ul className="list-none">
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
					<section className="flex flex-col gap-y-4">
						<h2 className="font-bold">{t("Mailingliste beitreten")}</h2>
						<p>
							{t(
								"Bleiben Sie auf dem Laufenden über Digital Humanities (DH) Aktivitäten in Österreich: Mitglieder der DHA-E-Mail-Liste erhalten nicht nur Informationen zu Events, open Calls und vielem mehr, sondern können auch selbst anstehende Aktivitäten aus der österreichischen DH Landschaft an Mitglieder der Liste versenden.",
							)}
						</p>
						<LinkButton variant="outline" className="text-primary-1000">
							{t("Digital Humanities Austria E-Mail-Liste")}
						</LinkButton>
					</section>
					<div className="lg:justify-self-end">
						<h2 className="font-bold">{t("Gefördert von")}</h2>
						<Image alt="" width={200} src={funderLogo} />
					</div>
				</section>
			</div>
		</footer>
	);
}
