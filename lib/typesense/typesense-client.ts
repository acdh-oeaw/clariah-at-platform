import { type Client, Client as TypesenseClient } from "typesense";

import { env } from "@/config/env.config";

export const typesenseSettings = {
	connectionTimeoutSeconds: 10,
	nodes: [
		{
			host: env.NEXT_PUBLIC_TYPESENSE_HOST,
			port: env.NEXT_PUBLIC_TYPESENSE_PORT,
			protocol: env.NEXT_PUBLIC_TYPESENSE_PROTOCOL,
		},
	],
};

export function createTypesenseClient(
	apiKey: string = env.NEXT_PUBLIC_TYPESENSE_SEARCH_API_KEY,
): Client {
	return new TypesenseClient({ ...typesenseSettings, apiKey });
}
