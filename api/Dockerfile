FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY pnpm-workspace.yaml ./
COPY api/package.json api/pnpm-lock.yaml ./
RUN pnpm install

COPY api/ .
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
