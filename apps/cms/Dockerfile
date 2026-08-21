FROM oven/bun:1.3.14-slim AS build

WORKDIR /app
COPY package.json bun.lock bunfig.toml tsconfig.base.json biome.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/cms/package.json apps/cms/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/contracts/package.json packages/contracts/package.json
RUN bun install --frozen-lockfile

COPY apps/cms apps/cms
COPY packages/contracts packages/contracts
ARG VITE_API_URL=http://localhost:4000
ARG VITE_ORGANIZATION=demo
ARG VITE_WEB_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ORGANIZATION=$VITE_ORGANIZATION
ENV VITE_WEB_URL=$VITE_WEB_URL
RUN bun run --cwd apps/cms build

FROM nginx:1.27-alpine
COPY --from=build /app/apps/cms/dist /usr/share/nginx/html
COPY apps/cms/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
