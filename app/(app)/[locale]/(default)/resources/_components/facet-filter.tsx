// Adapted from https://github.com/DARIAH-ERIC/dariah-campus/blob/main/app/(app)/(default)/search/_components/search-facet-filter.tsx
// Original reads its state from a shared search context; this one takes it as props instead, so it plugs into
// `SearchView`'s `renderFacets` render-prop (see `search-view.tsx`), which hands each field its own slice of state.

"use client";

import cn from "clsx/lite";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useExtracted, useFormatter } from "next-intl";
import { type ReactNode, useMemo, useState } from "react";
import { useCollator, useFilter } from "react-aria";
import {
	Autocomplete,
	Button,
	Dialog,
	DialogTrigger,
	Input,
	Label,
	ListBox,
	ListBoxItem,
	ListLayout,
	Popover,
	SearchField,
	Virtualizer,
} from "react-aria-components";

import { maxUnfilteredFacetValues } from "#/configs/search.config.ts";
import type { SearchFacetResult } from "#/lib/search/use-search.ts";

interface FacetItem {
	/** `undefined` while the count for a refinement restored from the url is not yet known. */
	count: number | undefined;
	value: string;
}

/** Measured from the rendered rows: a bare label, and a label above a description clamped to three lines. */
const rowSize = 32;
const estimatedRowSizeWithDescription = 72;
const rowGap = 2;

interface FilterableProps {
	children: ReactNode;
	isFilterable: boolean;
	renderFilter: () => ReactNode;
}

/**
 * Wraps the list in an autocomplete, whose filter input is only worth the space when the list is long enough to be
 * worth narrowing. Without it the list keeps real focus instead of the autocomplete's virtual focus.
 */
function Filterable(props: Readonly<FilterableProps>): ReactNode {
	const { children, isFilterable, renderFilter } = props;

	const { contains } = useFilter({ sensitivity: "base" });

	if (!isFilterable) {
		return children;
	}

	return (
		<Autocomplete filter={contains}>
			{renderFilter()}
			{children}
		</Autocomplete>
	);
}

interface SearchFacetFilterProps {
	/** The counts for this facet's values in the current result set. `undefined` before the first response arrives. */
	facet: SearchFacetResult | undefined;
	/** Optional supporting text per value, rendered under its label. Not matched against the filter input. */
	getDescription?: ((id: string) => string | undefined) | undefined;
	getLabel: (id: string) => string;
	/** True while a new response is in flight — a selected value not yet in `facet` shows no count instead of "0". */
	isLoading: boolean;
	label: string;
	onChange: (values: ReadonlyArray<string>) => void;
	selected: ReadonlyArray<string>;
}

export function SearchFacetFilter(props: Readonly<SearchFacetFilterProps>): ReactNode {
	const { facet, getDescription, getLabel, isLoading, label, onChange, selected } = props;

	const t = useExtracted();
	const format = useFormatter();
	const collator = useCollator({ sensitivity: "base", usage: "sort" });
	/**
	 * Selected values are pinned to the top, but only as of the moment the popover was opened, so the list does not
	 * reorder underneath the pointer or the keyboard cursor while values are being toggled.
	 */
	const [pinned, setPinned] = useState<ReadonlySet<string>>(new Set());
	const items = useMemo(() => {
		const itemsByValue = new Map<string, FacetItem>(
			(facet?.values ?? []).map((item) => [item.value, { count: item.count, value: item.value }] as const),
		);
		/** A refinement restored from the url may not occur in the current result set. */
		for (const value of selected) {
			if (!itemsByValue.has(value)) {
				itemsByValue.set(value, { count: isLoading ? undefined : 0, value });
			}
		}

		return Array.from(itemsByValue.values()).toSorted((a, b) => {
			const pinnedDifference = Number(pinned.has(b.value)) - Number(pinned.has(a.value));
			if (pinnedDifference !== 0) {
				return pinnedDifference;
			}

			const countDifference = (b.count ?? -1) - (a.count ?? -1);
			if (countDifference !== 0) {
				return countDifference;
			}

			return collator.compare(getLabel(a.value), getLabel(b.value));
		});
	}, [collator, facet, getLabel, isLoading, pinned, selected]);
	const isFilterable = items.length > maxUnfilteredFacetValues;
	/**
	 * Only the visible rows are mounted, because a facet can run to a few hundred values. Rows carrying a description
	 * vary in height and have to be measured, the rest are uniform and can be placed outright.
	 */
	const layoutOptions = useMemo(
		() =>
			getDescription == null
				? { rowSize, gap: rowGap }
				: { estimatedRowSize: estimatedRowSizeWithDescription, gap: rowGap },
		[getDescription],
	);

	return (
		<DialogTrigger
			onOpenChange={(isOpen) => {
				if (isOpen) {
					setPinned(new Set(selected));
				}
			}}
		>
			<Button
				className={cn(
					"flex items-center gap-x-2 rounded-full border px-4 py-2 text-small whitespace-nowrap transition",
					"focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-1000",
					selected.length > 0 ? "border-primary-1000" : "bg-white hover:border-black",
				)}
			>
				<span>{label}</span>
				{/**
				 * The badge keeps its space when there is nothing to count, so selecting a value does not resize the trigger and shove
				 * its neighbours along the row. `visibility: hidden` already hides it from assistive technology, `aria-hidden` says so
				 * outright.
				 */}
				<span
					aria-hidden={selected.length === 0 || undefined}
					className={cn(
						"rounded-full bg-primary-1000 px-1.5 text-center text-xs text-white tabular-nums min-inline-5",
						selected.length === 0 ? "invisible" : undefined,
					)}
				>
					{format.number(selected.length)}
				</span>
				<ChevronDownIcon aria-hidden={true} className="text-text-weak block-4 inline-4" />
			</Button>

			<Popover
				className={cn(
					"rounded-lg border bg-white shadow-lg outline-none inline-[min(100vw-2rem,20rem)]",
					"entering:animate-in entering:duration-150 entering:ease-out entering:fade-in",
					"exiting:animate-out exiting:duration-100 exiting:ease-in exiting:fade-out",
				)}
				placement="bottom start"
			>
				<Dialog aria-label={label} className="grid gap-y-2 p-2 outline-none">
					<Filterable
						isFilterable={isFilterable}
						renderFilter={() => (
							<SearchField autoFocus={true}>
								<Label className="sr-only">{t("Filter {label}", { label })}</Label>
								<Input
									className="rounded-md border border-stroke-weak px-3 py-1.5 text-small inline-full focus:outline-none focus-visible:outline-2 focus-visible:outline-primary-1000 focus-visible:outline-offset-2"
									placeholder={t("Filter…")}
								/>
							</SearchField>
						)}
					>
						<Virtualizer layout={ListLayout} layoutOptions={layoutOptions}>
							<ListBox
								aria-label={label}
								/** Without a filter input to hold it, focus belongs to the list itself. */
								autoFocus={!isFilterable}
								className="block overflow-y-auto outline-none max-block-72"
								/** Escape belongs to the popover here - without this it would clear the refinement instead of closing. */
								escapeKeyBehavior="none"
								items={items}
								onSelectionChange={(keys) => {
									onChange(keys === "all" ? items.map((item) => item.value) : (Array.from(keys) as Array<string>));
								}}
								renderEmptyState={() => (
									<div className="px-2 py-4 text-center text-small text-text-weak">{t("Keine Ergebnisse.")}</div>
								)}
								selectedKeys={new Set(selected)}
								selectionMode="multiple"
							>
								{(item: FacetItem) => (
									<ListBoxItem
										className="group flex cursor-pointer items-start gap-x-2 rounded-sm px-2 py-1.5 text-small outline-none hover:bg-primary-100 focus:bg-primary-100"
										id={item.value}
										textValue={getLabel(item.value)}
									>
										{({ isSelected }) => {
											const description = getDescription?.(item.value);

											return (
												<>
													<span className="pointer-events-none mbs-0.5 flex shrink-0 items-center justify-center self-start rounded-xs border border-stroke-weak block-4 inline-4 group-selected:border-primary-1000 group-selected:bg-primary-1000">
														{isSelected ? (
															<CheckIcon aria-hidden={true} className="text-white block-3 inline-3" />
														) : null}
													</span>
													<span className="grid grow gap-y-0.5">
														<span className="flex items-baseline gap-x-2">
															<span className="grow">{getLabel(item.value)}</span>
															{item.count === undefined ? null : (
																<span className="text-xs text-text-weak tabular-nums">{format.number(item.count)}</span>
															)}
														</span>
														{description == null || description === "" ? null : (
															<span className="line-clamp-3 text-xs text-text-weak">{description}</span>
														)}
													</span>
												</>
											);
										}}
									</ListBoxItem>
								)}
							</ListBox>
						</Virtualizer>
					</Filterable>
				</Dialog>
			</Popover>
		</DialogTrigger>
	);
}
