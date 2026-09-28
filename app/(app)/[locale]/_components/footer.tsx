import cn from "clsx/lite";
import { MailIcon } from "lucide-react";
import { getExtracted } from "next-intl/server";
import type { ComponentProps, ReactNode } from "react";

import { Image } from "#/components/image";
import { Link } from "#/components/link.tsx";
import funderLogo from "#/public/assets/images/logo-bmfwf.svg";
import logo from "#/public/assets/images/logo-clariah-with-text.svg";

interface FooterProps extends ComponentProps<"footer"> {}

export async function Footer(props: Readonly<FooterProps>): Promise<ReactNode> {
	const { className, ...rest } = props;

	const t = await getExtracted();

	/*const secondary: { home: NavigationLink; contact: NavigationMenu } = {
		home: {
			type: "link",
			label: t("navigation.items.home"),
			href: "/",
		},
		contact: {
			type: "menu",
			label: contact ? contact.label : "Contact Dariah",
		},
	};

	const oeawLinks = {
		de: { href: "https://www.oeaw.ac.at/" },
		en: { href: "https://www.oeaw.ac.at/en/" },
	};*/

	return (
		<footer {...rest} className={cn("z-9 p-12", className)}>
			<div className="flex flex-col gap-12 lg:flex-row justify-between px-8 py-4 sm:px-16">
				<section className={cn("flex flex-col gap-4 px-6", "lg:px-16")}>
					<h2 className="text-h4">CLARIAH-AT</h2>
					<Image alt="" width={200} src={logo} />
					<address className="not-italic">
						<strong>{t("Konsortiumssprecher")}</strong>
						<br />
						<span>Walter Scholger</span>
						<br />
						<Link className="gap-2" startIcon={<MailIcon />} href="mailto:office@clariah.at" variant="unstyled">
							office@clariah.at
						</Link>
					</address>
				</section>
				<section className={cn("flex flex-col gap-4 px-6", "lg:px-16")}>
					<h2 className="text-h4">Gefördert von</h2>
					<Image alt="" width={200} src={funderLogo} />
				</section>
			</div>
		</footer>
	);
}
