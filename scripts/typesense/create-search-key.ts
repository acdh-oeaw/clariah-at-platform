import type Client from "typesense/lib/Typesense/Client";

import { searchKeySchema } from "@/lib/typesense/typesense-schema";

export async function createSearchKey(client: Client) {
	const res = await client.keys().create(searchKeySchema);
	return res.value;
}
