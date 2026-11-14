# syntax=docker/dockerfile:1
FROM node:22-alpine AS desktop-build
WORKDIR /build
COPY jc-sales-agent-front/ ./
RUN npm ci && npm run build
FROM node:22-alpine AS mobile-build
WORKDIR /build
COPY jc-sales-agent-uniapp/ ./
ENV VITE_API_BASE_URL=/api
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
RUN npm run build:h5
FROM nginx:stable-alpine
COPY deploy/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY deploy/nginx/api-routes.conf /etc/nginx/api-routes.conf
COPY --from=desktop-build /build/dist /usr/share/nginx/html
COPY --from=mobile-build /build/dist/build/h5 /usr/share/nginx/mobile
