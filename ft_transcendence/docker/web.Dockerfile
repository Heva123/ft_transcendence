FROM node:22-bookworm-slim AS frontend-build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
ENV VITE_API_URL=/api
ENV VITE_SOCKET_URL=
RUN npm run build

FROM nginx:1.28-alpine
RUN apk add --no-cache openssl
COPY --from=frontend-build /app/dist /usr/share/nginx/html
COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker/05-local-certificate.sh /docker-entrypoint.d/05-local-certificate.sh
RUN chmod +x /docker-entrypoint.d/05-local-certificate.sh
EXPOSE 80 443
