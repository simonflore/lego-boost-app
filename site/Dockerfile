# Static landing page for boostcontrol.flo.re (Coolify: base directory /site)
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html privacy.html styles.css favicon.png apple-touch-icon.png icon-512.png /usr/share/nginx/html/
EXPOSE 80
