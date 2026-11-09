import { Fragment, type ReactNode } from "react";

import { env } from "#/configs/env.config.ts";

/**
 * Api images are requested from the api, which redirects to imgproxy: both connections are opened before the first
 * image is found, which on search pages is only after the search request has finished.
 *
 * No `crossOrigin`: images are requested without cors, and a connection is only reused for the same cors mode.
 */
export function ImagePreconnect(): ReactNode {
	return (
		<Fragment>
			<link href={env.NEXT_PUBLIC_API_BASE_URL} rel="preconnect" />
			{env.NEXT_PUBLIC_IMGPROXY_BASE_URL != null ? (
				<link href={env.NEXT_PUBLIC_IMGPROXY_BASE_URL} rel="preconnect" />
			) : null}
		</Fragment>
	);
}

/**
 * For pages which search on the client. Render it outside the search's `Suspense` boundary, so it is part of the
 * prerendered html.
 *
 * `crossOrigin`: search requests are cors requests without credentials.
 */
export function SearchPreconnect(): ReactNode {
	const { NEXT_PUBLIC_TYPESENSE_HOST: host, NEXT_PUBLIC_TYPESENSE_PORT: port } = env;
	/** `URL` drops the port when it is the protocol's default. */
	const origin = new URL(`${env.NEXT_PUBLIC_TYPESENSE_PROTOCOL}://${host}:${String(port)}`).origin;

	return <link crossOrigin="anonymous" href={origin} rel="preconnect" />;
}
