FROM oven/bun:1.3.14-slim

WORKDIR /app
COPY package.json bun.lock bunfig.toml tsconfig.base.json biome.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/cms/package.json apps/cms/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/contracts/package.json packages/contracts/package.json
RUN bun install --frozen-lockfile

COPY apps/api apps/api
COPY packages/contracts packages/contracts
RUN bun run --cwd apps/api build

EXPOSE 4000
CMD ["bun", "apps/api/src/server.ts"]
