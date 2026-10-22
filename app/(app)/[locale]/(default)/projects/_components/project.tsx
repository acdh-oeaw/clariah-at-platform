import { useExtracted, useFormatter } from "next-intl";
import type { ReactNode } from "react";

import { useFacetLabel } from "#/app/(app)/[locale]/(default)/projects/_components/facet-labels";
import { ApiImage } from "#/components/api-image.tsx";
import { ContentBlocks } from "#/components/content-blocks.tsx";
import type { Project as ProjectProps } from "#/lib/data/api-client.ts";

export function Project(props: ProjectProps): ReactNode {
	const { call, description, image, name, duration, partners, affiliatedPersons } = props;
	const t = useExtracted();
	const format = useFormatter();
	const getLabel = useFacetLabel();

	return (
		<section className="container">
			<div className="rounded-md shadow-card flex flex-col md:mb-16 container bg-white max-w-7xl">
				{image && (
					<ApiImage
						className="rounded-t-md w-full max-h-100 object-cover"
						fetchPriority="high"
						image={image}
						loading="eager"
						preload={true}
					/>
				)}
				<div className="p-16">
					<h1 className="text-h1">{name}</h1>
					<div className="mt-8 flex flex-col-reverse gap-x-20 gap-y-8 lg:flex-row lg:items-start">
						<ContentBlocks blocks={description} className="flex-1 min-w-0 max-w-prose" />
						<div className="lg:sticky lg:top-8 lg:w-75 lg:shrink-0 lg:border-l-2 lg:ps-8 lg:border-primary-300">
							<dl className="flex flex-col gap-y-4">
								{partners.length > 0 && (
									<div className="flex flex-col gap-y-1">
										<dt className="font-semibold">{t("Beteiligte Organisationen")}</dt>
										{partners.map((partner) => (
											<dd key={partner.id}>{partner.name}</dd>
										))}
									</div>
								)}
								{affiliatedPersons.length > 0 && (
									<div className="flex flex-col gap-1">
										<dt className="font-semibold">{t("Beteiligte Personen")}</dt>
										{affiliatedPersons.map((person) => (
											<dd key={person.id}>{person.name}</dd>
										))}
									</div>
								)}
								<div className="flex flex-col gap-1">
									<dt className="font-semibold">{t("Beginn")}</dt>
									<dd>{format.dateTime(new Date(duration.start))}</dd>
								</div>
								{duration.end != null && (
									<div className="flex flex-col gap-1">
										<dt className="font-semibold">{t("Ende")}</dt>
										<dd>{format.dateTime(new Date(duration.end))}</dd>
									</div>
								)}
								{call?.call != null && (
									<div className="flex flex-col gap-1">
										<dt className="font-semibold">{t("Förderprogramm")}</dt>
										<dd>{getLabel(call.call)}</dd>
									</div>
								)}
							</dl>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
