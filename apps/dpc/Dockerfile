FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable


FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app
COPY . .
RUN pnpx turbo prune @seact/dpc --docker


FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app
# Install the dependencies
COPY --from=builder /app/out/full/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --no-frozen-lockfile
# Build the project
RUN pnpx turbo build --filter=@seact/dpc...


FROM base AS runner
WORKDIR /app
# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs
COPY --from=installer /app/apps/dpc/next.config.js .
COPY --from=installer /app/apps/dpc/package.json .
# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/dpc/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/dpc/.next/static ./apps/dpc/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/dpc/public ./apps/dpc/public


CMD node apps/dpc/server.js
