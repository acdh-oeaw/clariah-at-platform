# syntax=docker/dockerfile:1-labs

FROM oven/bun:1-alpine AS bun

FROM node:24-alpine AS base
# libc6-compat: sharp and other native addons expect glibc symbols musl doesn't provide.
RUN apk add --no-cache libc6-compat
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
# CI=true makes lefthook's postinstall skip itself (no .git in the build context).
ENV CI="true" \
	NEXT_TELEMETRY_DISABLED="1"

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Not corepack: reads the same `packageManager` field `pnpm/action-setup@v4` reads in CI.
RUN npm install -g "pnpm@$(node -p "require('./package.json').packageManager.replace(/^pnpm@/, '')")" \
	&& pnpm config set store-dir /pnpm/store
COPY patches ./patches
# --ignore-scripts skips the root "prepare" script (needs files not copied in yet, and would write a
# throwaway .env.local); `pnpm rebuild` reruns only what `pnpm-workspace.yaml`'s `allowBuilds` permits.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --ignore-scripts \
	&& pnpm rebuild @parcel/watcher @swc/core lefthook \
	&& ln -sf /usr/local/bin/bun node_modules/.bin/bun

FROM deps AS builder
WORKDIR /app
COPY . .

ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_API_OPENAPI_PATHNAME
ARG NEXT_PUBLIC_APP_BASE_URL
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
ENV BUILD_MODE="standalone"

RUN pnpm run types:prepare && pnpm run generate:openapi

# BuildKit secret, not ARG, so it never lands in `docker history`. required=false: build-deploy.yml doesn't
# supply it yet.
RUN --mount=type=secret,id=API_ACCESS_TOKEN,required=false \
	sh -c '\
	if [ -f /run/secrets/API_ACCESS_TOKEN ]; then \
	export API_ACCESS_TOKEN="$(cat /run/secrets/API_ACCESS_TOKEN)"; \
	fi; \
	pnpm run build \
	'

FROM node:24-alpine AS runner
WORKDIR /app

RUN apk add --no-cache libc6-compat

USER node

COPY --from=builder --chown=node:node /app/next.config.ts ./
COPY --from=builder --chown=node:node /app/public ./public
# standalone output traces node_modules but omits .next/static and public.
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

ENV NODE_ENV="production"

EXPOSE 3000

CMD ["node", "server.js"]
