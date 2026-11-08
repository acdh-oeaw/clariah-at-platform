import { NextResponse } from "next/server";

/**
 * Prerendered at build time, which is fine for liveness and readiness probes: the response is still served by the
 * running server. Intentionally does not check upstream services (API, Typesense), since an outage there would fail the
 * probe on every pod at once.
 */
export function GET(): NextResponse {
	return NextResponse.json({ message: "OK" });
}
