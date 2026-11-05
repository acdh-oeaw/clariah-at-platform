"use client";

import cn from "clsx/lite";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { linkStyles } from "#/components/link";
import type { RichTextHeading } from "#/lib/rich-text.ts";

interface TableOfContentsListProps {
	headings: ReadonlyArray<RichTextHeading>;
}

/** Indents a subsection's entry under its section's. */
const indentClassName: Record<number, string> = {
	2: "",
	3: "ps-4",
};

/** A section counts as current once its heading has scrolled above this fraction of the viewport's height. */
const activationLine = 0.25;

/** Input which scrolls the page by hand, as opposed to the jump to an entry's heading. */
const userScrollEvents = ["keydown", "pointerdown", "touchmove", "wheel"] as const;

/**
 * The last heading above the activation line, i.e. the section being read. At the very bottom of the page the last
 * sections may be too short for their headings to ever reach the line, so the last entry wins there.
 */
function getActiveId(ids: ReadonlyArray<string>): string | null {
	const root = document.documentElement;
	if (window.innerHeight + window.scrollY >= root.scrollHeight - 1) {
		return ids.at(-1) ?? null;
	}

	const threshold = window.innerHeight * activationLine;
	let activeId: string | null = null;

	for (const id of ids) {
		const element = document.getElementById(id);
		if (element == null) {
			continue;
		}
		if (element.getBoundingClientRect().top > threshold) {
			break;
		}
		activeId = id;
	}

	return activeId;
}

export function TableOfContentsList(props: Readonly<TableOfContentsListProps>): ReactNode {
	const { headings } = props;

	const [activeId, setActiveId] = useState<string | null>(null);
	/**
	 * The entry just navigated to, which stays current until the page is scrolled by hand. Jumping to a heading leaves it
	 * at the top of the viewport, where a short section lets the next heading cross the activation line as well - and
	 * near the end of the page the heading cannot reach the top at all, so the bottom-of-page rule would pick the last
	 * entry.
	 */
	const pinnedIdRef = useRef<string | null>(null);

	useEffect(() => {
		const ids = headings.map((heading) => heading.id);
		/** Recomputed at most once per frame, however many scroll events arrive in between. */
		let frame = 0;

		function update(): void {
			frame = 0;
			setActiveId(pinnedIdRef.current ?? getActiveId(ids));
		}

		function schedule(): void {
			if (frame === 0) {
				frame = requestAnimationFrame(update);
			}
		}

		function unpin(): void {
			pinnedIdRef.current = null;
		}

		/** A page opened at one of the headings, e.g. from a shared link, starts out pinned to it like a click would. */
		const hashId = decodeURIComponent(window.location.hash.slice(1));
		if (ids.includes(hashId)) {
			pinnedIdRef.current = hashId;
		}

		update();
		window.addEventListener("scroll", schedule, { passive: true });
		window.addEventListener("resize", schedule, { passive: true });
		for (const type of userScrollEvents) {
			window.addEventListener(type, unpin, { passive: true });
		}

		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener("scroll", schedule);
			window.removeEventListener("resize", schedule);
			for (const type of userScrollEvents) {
				window.removeEventListener(type, unpin);
			}
		};
	}, [headings]);

	return (
		<ul>
			{headings.map((heading) => {
				const isActive = heading.id === activeId;

				return (
					<li className={indentClassName[heading.level]} key={heading.id}>
						{/**
						 * A plain anchor, not `Link`: `next/link` treats a second click on the hash the url already has as a navigation to the
						 * same url and does not scroll again, while the browser always jumps to the heading.
						 */}
						<a
							aria-current={isActive ? "location" : undefined}
							// `block`, so the padding spaces the entries apart - on an inline anchor it takes up no room. `py-1!`
							// overrides the variant's own `py-2`, which spaced them too far apart.
							className={linkStyles({ className: "block py-1!", variant: "primary" })}
							href={`#${heading.id}`}
							onClick={() => {
								pinnedIdRef.current = heading.id;
								setActiveId(heading.id);
							}}
						>
							{/**
							 * No hidden bold copy reserving the bold width: in the narrow sidebar column, an entry which only just fits on one line
							 * wraps onto two in bold, so the reserved copy left an empty line under it at all times. Only the current entry may
							 * re-wrap now, and only while it is current.
							 */}
							<span className={cn(isActive && "font-bold")}>{heading.text}</span>
						</a>
					</li>
				);
			})}
		</ul>
	);
}
