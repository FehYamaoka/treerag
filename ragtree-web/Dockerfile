FROM oven/bun:1 AS base
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY . .

# NEXT_PUBLIC_* vars must be present at build time to be inlined in the bundle
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN bun run build

EXPOSE 3000
CMD ["bun", "run", "start"]
