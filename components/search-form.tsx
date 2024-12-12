import type { ComponentPropsWithoutRef, ReactNode } from "react";

interface SearchFormProps extends ComponentPropsWithoutRef<"form"> {
	children: ReactNode;
	/** @default "search" */
	role?: "form" | "search";
}

export function SearchForm(props: Readonly<SearchFormProps>): ReactNode {
	const { children, role = "search", ...rest } = props;

	return (
		<form {...rest} role={role}>
			{children}
		</form>
	);
}
