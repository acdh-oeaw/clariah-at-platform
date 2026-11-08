"use client";

import { cn } from "@acdh-oeaw/style-variants";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { useExtracted } from "next-intl";
import type { ReactNode } from "react";

import { LinkButton } from "#/components/ui/button.tsx";

type PaginationItem = number | "ellipsis";

/**
 * Always keeps page 1, the last page, and a window of `siblingCount` pages around `currentPage`, collapsing any gap of
 * more than one hidden page into a single ellipsis. A gap of exactly one page shows that page instead: an ellipsis is
 * not shorter than the number it would replace.
 */
export function getPaginationRange(
	currentPage: number,
	totalPages: number,
	siblingCount = 1,
): ReadonlyArray<PaginationItem> {
	const alwaysShown = new Set<number>([1, totalPages, currentPage]);
	for (let offset = 1; offset <= siblingCount; offset++) {
		alwaysShown.add(currentPage - offset);
		alwaysShown.add(currentPage + offset);
	}

	const pages = [...alwaysShown].filter((page) => page >= 1 && page <= totalPages).toSorted((a, b) => a - b);

	const items: Array<PaginationItem> = [];
	for (const [index, page] of pages.entries()) {
		if (index > 0) {
			const previousPage = pages[index - 1];
			const gap = previousPage != null ? page - previousPage : 0;

			if (gap === 2) {
				items.push(page - 1);
			} else if (gap > 2) {
				items.push("ellipsis");
			}
		}

		items.push(page);
	}

	return items;
}

interface PaginationProps {
	label: string;
	page: number;
	totalPages: number;

	onChange: (page: number) => void;

	getHref: (page: number) => string;
	/** How many pages to show on each side of the current page. */
	siblingCount?: number;
}

/** `inline-flex` on the button itself, or its icons sit off-centre vertically. */
const pageButtonStyles = cn(
	"items-center justify-center rounded-sm border border-primary-1000 font-bold text-primary-1000 tabular-nums has-[svg]:inline-flex",
	"hover:bg-primary-100",
	"disabled:border-primary-1000 disabled:bg-primary-1000 disabled:text-white",
);

export function Pagination(props: Readonly<PaginationProps>): ReactNode {
	const { getHref, label, onChange, page, siblingCount = 1, totalPages } = props;
	const t = useExtracted();

	if (totalPages <= 1) {
		return null;
	}

	function renderLink(targetPage: number, label: ReactNode, ariaLabel?: string): ReactNode {
		const isCurrent = targetPage === page;

		return (
			<LinkButton
				aria-current={isCurrent ? "page" : undefined}
				aria-label={ariaLabel}
				className={pageButtonStyles}
				href={getHref(targetPage)}
				isDisabled={isCurrent}
				onPress={() => {
					onChange(targetPage);
				}}
				variant="unstyled"
			>
				{label}
			</LinkButton>
		);
	}

	const pageItems = getPaginationRange(page, totalPages, siblingCount);

	return (
		<nav aria-label={label}>
			<ul className="flex items-center gap-x-6 md:justify-end" role="list">
				{page > 1 ? (
					<li>
						{renderLink(
							page - 1,
							<ArrowLeftIcon aria-hidden="true" className="block-5 inline-5" />,
							t("Vorherige Seite"),
						)}
					</li>
				) : null}
				{pageItems.map((item, index) =>
					item === "ellipsis" ? (
						<li key={`ellipsis-${String(index)}`} aria-hidden="true" className="px-2 text-text-weak">
							…
						</li>
					) : (
						<li key={item}>{renderLink(item, String(item), t("Page {page}", { page: String(item) }))}</li>
					),
				)}
				{page < totalPages ? (
					<li>
						{renderLink(
							page + 1,
							<ArrowRightIcon aria-hidden="true" className="block-5 inline-5" />,
							t("Nächste Seite"),
						)}
					</li>
				) : null}
			</ul>
		</nav>
	);
}
