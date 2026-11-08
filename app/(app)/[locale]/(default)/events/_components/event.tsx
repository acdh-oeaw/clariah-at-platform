import { useExtracted, useFormatter } from "next-intl";
import type { ReactNode } from "react";

import { DetailCard } from "#/app/(app)/[locale]/_components/detail-card.tsx";
import { ContentBlocks } from "#/components/content-blocks.tsx";
import type { Event as EventProps } from "#/lib/data/api-client.ts";

export function Event(props: EventProps): ReactNode {
	const { content, duration, image, title } = props;
	const t = useExtracted();
	const format = useFormatter();

	return (
		<DetailCard image={image} title={title}>
			<div className="flex flex-col-reverse gap-x-20 gap-y-8 lg:flex-row lg:items-start">
				<ContentBlocks blocks={content} className="flex-1 min-w-0 max-w-prose" />
				<div className="lg:sticky lg:top-8 lg:w-75 lg:shrink-0 lg:border-l-2 lg:ps-8 lg:border-primary-300">
					<dl className="flex flex-col gap-y-4">
						<div className="flex flex-col gap-1">
							<dt className="font-semibold">{t("Beginn")}</dt>
							<dd>{format.dateTime(new Date(duration.start), { dateStyle: "long" })}</dd>
						</div>
						{duration.end != null && (
							<div className="flex flex-col gap-1">
								<dt className="font-semibold">{t("Ende")}</dt>
								<dd>{format.dateTime(new Date(duration.end), { dateStyle: "long" })}</dd>
							</div>
						)}
					</dl>
				</div>
			</div>
		</DetailCard>
	);
}
