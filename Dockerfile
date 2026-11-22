# Public, read-only WompLand brand guide: build the static site, serve it with nginx.
# The editor and the save API exist only under `npm run dev`; this image has neither.

FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Public origin for the absolute links in llms.txt and the markdown pages.
ARG SITE_URL=https://brand.wompland.com
ENV SITE_URL=$SITE_URL
# Regenerates every brand's logos, icons and themes from brands/*.json, gates contrast, then builds dist/.
RUN npm run build

FROM nginx:1.29-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q --spider http://127.0.0.1/ || exit 1
