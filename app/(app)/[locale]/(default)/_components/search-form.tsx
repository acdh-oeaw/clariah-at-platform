"use client";

import { SearchIcon } from "lucide-react";
import { useExtracted } from "next-intl";
import { type ReactNode, useId } from "react";

import { Button } from "#/components/ui/button.tsx";

interface SearchFormProps {
	/** Accessible name for the search input. */
	label: string;
	/** Omit for a read-only input. */
	onChange?: (value: string) => void;
	onSubmit?: () => void;
	value: string;
}

export function SearchForm(props: Readonly<SearchFormProps>): ReactNode {
	const { label, onChange, onSubmit, value } = props;

	const t = useExtracted();
	const inputId = useId();

	return (
		<form
			className="flex flex-col gap-y-2"
			onSubmit={(event) => {
				event.preventDefault();
				onSubmit?.();
			}}
			role="search"
		>
			<label className="sr-only" htmlFor={inputId}>
				{label}
			</label>
			<div className="flex gap-x-2">
				<input
					className="min-w-0 flex-1 border rounded-md border-stroke-weak bg-white px-4 py-2.5 text-regular"
					id={inputId}
					name="q"
					onChange={(event) => {
						onChange?.(event.currentTarget.value);
					}}
					readOnly={onChange == null}
					type="search"
					value={value}
				/>
				<Button startIcon={<SearchIcon aria-hidden={true} />} type="submit" variant="outline">
					{t("Suchen")}
				</Button>
			</div>
		</form>
	);
}

interface SearchFallbackProps {
	label: string;
}

/**
 * Suspense fallback for a search. The search reads the url, which is unknown when the page is prerendered, so without
 * this the form would only appear after hydration. The input is read-only, because anything typed here would be lost
 * when the search replaces this fallback.
 *
 * Takes up at least a full viewport, like `DetailFallback`, so the footer stays below the fold.
 */
export function SearchFallback(props: Readonly<SearchFallbackProps>): ReactNode {
	const { label } = props;

	const t = useExtracted();

	return (
		<div className="flex min-block-svh flex-col gap-y-8">
			<SearchForm label={label} value="" />
			<div role="status">
				<span className="sr-only">{t("Wird geladen…")}</span>
			</div>
		</div>
	);
}
