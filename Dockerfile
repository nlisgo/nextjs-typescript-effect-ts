FROM node:20-alpine AS builder

FROM nginx:stable-alpine

COPY out /usr/share/nginx/html

RUN <<EOF > /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/index.html $uri.html /index.html;
    }

    location /_next/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    error_page 404 /404.html;
    location = /404.html {
        internal;
    }
}
EOF

EXPOSE 80
