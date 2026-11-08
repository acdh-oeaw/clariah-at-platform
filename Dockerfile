# syntax=docker/dockerfile:1

FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches ./patches
# pnpm also installs the bun runtime pinned in `pnpm-lock.yaml` (`engines.runtime`).
# --ignore-scripts skips the root "prepare" script, which needs files not copied in yet.
RUN npm install -g "pnpm@$(node -p "require('./package.json').packageManager.replace(/^pnpm@/, '')")" \
	&& pnpm install --frozen-lockfile --ignore-scripts

FROM deps AS builder
COPY . .

ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_API_OPENAPI_PATHNAME
ARG NEXT_PUBLIC_APP_BASE_URL
ARG NEXT_PUBLIC_APP_BOTS
ARG NEXT_PUBLIC_APP_GOOGLE_SITE_VERIFICATION
ARG NEXT_PUBLIC_APP_IMPRINT_SERVICE_BASE_URL
ARG NEXT_PUBLIC_APP_MATOMO_BASE_URL
ARG NEXT_PUBLIC_APP_MATOMO_ID
ARG NEXT_PUBLIC_APP_SERVICE_ID
ARG NEXT_PUBLIC_TYPESENSE_HOST
ARG NEXT_PUBLIC_TYPESENSE_PORT
ARG NEXT_PUBLIC_TYPESENSE_PROTOCOL
ARG NEXT_PUBLIC_TYPESENSE_COLLECTION_NAME_RESOURCES
ARG NEXT_PUBLIC_TYPESENSE_COLLECTION_NAME_WEBSITE
ARG NEXT_PUBLIC_TYPESENSE_SEARCH_API_KEY
ENV BUILD_MODE="standalone" \
	NEXT_TELEMETRY_DISABLED="1"

RUN pnpm run types:prepare && pnpm run generate:openapi
# BuildKit secret, not ARG, so it never lands in `docker history`.
RUN --mount=type=secret,id=API_ACCESS_TOKEN,env=API_ACCESS_TOKEN,required=false \
	pnpm run build

FROM alpine:3.24 AS runner
WORKDIR /app

RUN apk add --no-cache libgcc libstdc++ \
	&& adduser -D -u 1000 bun
# Same bun binary the app was built with, so the version stays pinned by `pnpm-lock.yaml` alone.
COPY --from=builder /app/node_modules/bun/bun /usr/local/bin/bun

ENV NODE_ENV="production" \
	NEXT_TELEMETRY_DISABLED="1"

USER bun

# standalone output traces node_modules but omits .next/static and public.
COPY --from=builder --chown=bun:bun /app/.next/standalone ./
COPY --from=builder --chown=bun:bun /app/.next/static ./.next/static
COPY --from=builder --chown=bun:bun /app/public ./public

EXPOSE 3000

CMD ["bun", "server.js"]
