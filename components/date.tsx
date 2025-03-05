import { format } from "date-fns";
import { de, enGB } from "date-fns/locale";
import type { ReactNode } from "react";

import type { Locale } from "@/config/i18n.config";

interface DateComponentProps {
	date: string;
	dateLocale: Locale;
}

const LOCALES = {
	de: de,
	en: enGB,
};

const FORMATS = {
	de: "d. MMMM yyyy",
	en: "d MMMM yyyy",
};

export function DateComponent(props: DateComponentProps): ReactNode {
	const { date, dateLocale } = props;
	return <>{format(new Date(date), FORMATS[dateLocale], { locale: LOCALES[dateLocale] })}</>;
}
