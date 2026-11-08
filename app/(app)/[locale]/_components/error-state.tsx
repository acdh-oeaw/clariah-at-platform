"use client";

import { useExtracted, useLocale } from "next-intl";
import { Fragment, type ReactNode } from "react";

import { mainContentId } from "#/app/(app)/[locale]/_components/main.tsx";
import { StatusMessage, StatusState } from "#/app/(app)/_components/status-state.tsx";
import { getErrorDigest } from "#/app/(app)/_lib/get-error-digest.ts";
import { Button, buttonStyles } from "#/components/ui/button.tsx";
import { localePrefix } from "#/lib/i18n/routing.ts";

interface ErrorStateProps {
	children?: ReactNode;
	error: unknown;
}

/** Not the `retry` prop: it ended up in `global-error` with a closed connection, instead of showing the recovered page. */
function reload(): void {
	window.location.reload();
}

export function ErrorState(props: Readonly<ErrorStateProps>): ReactNode {
	const { children, error } = props;

	const t = useExtracted();
	const locale = useLocale();

	const title = t("Seite konnte nicht geladen werden");
	const digest = getErrorDigest(error);

	return (
		<Fragment>
			<title>{title}</title>
			<StatusState id={mainContentId}>
				{children}
				<StatusMessage
					codeLabel={digest != null ? t("Fehler {digest}", { digest }) : t("Fehler")}
					description={t(
						"Beim Laden dieser Seite ist ein Problem aufgetreten. Bitte versuchen Sie es in einem Moment noch einmal.",
					)}
					title={title}
				/>
				<div className="flex flex-wrap items-center gap-4">
					<Button onPress={reload} variant="outline">
						{t("Erneut versuchen")}
					</Button>
					{/* A plain link, because a client navigation can stay on the error page. */}
					<a className={buttonStyles({ variant: "outline" })} href={localePrefix.prefixes[locale]}>
						<span>{t("Zurück zur Startseite")}</span>
					</a>
				</div>
			</StatusState>
		</Fragment>
	);
}
