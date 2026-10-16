# MonkStash Pay. Build from the repository root:
#   docker build -f apps/pay/Dockerfile -t monkstash-pay .
# Run (settings in a .env file, invoices and wallet state in a volume):
#   docker run -d --name monkstash-pay --env-file apps/pay/.env -v monkstash-pay-data:/data -p 127.0.0.1:8080:8080 monkstash-pay

FROM node:24.18.0-slim AS build
WORKDIR /src
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/wallet-core packages/wallet-core
COPY apps/pay apps/pay
RUN pnpm install --frozen-lockfile --filter @quietmint/pay... \
 && pnpm --filter @quietmint/pay build \
 && pnpm --filter @quietmint/pay deploy --prod --legacy /out \
 && cp -r apps/pay/dist /out/dist

FROM node:24.18.0-slim
ENV NODE_ENV=production PAY_DATA_DIR=/data PAY_HOST=0.0.0.0 PAY_PORT=8080
WORKDIR /app
COPY --from=build /out/node_modules ./node_modules
COPY --from=build /out/dist ./dist
COPY --from=build /out/package.json ./package.json
RUN mkdir -p /data && chown node:node /data
USER node
VOLUME ["/data"]
EXPOSE 8080
# The slim image has no curl, so the check uses node itself. GET / answers as soon as the HTTP
# server is up (the first wallet scan can take a while, hence the long start period).
HEALTHCHECK --interval=30s --timeout=5s --start-period=300s --retries=3 \
  CMD ["node", "-e", "require('http').get('http://127.0.0.1:'+(process.env.PAY_PORT||8080)+'/',(r)=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"]
CMD ["node", "dist/server.mjs"]
