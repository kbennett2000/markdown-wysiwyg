# syntax=docker/dockerfile:1

# ---- Stage 1: build the static site (all deps + fonts bundled offline) ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
# Use npm ci when a lockfile exists, else fall back to npm install.
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY . .
RUN npm run build

# ---- Stage 2: serve the built assets with nginx ----
FROM nginx:1.27-alpine AS serve
# The nginx image's entrypoint runs envsubst over /etc/nginx/templates/*.template,
# so ${APP_PORT} below is substituted at container start from the env var.
ENV APP_PORT=8080
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
# Base image already defines CMD ["nginx", "-g", "daemon off;"].
