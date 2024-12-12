"use client";

import { cn } from "@acdh-oeaw/style-variants";
import { useTranslations } from "next-intl";
import { type ReactNode, useEffect, useTransition } from "react";
import { Button } from "react-aria-components";

import { MainContent } from "@/components/main-content";
import { useRouter } from "@/lib/i18n/navigation";

interface InternalErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

/** `React.lazy` requires default export. */
// eslint-disable-next-line import-x/no-default-export
export default function InternalError(props: Readonly<InternalErrorProps>): ReactNode {
	const { error, reset } = props;

	const t = useTranslations("Error");

	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<MainContent className="layout-grid bg-fill-weaker">
			<section className="grid place-content-center place-items-center gap-y-8 py-16 xs:py-24">
				<h1 className="text-balance text-center font-heading text-display font-strong text-text-strong">
					{t("something-went-wrong")}
				</h1>
				<Button
					className={cn(
						"inline-flex min-h-8 items-center rounded-2 border border-stroke-brand-strong bg-fill-brand-strong px-3 py-1 text-tiny font-strong text-text-inverse-strong shadow-raised",
						"interactive focus-visible:focus-outline hover:hover-overlay pressed:press-overlay",
					)}
					isPending={isPending}
					onPress={() => {
						startTransition(() => {
							router.refresh();
							reset();
						});
					}}
				>
					{t("try-again")}
				</Button>
			</section>
		</MainContent>
	);
}
