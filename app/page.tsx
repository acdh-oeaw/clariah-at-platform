import { defaultLocale } from "@/config/i18n.config";
import { redirect } from "@/lib/i18n/navigation";

/**
 * This page only renders when the app is built statically with `output: "export"`.
 */
export default function RootPage(): void {
	redirect({ href: "/", locale: defaultLocale });
}
