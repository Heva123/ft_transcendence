FROM node:22-bookworm-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci
COPY . .
RUN npx --no-install prisma generate && npm run build

FROM build AS runtime
RUN npm prune --omit=dev && mkdir -p /app/uploads && chown -R node:node /app/uploads
ENV NODE_ENV=production
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
