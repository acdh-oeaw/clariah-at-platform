"use client";

import cn from "clsx/lite";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { linkStyles } from "#/components/link.tsx";
import type { RichTextHeading } from "#/lib/rich-text.ts";

interface TableOfContentsListProps {
	headings: ReadonlyArray<RichTextHeading>;
}

/** Indents a subsection's entry under its section's. */
const indentClassName: Record<number, string> = {
	2: "ps-8",
	3: "ps-12",
};

const activeClassName = cn(
	"before:absolute before:inset-y-0 before:-inset-s-0.5 before:bg-primary-1000 before:inline-0.5",
	"before:forced-color-adjust-none forced-colors:before:bg-[Highlight]",
);

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
		const element = document.querySelector(`#${id}`);
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
	/** The pending animation frame, `0` when none is: the active entry is recomputed at most once per frame. */
	const frameRef = useRef(0);

	useEffect(() => {
		const ids = headings.map((heading) => heading.id);
		function update(): void {
			frameRef.current = 0;
			setActiveId(pinnedIdRef.current ?? getActiveId(ids));
		}

		function schedule(): void {
			if (frameRef.current === 0) {
				frameRef.current = requestAnimationFrame(update);
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
			cancelAnimationFrame(frameRef.current);
			frameRef.current = 0;
			window.removeEventListener("scroll", schedule);
			window.removeEventListener("resize", schedule);
			for (const type of userScrollEvents) {
				window.removeEventListener(type, unpin);
			}
		};
	}, [headings]);

	return (
		<ul className="border-s-2 border-primary-300">
			{headings.map((heading) => {
				const isActive = heading.id === activeId;

				return (
					<li key={heading.id}>
						{/**
						 * A plain anchor, not `Link`: `next/link` treats a second click on the hash the url already has as a navigation to the
						 * same url and does not scroll again, while the browser always jumps to the heading.
						 */}
						<a
							aria-current={isActive ? "location" : undefined}
							className={linkStyles({
								className: cn("relative py-1", indentClassName[heading.level], isActive && activeClassName),
								variant: "block",
							})}
							href={`#${heading.id}`}
							onClick={() => {
								pinnedIdRef.current = heading.id;
								setActiveId(heading.id);
							}}
						>
							{heading.text}
						</a>
					</li>
				);
			})}
		</ul>
	);
}
