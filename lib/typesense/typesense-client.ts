import { Client } from "typesense";

import { env } from "@/config/env.config";

export const typesenseSettings = {
	apiKey: env.NEXT_PUBLIC_TYPESENSE_SEARCH_API_KEY,
	connectionTimeoutSeconds: 10,
	nodes: [
		{
			host: env.NEXT_PUBLIC_TYPESENSE_HOST,
			port: env.NEXT_PUBLIC_TYPESENSE_PORT,
			protocol: env.NEXT_PUBLIC_TYPESENSE_PROTOCOL,
		},
	],
};

export const client = new Client(typesenseSettings);
