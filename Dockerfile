# ============================================================
# Dockerfile — Next.js standalone server for ECS Fargate
# ============================================================
# Expects the Next.js standalone build to already be present at
# .next/standalone/ (produced by `npm run build` with output: 'standalone').
#
# CI workflow:
#   1. npm run build          → produces .next/standalone/
#   2. docker build ...       → copies standalone into image
#   3. docker push to ECR
#   4. aws ecs update-service
# ============================================================

FROM node:22-alpine AS runner

# Security: run as non-root
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# Next.js telemetry off in production containers
ENV NEXT_TELEMETRY_DISABLED=1

# Copy the standalone server output
# These paths assume `docker build` is run from the repo root
# after `npm run build`.
COPY --chown=nextjs:nodejs .next/standalone ./
COPY --chown=nextjs:nodejs .next/static     ./.next/static
COPY --chown=nextjs:nodejs public           ./public

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:3000/ | head -c1 || exit 1

CMD ["node", "server.js"]
