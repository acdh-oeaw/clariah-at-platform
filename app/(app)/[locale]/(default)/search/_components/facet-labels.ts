import { useExtracted } from "next-intl";

export function getFacetLabel(): (status: string) => string {
	const t = useExtracted();
	let label: string;
	return (value: string) => {
		switch (value) {
			case "project": {
				label = t("Projekt");
				break;
			}
			case "news-item": {
				label = t("News");
				break;
			}
			case "event": {
				label = t("Event");
				break;
			}
			case "page": {
				label = t("Seite");
				break;
			}
			case "publication": {
				label = t("Publikation");
				break;
			}
			case "software": {
				label = t("Software");
				break;
			}
			case "service": {
				label = t("Service");
				break;
			}
			case "training-material": {
				label = t("Training Material");
				break;
			}
		}
		return label;
	};
}
