# ─── Base: shared Node + pnpm setup ─────────────────────────────────────────────
# One Dockerfile, three targets (development / builder / production).
# Why? A single file means dev, test and prod all build from the same
# dependency set — no drift between Dockerfile and Dockerfile.dev.
FROM node:24-alpine AS base
WORKDIR /app
RUN corepack enable

# ─── Development: hot-reload with `nest start --watch` ────────────────────────
# Compose mounts your source code over /app (bind mount), so edits on the host
# restart the server inside the container. node_modules is kept on an anonymous
# volume so the container's Linux binaries aren't overwritten by the host OS.
FROM base AS development
ENV NODE_ENV=development
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY prisma ./prisma
COPY prisma7.config.ts ./
# Generate once at build time so the image works even without a volume.
# At runtime the dev compose file re-runs it (cheap, keeps client in sync).
RUN pnpm prisma:generate
EXPOSE 3000
CMD ["pnpm", "start:dev"]

# ─── Builder: compile TypeScript → dist ───────────────────────────────────────
FROM base AS builder
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY prisma ./prisma
COPY src ./src
COPY tsconfig*.json nest-cli.json ./
COPY prisma7.config.ts ./
RUN pnpm prisma:generate
RUN pnpm build

# ─── Production: minimal runtime, non-root, migrations on boot ────────────────
FROM base AS production
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated/prisma ./src/generated/prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma7.config.ts ./prisma7.config.ts
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh \
  && addgroup -S appgroup && adduser -S appuser -G appgroup \
  && chown -R appuser:appgroup /app
USER appuser
EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
