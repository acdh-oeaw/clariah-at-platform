import { createUrl } from "@acdh-oeaw/lib";
import { OTLPHttpJsonTraceExporter, registerOTel } from "@vercel/otel";

import { env } from "@/config/env.config";

export function register() {
	if (env.OPENTELEMETRY_COLLECTOR_URL != null && env.OPENTELEMETRY_SERVICE_NAME != null) {
		const traceEndpoint = createUrl({
			baseUrl: env.OPENTELEMETRY_COLLECTOR_URL,
			pathname: "/v1/traces",
		});

		registerOTel({
			serviceName: env.OPENTELEMETRY_SERVICE_NAME,
			traceExporter: new OTLPHttpJsonTraceExporter({
				url: String(traceEndpoint),
			}),
		});
	}
}
