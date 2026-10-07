import cn from "clsx/lite";
import { CalendarDaysIcon } from "lucide-react";
import { useFormatter } from "next-intl";
import type { ReactNode } from "react";

import { ApiImage } from "#/components/image.tsx";
import { Link } from "#/components/link.tsx";
import type { ImageAsset } from "#/lib/images/variants.ts";

/** Event dates are stored as UTC timestamps, so they are formatted in UTC, not in the viewer's time zone. */
const timeZone = "UTC";

const inlineDateFormat = { weekday: "short", day: "numeric", month: "short", timeZone } as const;

/** The UTC calendar day, e.g. `2026-10-06`, which sorts and compares as a string. */
function toDay(date: Date): string {
	return date.toISOString().slice(0, 10);
}

/** The UTC calendar month, e.g. `2026-10`. */
function toMonth(date: Date): string {
	return date.toISOString().slice(0, 7);
}

interface CardProps {
	duration: {
		start?: number | null;
		end?: number | null;
	};
	image: ImageAsset | null;
	title: string;
	summary: string | null;
	link?: string;
	/** 4 when the card sits below a group heading, e.g. a year. */
	headingLevel?: 3 | 4;
}

export function EventCard(props: CardProps): ReactNode {
	const { duration, image, headingLevel = 3, link, title, summary } = props;

	const Heading = headingLevel === 4 ? "h4" : "h3";

	const format = useFormatter();

	const start = duration.start != null ? new Date(duration.start) : null;
	const end = duration.end != null ? new Date(duration.end) : null;
	/** Single-day events, and ones with a missing or inconsistent end, show only the start. */
	const shownEnd = start != null && end != null && toDay(end) > toDay(start) ? end : null;
	/** A range within one month shows the month once, below both days, instead of under each. */
	const isSameMonth = start != null && shownEnd != null && toMonth(start) === toMonth(shownEnd);

	function renderMonth(date: Date): ReactNode {
		return <span className="text-lg">{format.dateTime(date, { month: "short", timeZone })}</span>;
	}

	/**
	 * Weekday, day and month sit in the shared rows of the surrounding grid (via `subgrid`), so the dash between two
	 * dates can be placed in the day row and lines up with the day numbers.
	 */
	function renderDate(date: Date, className: string): ReactNode {
		return (
			<time
				className={cn(
					"row-start-1 grid grid-rows-subgrid justify-items-center",
					isSameMonth ? "row-span-2" : "row-span-3",
					className,
				)}
				dateTime={toDay(date)}
			>
				<span className="text-lg">{format.dateTime(date, { weekday: "short", timeZone })}</span>
				<span className="text-2xl">{format.dateTime(date, { day: "numeric", timeZone })}</span>
				{isSameMonth ? null : renderMonth(date)}
			</time>
		);
	}

	return (
		<article className="flex h-full flex-col overflow-hidden rounded-md bg-white shadow-card sm:flex-row sm:items-center">
			{/* Narrow screens get a one-line date above the title; from `sm` up, a calendar sheet beside it. */}
			<div className="flex min-w-0 flex-1 flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:gap-8 sm:p-8">
				{start != null ? (
					// E.g. "Di., 6. – Do., 8. Okt." — `dateTimeRange` drops the repeated month.
					<time className="text-lg text-text-weak tabular-nums sm:hidden" dateTime={toDay(start)}>
						{shownEnd != null
							? format.dateTimeRange(start, shownEnd, inlineDateFormat)
							: format.dateTime(start, inlineDateFormat)}
					</time>
				) : null}
				{start != null ? (
					<div
						className={cn(
							"hidden shrink-0 grid-rows-[repeat(3,auto)] items-center tabular-nums sm:grid",
							// A range sizes each date to its content, so two dates take little more room than one.
							shownEnd != null ? "grid-cols-[minmax(3rem,auto)_auto_minmax(3rem,auto)] gap-x-1" : "grid-cols-[5rem]",
						)}
					>
						{renderDate(start, "col-start-1")}
						{shownEnd != null ? (
							<>
								<span aria-hidden={true} className="col-start-2 row-start-2 text-2xl">
									–
								</span>
								{renderDate(shownEnd, "col-start-3")}
							</>
						) : null}
						{isSameMonth ? (
							<div className="col-span-full row-start-3 justify-self-center">{renderMonth(start)}</div>
						) : null}
					</div>
				) : null}
				{/* `min-w-0`: lets a long title wrap instead of overflowing the card. */}
				<div className="flex min-w-0 flex-col gap-y-2">
					<Heading className="text-h3 font-strong text-pretty wrap-break-word hyphens-auto text-text-strong sm:py-3">
						{link != null && link !== "" ? <Link href={link}>{title}</Link> : title}
					</Heading>
					{summary != null && summary !== "" ? <p className="line-clamp-3 text-text-weak">{summary}</p> : null}
				</div>
			</div>
			{/*
			 * The box sets the size, never the image: it fills the box and is cropped to it (`fill` + `object-cover`), so every
			 * card is the same shape whatever the source's dimensions. A banner on top on narrow screens, a thumbnail on the
			 * right from `sm` up. Kept, as a placeholder, for events without an image, so titles still line up across cards.
			 */}
			<div
				className={cn(
					"relative order-first aspect-video shrink-0 overflow-hidden bg-primary-200 inline-full",
					"sm:order-last sm:me-8 sm:aspect-4/3 sm:inline-48",
				)}
			>
				{image != null ? (
					<ApiImage alt="" className="object-cover" fill={true} image={image} sizes="(min-width: 40rem) 12rem, 100vw" />
				) : (
					<CalendarDaysIcon
						aria-hidden={true}
						className="absolute top-1/2 left-1/2 size-10 -translate-1/2 text-primary-1000 opacity-40"
					/>
				)}
			</div>
		</article>
	);
}
