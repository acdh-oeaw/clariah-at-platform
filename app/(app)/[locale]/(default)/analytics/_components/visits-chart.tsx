import cn from "clsx/lite";
import { useExtracted, useFormatter } from "next-intl";
import type { ReactNode } from "react";

import type { MonthlyVisits } from "#/lib/data/analytics.ts";

interface VisitsChartProps {
	months: ReadonlyArray<MonthlyVisits>;
	/** Without unique visitors, the chart has a single series, and no legend. */
	hasUniqueVisitors: boolean;
}

/** Up to about this many gridlines above the baseline. */
const tickCount = 4;

/** Gridlines at round numbers - steps of 1, 2, 2.5 or 5 times a power of ten - from zero to above the maximum. */
function getTicks(max: number): Array<number> {
	if (max <= 0) {
		return [0, 1];
	}

	const rough = max / tickCount;
	const magnitude = 10 ** Math.floor(Math.log10(rough));
	const step = [1, 2, 2.5, 5, 10].map((factor) => factor * magnitude).find((value) => value >= rough) ?? rough;
	const top = Math.ceil(max / step) * step;

	return Array.from({ length: Math.round(top / step) + 1 }, (_, index) => index * step);
}

function toDate(month: string): Date {
	const [year = 0, monthIndex = 1] = month.split("-").map(Number);

	return new Date(Date.UTC(year, monthIndex - 1, 1));
}

/**
 * Visits and unique visitors per month, as columns side by side, from one baseline on one axis - both count visits, and
 * there are never more unique visitors than visits. The last month is the current one, still in progress, so its
 * columns are lighter.
 *
 * Rendered on the server, without javascript: a month's values show in a tooltip on hover. The chart is hidden from
 * assistive technology, since the table below it holds the same values, and every one of them.
 */
export function VisitsChart(props: Readonly<VisitsChartProps>): ReactNode {
	const { months, hasUniqueVisitors } = props;

	const t = useExtracted();
	const format = useFormatter();

	const ticks = getTicks(Math.max(...months.map((month) => month.visits)));
	const top = ticks.at(-1)!;

	function toPercent(value: number): string {
		return `${String((value / top) * 100)}%`;
	}

	/** Months are formatted in utc, since they are calendar months, not instants. */
	function formatMonth(month: string, style: "short" | "narrow"): string {
		return format.dateTime(toDate(month), { month: style, timeZone: "UTC" });
	}

	function formatMonthAndYear(month: string): string {
		return format.dateTime(toDate(month), { month: "long", year: "numeric", timeZone: "UTC" });
	}

	return (
		<div aria-hidden={true} className="flex flex-col gap-y-6">
			{hasUniqueVisitors ? (
				<ul className="flex flex-wrap gap-x-6 gap-y-2 text-small" role="list">
					<li className="flex items-center gap-x-2">
						<span className="size-3 rounded-xs bg-primary-1000" />
						{t("Besuche")}
					</li>
					<li className="flex items-center gap-x-2">
						<span className="size-3 rounded-xs bg-primary-500" />
						{t("Eindeutige Besucher:innen")}
					</li>
				</ul>
			) : null}

			<div className="grid grid-cols-[auto_1fr] gap-x-3">
				{/**
				 * The axis labels sit on their gridlines, positioned absolutely, so the column is as tall as the plot. The invisible
				 * copies give it the width of the widest label.
				 */}
				<div className="relative h-64 text-end text-small tabular-nums">
					{ticks.map((tick) => (
						<span key={tick} className="invisible block leading-none">
							{format.number(tick, { notation: "compact" })}
						</span>
					))}
					{ticks.map((tick) => (
						<span
							key={tick}
							className="absolute right-0 translate-y-1/2 leading-none"
							style={{ insetBlockEnd: toPercent(tick) }}
						>
							{format.number(tick, { notation: "compact" })}
						</span>
					))}
				</div>

				<div className="relative h-64">
					{ticks.map((tick) => (
						<span
							key={tick}
							className={cn("absolute inset-x-0 border-bs", tick === 0 ? "border-stroke-strong" : "border-stroke-weak")}
							style={{ insetBlockEnd: toPercent(tick) }}
						/>
					))}
					<div className="relative grid h-full auto-cols-fr grid-flow-col">
						{months.map((month, index) => {
							const isCurrent = index === months.length - 1;

							return (
								<div key={month.month} className="group relative flex items-end justify-center gap-0.5 px-0.5">
									<span
										className={cn("rounded-t-sm bg-primary-1000 inline-full max-inline-6", isCurrent && "opacity-40")}
										style={{ blockSize: toPercent(month.visits) }}
									/>
									{hasUniqueVisitors ? (
										<span
											className={cn("rounded-t-sm bg-primary-500 inline-full max-inline-6", isCurrent && "opacity-40")}
											style={{ blockSize: toPercent(month.uniqueVisitors ?? 0) }}
										/>
									) : null}
									<span className="pointer-events-none absolute inset-0 group-hover:bg-primary-1000/10" />
									<span
										className={cn(
											"pointer-events-none absolute inset-be-full z-10 mbe-2 hidden flex-col rounded-sm bg-black px-3 py-2 text-small whitespace-nowrap text-white group-hover:flex",
											index < months.length / 2 ? "inset-s-0" : "inset-e-0",
										)}
									>
										<span className="font-bold">
											{isCurrent
												? t("{month} (laufend)", { month: formatMonthAndYear(month.month) })
												: formatMonthAndYear(month.month)}
										</span>
										<span className="tabular-nums">
											{t("Besuche: {count}", { count: format.number(month.visits) })}
										</span>
										{hasUniqueVisitors && month.uniqueVisitors != null ? (
											<span className="tabular-nums">
												{t("Eindeutige Besucher:innen: {count}", { count: format.number(month.uniqueVisitors) })}
											</span>
										) : null}
									</span>
								</div>
							);
						})}
					</div>
				</div>

				{/* The month names, under their columns: a single letter on phones, where three would not fit twelve times. */}
				<div className="col-start-2 mt-2 grid auto-cols-fr grid-flow-col text-center text-small">
					{months.map((month, index) => {
						const isYearStart = index === 0 || month.month.endsWith("-01");

						return (
							<span key={month.month} className="flex flex-col">
								<span className="sm:hidden">{formatMonth(month.month, "narrow")}</span>
								<span className="max-sm:hidden">{formatMonth(month.month, "short")}</span>
								{isYearStart ? <span className="whitespace-nowrap">{month.month.slice(0, 4)}</span> : null}
							</span>
						);
					})}
				</div>
			</div>
		</div>
	);
}

export function VisitsChartSkeleton(): ReactNode {
	return <div className="h-80 animate-pulse rounded-md bg-primary-100" />;
}
