import type { Metadata } from "next";
import { useExtracted } from "next-intl";
import { getExtracted, getFormatter } from "next-intl/server";
import { connection } from "next/server";
import { type ReactNode, Suspense } from "react";

import {
	SearchAnalytics,
	SearchAnalyticsSkeleton,
} from "#/app/(app)/[locale]/(default)/analytics/_components/search-analytics.tsx";
import {
	VisitsChart,
	VisitsChartSkeleton,
} from "#/app/(app)/[locale]/(default)/analytics/_components/visits-chart.tsx";
import { PageContent } from "#/app/(app)/[locale]/_components/page-content.tsx";
import { PageLayout } from "#/app/(app)/[locale]/_components/page-layout.tsx";
import { analyticsMonths, getMonthlyVisits } from "#/lib/data/analytics.ts";
import { createMetadata } from "#/lib/metadata.ts";

/** Not linked from anywhere, nor indexed: a url to hand to stakeholders, who need no matomo account to look it up. */
export async function generateMetadata(): Promise<Metadata> {
	const t = await getExtracted();

	return createMetadata({
		pathname: "/analytics",
		title: t("Statistik"),
		description: t("Besuche der CLARIAH-AT-Website pro Monat."),
		noindex: true,
	});
}

export default function AnalyticsPage(): ReactNode {
	const t = useExtracted();

	return (
		<PageLayout title={t("Statistik")}>
			<PageContent>
				<div className="flex flex-col gap-y-12 rounded-md bg-white px-6 py-8 shadow-card sm:p-10 lg:p-16">
					<p className="max-w-prose text-h3">
						{t("Besuche der CLARIAH-AT-Website in den vergangenen {count} Monaten, gezählt von Matomo.", {
							count: String(analyticsMonths),
						})}
					</p>
					<Suspense fallback={<AnalyticsSkeleton />}>
						<Analytics />
					</Suspense>
				</div>
			</PageContent>
		</PageLayout>
	);
}

function toDate(month: string): Date {
	const [year = 0, monthIndex = 1] = month.split("-").map(Number);

	return new Date(Date.UTC(year, monthIndex - 1, 1));
}

async function Analytics(): Promise<ReactNode> {
	await connection();

	const t = await getExtracted();
	const format = await getFormatter();
	const months = await getMonthlyVisits();

	if (months == null) {
		return <p data-analytics="">{t("Für diese Website ist keine Statistik eingerichtet.")}</p>;
	}

	/** Months are formatted in utc, since they are calendar months, not instants. */
	function formatMonth(month: string): string {
		return format.dateTime(toDate(month), { month: "long", year: "numeric", timeZone: "UTC" });
	}

	const hasUniqueVisitors = months.some((month) => month.uniqueVisitors != null);
	const hasSearches = months.some((month) => month.searches != null);
	/** The last month is the current one, still in progress, so the figures are for the one before. */
	const current = months.at(-1);
	const latest = months.at(-2);
	const previous = months.at(-3);

	function formatChange(value: number | null | undefined, previousValue: number | null | undefined): string | null {
		if (value == null || previousValue == null || previousValue === 0 || previous == null) {
			return null;
		}

		return t("{change} gegenüber {month}", {
			change: format.number(value / previousValue - 1, {
				style: "percent",
				signDisplay: "exceptZero",
				maximumFractionDigits: 0,
			}),
			month: formatMonth(previous.month),
		});
	}

	return (
		<div className="flex flex-col gap-y-16" data-analytics="">
			{latest != null ? (
				<dl className="grid gap-6 sm:grid-cols-2">
					<Figure
						change={formatChange(latest.visits, previous?.visits)}
						label={t("Besuche im {month}", { month: formatMonth(latest.month) })}
						value={format.number(latest.visits)}
					/>
					{hasUniqueVisitors && latest.uniqueVisitors != null ? (
						<Figure
							change={formatChange(latest.uniqueVisitors, previous?.uniqueVisitors)}
							label={t("Eindeutige Besucher:innen im {month}", { month: formatMonth(latest.month) })}
							value={format.number(latest.uniqueVisitors)}
						/>
					) : null}
				</dl>
			) : null}

			<section aria-labelledby="analytics-per-month" className="flex flex-col gap-y-8">
				<h2 className="text-h2" id="analytics-per-month">
					{t("Pro Monat")}
				</h2>
				<VisitsChart hasUniqueVisitors={hasUniqueVisitors} months={months} />
				<div className="overflow-x-auto">
					<table className="w-full text-start">
						<caption className="caption-bottom pt-3 text-start text-small">
							{current != null
								? t("Der {month} ist noch nicht abgeschlossen.", { month: formatMonth(current.month) })
								: null}
						</caption>
						<thead>
							<tr className="border-b-2 border-stroke-strong">
								<th className="py-3 pe-6 text-start" scope="col">
									{t("Monat")}
								</th>
								<th className="py-3 ps-6 text-end" scope="col">
									{t("Besuche")}
								</th>
								{hasUniqueVisitors ? (
									<th className="py-3 ps-6 text-end" scope="col">
										{t("Eindeutige Besucher:innen")}
									</th>
								) : null}
								{hasSearches ? (
									<th className="py-3 ps-6 text-end" scope="col">
										{t("Suchanfragen")}
									</th>
								) : null}
							</tr>
						</thead>
						<tbody>
							{months.toReversed().map((month) => (
								<tr key={month.month} className="border-b border-stroke-weak">
									<th className="py-3 pe-6 text-start font-regular" scope="row">
										{month === current
											? t("{month} (laufend)", { month: formatMonth(month.month) })
											: formatMonth(month.month)}
									</th>
									<td className="py-3 ps-6 text-end tabular-nums">{format.number(month.visits)}</td>
									{hasUniqueVisitors ? (
										<td className="py-3 ps-6 text-end tabular-nums">
											{month.uniqueVisitors != null ? format.number(month.uniqueVisitors) : t("k. A.")}
										</td>
									) : null}
									{hasSearches ? (
										<td className="py-3 ps-6 text-end tabular-nums">
											{month.searches != null ? format.number(month.searches) : t("k. A.")}
										</td>
									) : null}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>

			{/* Read separately, so the visits do not wait for it. */}
			<Suspense fallback={<SearchAnalyticsSkeleton />}>
				<SearchAnalytics />
			</Suspense>

			<section aria-labelledby="analytics-about" className="flex max-w-prose flex-col gap-y-4">
				<h2 className="text-h4" id="analytics-about">
					{t("Über diese Zahlen")}
				</h2>
				<p>
					{t(
						"Ein Besuch ist eine Folge von Seitenaufrufen ohne Pause von mehr als 30 Minuten. Die Website setzt keine Cookies, daher wird eine Person höchstens einen Tag lang an Browser und Netzwerk wiedererkannt: Wer an einem anderen Tag wiederkommt, zählt als weitere eindeutige Besucher:in. Eindeutige Besucher:innen pro Monat sind daher eine Obergrenze.",
					)}
				</p>
				{hasSearches ? (
					<p>
						{t(
							"Suchen sind jene in der Website-Suche und auf den Listenseiten. Sie werden gezählt, sobald nicht mehr getippt wird, und erst ab dem Monat, in dem sie zum ersten Mal erfasst wurden: Frühere Monate zeigen k. A.",
						)}
					</p>
				) : null}
				<p>{t("Die Zahlen werden stündlich aktualisiert.")}</p>
			</section>
		</div>
	);
}

interface FigureProps {
	label: string;
	value: string;
	change: string | null;
}

/** A headline figure: proportional digits, since it stands alone rather than in a column. */
function Figure(props: Readonly<FigureProps>): ReactNode {
	const { label, value, change } = props;

	return (
		<div className="flex flex-col gap-y-2 rounded-md bg-primary-100 p-8">
			<dt>{label}</dt>
			<dd className="order-first text-h1">{value}</dd>
			{change != null ? <dd className="text-small">{change}</dd> : null}
		</div>
	);
}

function AnalyticsSkeleton(): ReactNode {
	const t = useExtracted();

	return (
		<div aria-busy={true} aria-label={t("Statistik wird geladen …")} className="flex flex-col gap-y-16" role="status">
			<div className="grid gap-6 sm:grid-cols-2">
				<div className="h-36 animate-pulse rounded-md bg-primary-100" />
				<div className="h-36 animate-pulse rounded-md bg-primary-100" />
			</div>
			<VisitsChartSkeleton />
		</div>
	);
}
