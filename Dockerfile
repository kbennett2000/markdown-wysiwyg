# syntax=docker/dockerfile:1

# ---- Stage 1: build the static site (all deps + fonts bundled offline) ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
# Use npm ci when a lockfile exists, else fall back to npm install.
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY . .
# VITE_GDRIVE_CLIENT_ID is optional and only used by the online-only Drive feature.
ARG VITE_GDRIVE_CLIENT_ID=""
ENV VITE_GDRIVE_CLIENT_ID=${VITE_GDRIVE_CLIENT_ID}
RUN npm run build

# ---- Stage 2: serve the built assets with nginx ----
FROM nginx:1.27-alpine AS serve
# The nginx image's entrypoint runs envsubst over /etc/nginx/templates/*.template,
# so ${APP_PORT} below is substituted at container start from the env var.
ENV APP_PORT=8080
# Optional, runtime-configurable Google OAuth Client ID for the online-only Drive
# feature. Empty by default; set with `docker run -e GDRIVE_CLIENT_ID=…`.
ENV GDRIVE_CLIENT_ID=""
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
# Writes /usr/share/nginx/html/config.js from env vars at container start.
COPY docker/40-mdedit-config.sh /docker-entrypoint.d/40-mdedit-config.sh
RUN chmod +x /docker-entrypoint.d/40-mdedit-config.sh
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
# Base image already defines CMD ["nginx", "-g", "daemon off;"].
