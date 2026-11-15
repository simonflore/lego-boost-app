# boostcontrol.flo.re: landing page at /, web app at /app/.
# Coolify: base directory "/", Dockerfile location "/site/Dockerfile".

FROM node:22-alpine AS web
WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps --ignore-scripts --no-audit --no-fund
COPY . .
RUN npx expo export --platform web

FROM nginx:1.27-alpine
COPY site/nginx.conf /etc/nginx/conf.d/default.conf
COPY site/index.html site/privacy.html site/styles.css site/favicon.png site/apple-touch-icon.png site/icon-512.png /usr/share/nginx/html/
COPY --from=web /src/dist /usr/share/nginx/html/app
EXPOSE 80
