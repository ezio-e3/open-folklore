# Multi-stage build -> single deployable unit (docs/phase6-design.md §1, §9).
# Stage 1: build the shared types package
FROM node:20-slim AS shared-build
WORKDIR /app
COPY package.json ./
COPY shared/package.json shared/
RUN npm install --workspace=shared --no-audit --no-fund
COPY shared shared
RUN npm run build --workspace=shared

# Stage 2: build the React client
FROM node:20-slim AS client-build
WORKDIR /app
COPY package.json ./
COPY client/package.json client/
COPY shared/package.json shared/
RUN npm install --workspace=client --workspace=shared --no-audit --no-fund
COPY --from=shared-build /app/shared shared
COPY client client
RUN npm run build --workspace=client

# Stage 3: build the Express server
FROM node:20-slim AS server-build
# node:20-slim doesn't ship OpenSSL, and Prisma's query engine needs to detect
# it to pick the right binary — without this, generate/migrate emit a warning
# and silently guess a version, which risks a runtime failure rather than a
# build-time one. Found by actually running the built image, not by inspection
# (docs/phase9-technical-debt.md D2).
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json ./
COPY server/package.json server/
COPY shared/package.json shared/
RUN npm install --workspace=server --workspace=shared --no-audit --no-fund
COPY --from=shared-build /app/shared shared
COPY server server
RUN npm run prisma:generate --workspace=server
RUN npm run build --workspace=server

# Stage 4: runtime image — only production deps + built output
FROM node:20-slim AS runtime
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production

COPY package.json ./
COPY server/package.json server/
COPY shared/package.json shared/
RUN npm install --workspace=server --workspace=shared --omit=dev --no-audit --no-fund

COPY --from=shared-build /app/shared/dist shared/dist
COPY --from=server-build /app/server/dist server/dist
COPY --from=server-build /app/server/prisma server/prisma
# Must land at the workspace ROOT node_modules, not server/node_modules —
# npm workspaces hoist @prisma/client there, and that's where its generated
# engine (.prisma/client) needs to sit for `new PrismaClient()` to find it.
# (Found by actually running the built image — see docs/phase9-technical-debt.md D2.)
COPY --from=server-build /app/node_modules/.prisma node_modules/.prisma
COPY --from=client-build /app/client/dist client/dist

RUN mkdir -p server/uploads
VOLUME ["/app/server/uploads", "/app/server/prisma"]

EXPOSE 4000
WORKDIR /app/server
# Applies pending migrations before every start — safe to run repeatedly
# (idempotent) and means a fresh volume self-initializes with no manual step.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
