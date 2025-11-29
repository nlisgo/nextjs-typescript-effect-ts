FROM nginx:stable-alpine

COPY out /usr/share/nginx/html

# Copy the nginx configuration file
COPY ../.docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80