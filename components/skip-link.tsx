"use client";

import type { ReactNode } from "react";

import { Link } from "@/components/link";
import { createHref } from "@/lib/create-href";

interface SkipLinkProps {
	children: ReactNode;
	id?: string;
	targetId: string;
}

export function SkipLink(props: Readonly<SkipLinkProps>): ReactNode {
	const { children, id, targetId } = props;

	/**
	 * @see https://bugzilla.mozilla.org/show_bug.cgi?id=308064
	 */
	function onPress() {
		document.getElementById(targetId)?.focus();
	}

	return (
		<Link
			className="focus-visible:focus-outline fixed z-50 m-1 translate-y-[calc(-100%-0.25rem)] rounded bg-background-inverse px-4 py-3 text-text-inverse-strong transition focus-visible:translate-y-0"
			href={createHref({ hash: targetId })}
			id={id}
			onPress={onPress}
		>
			{children}
		</Link>
	);
}
