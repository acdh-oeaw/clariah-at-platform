import { useExtracted } from "next-intl";

/**
 * Named `use*`, not `get*`: it calls `useExtracted()` internally, and React Compiler decides whether a function may
 * call hooks — and whether it's safe to auto-memoize and sometimes skip re-invoking — from this naming convention
 * alone. A `get*` name told it this was a plain, skippable function; skipping it also skipped `useExtracted`'s own
 * internal hooks on that render, which is what was behind the "changed size between renders" / "fewer hooks than
 * expected" errors.
 */
export function useFacetLabel(): (status: string) => string {
	const t = useExtracted();
	return (value: string) => {
		switch (value) {
			case "go_digital_1_0": {
				return t("Go!Digital 1.0");
			}
			case "go_digital_2_0": {
				return t("Go!Digital 2.0");
			}
			case "go_digital_3_0": {
				return t("Go!Digital 3.0");
			}
			case "go_digital_next_generation": {
				return t("Go!digital Next Generation");
			}
			case "clariah_at_project_funding_2022": {
				return t("CLARIAH-AT Projektförderung 2022");
			}
			case "clariah_at_project_funding_2024": {
				return t("CLARIAH-AT Projektförderung 2024");
			}
			case "clariah_at_project_funding_2025": {
				return t("CLARIAH-AT Projektförderung 2025");
			}
			case "clariah_at_project_funding_2026": {
				return t("CLARIAH-AT Projektförderung 2026");
			}
			default: {
				return value;
			}
		}
	};
}
