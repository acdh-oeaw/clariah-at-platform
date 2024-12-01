import type { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

import { MetadataImage } from "@/components/metadata-image";
import type { Locale } from "@/config/i18n.config";

export const runtime = "edge";

// export const alt = ''

export const size = {
	width: 1200,
	height: 630,
};

interface OpenGraphImageProps {
	params: {
		locale: Locale;
	};
}

export default async function OpenGraphImage(
	props: Readonly<OpenGraphImageProps>,
): Promise<ImageResponse> {
	const { params } = props;

	const { locale } = params;
	const meta = await getTranslations({ locale, namespace: "metadata" });

	const title = meta("title");

	return MetadataImage({ locale, size, title });
}
