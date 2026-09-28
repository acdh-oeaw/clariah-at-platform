"use client";

import { MenuIcon, XIcon } from "lucide-react";
import { Fragment, type ReactNode, useState } from "react";

import { Image } from "#/components/image.tsx";
import { Link } from "#/components/link.tsx";
import { NavigationDesktop } from "#/components/navigation-desktop.tsx";
import { NavigationMobile } from "#/components/navigation-mobile.tsx";
import { IconButton } from "#/components/ui/icon-button.tsx";
import type { NavigationConfig, NavigationLink } from "#/lib/navigation/navigation.ts";
import logo from "#/public/assets/images/logo-clariah-with-text.svg";

interface NavigationProps {
	label: string;
	drawerCloseLabel: string;
	drawerOpenLabel: string;
	localeSwitcherLabel: string;
	navigation: NavigationConfig & { home: NavigationLink };
}

export function Navigation(props: Readonly<NavigationProps>): ReactNode {
	const { drawerCloseLabel, drawerOpenLabel, label, localeSwitcherLabel, navigation } = props;
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const handleMobileMenuToggle = (): void => {
		document.body.style.overflow = isMobileMenuOpen ? "" : "hidden";
		setIsMobileMenuOpen((prev) => !prev);
	};

	const { home, ...menuNavigation } = navigation;

	return (
		<Fragment>
			<nav aria-label={label} className="justify-between flex items-center">
				<Link
					className="py-0!"
					href={home.href}
					onClick={() => {
						if (isMobileMenuOpen) {
							handleMobileMenuToggle();
						}
					}}
				>
					<span className="sr-only">{home.label}</span>
					<Image
						alt=""
						className="w-35.5 xl:w-50 xl:h-15"
						decoding="auto"
						fetchPriority="high"
						loading="eager"
						preload={true}
						src={logo}
					/>
				</Link>

				<NavigationDesktop localeSwitcherLabel={localeSwitcherLabel} navigation={menuNavigation} />
				<IconButton
					className="-my-3 -ml-3 xl:hidden"
					label={isMobileMenuOpen ? drawerCloseLabel : drawerOpenLabel}
					onPress={handleMobileMenuToggle}
				>
					{isMobileMenuOpen ? (
						<XIcon aria-hidden={true} data-slot="icon" />
					) : (
						<MenuIcon aria-hidden={true} data-slot="icon" />
					)}
				</IconButton>
			</nav>

			{isMobileMenuOpen && (
				<NavigationMobile
					handleMobileMenuToggle={handleMobileMenuToggle}
					localeSwitcherLabel={localeSwitcherLabel}
					navigation={menuNavigation}
				/>
			)}
		</Fragment>
	);
}
