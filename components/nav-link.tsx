"use client";

import { type ComponentPropsWithRef, type ReactNode, Suspense } from "react";

import { Link } from "#/components/link.tsx";
import { useNavLink } from "#/lib/navigation/use-nav-link.ts";

interface NavLinkProps extends ComponentPropsWithRef<typeof Link> {}

function CurrentPageLink(props: Readonly<NavLinkProps>): ReactNode {
	const { children, ...rest } = props;

	const navLinkProps = useNavLink(rest);

	return (
		<Link {...rest} {...navLinkProps}>
			{children}
		</Link>
	);
}

/**
 * The pathname suspends on routes with a param missing from `generateStaticParams`. These links are part of the header
 * and footer, so without a boundary here such a route would lose its whole shell. The shell holds a plain link instead,
 * and `aria-current` follows once the pathname is known.
 */
export function NavLink(props: Readonly<NavLinkProps>): ReactNode {
	return (
		<Suspense fallback={<Link {...props} />}>
			<CurrentPageLink {...props} />
		</Suspense>
	);
}
