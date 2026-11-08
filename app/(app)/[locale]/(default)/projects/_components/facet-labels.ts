import { useExtracted } from "next-intl";

/** Named `use*`, because it calls `useExtracted()`: React Compiler may skip calling a `get*` function. */
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
			case "dh_long_term_projects_cultural_heritage": {
				return t("DH Langzeitprojekte zum kulturellen Erbe");
			}
			case "other": {
				return t("Sonstiges");
			}
			default: {
				return value;
			}
		}
	};
}
