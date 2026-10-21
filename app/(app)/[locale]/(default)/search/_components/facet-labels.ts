import { useExtracted } from "next-intl";

export function useFacetLabel(): (status: string) => string {
	const t = useExtracted();
	return (value: string) => {
		switch (value) {
			case "project": {
				return t("Projekt");
			}
			case "news-item": {
				return t("News");
			}
			case "event": {
				return t("Event");
			}
			case "page": {
				return t("Seite");
			}
			case "publication": {
				return t("Publikation");
			}
			case "software": {
				return t("Software");
			}
			case "service": {
				return t("Service");
			}
			case "training-material": {
				return t("Training Material");
			}
			// No nicer label for a value outside the known vocabulary yet — fall back to the raw indexed value.
			default: {
				return value;
			}
		}
	};
}
